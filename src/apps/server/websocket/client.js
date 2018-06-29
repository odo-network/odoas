/* @flow */

import type {
  WS$ClientProps,
  WS$ClientState,
  WS$ErrorResponse,
  WS$Request,
  WS$RouteRequest,
  WS$Request$Handshake,
  WS$RouteType,
  WS$SuccessResponse,
} from '../types';

import { getClientSessionID, getRequestID } from '../utils/identity';

import { setIdentities, removeIdentities } from '../context/maps';

import LOG from '../utils/log';
import { trimLeft } from '../utils/string';

import errors from './errors';

import handleRequest, { hasRoute, handleCleanupClientFromRoutes } from '../routes';

/**
 * When a new WebSocket Client initially connects we capture data from
 * the socket and create a client state object.  This state is only meant
 * to manage the lifecycle of a websocket client and is not used outside
 * of this purpose.
 */
function getClientInitialState(): WS$ClientState {
  return {
    log: process.env.NODE_ENV !== 'production' || process.env.LOGGING === true,
    isAlive: true,
    connected: true,
    handshaked: false,
    disconnecting: false,
    created: Date.now(),
  };
}

/**
 * Whenever a request is received, we call this function once it is parsed to verify
 * that the request meets the basic expected shape of a propertly formatted request.
 *
 * @throws {Error} Throws "Invalid Request Received: ${request.method}" when invalid.
 * @returns {boolean} Returns false if the request should be ignored but will handle the failure itself (do nothing).
 */
function verifyRequest<+R: WS$Request>(client: WebSocketClient, request: R): boolean {
  if (!request || !request.method) {
    throw new Error(`Invalid Request Received: ${request.method}`);
  } else if (!client.state.handshaked && request.method !== 'handshake') {
    // before a client can do anything, they must handshake with the server
    errors.handshake(client);
    return false;
  } else if (typeof request.method !== 'string' || !hasRoute(request.method)) {
    // only allowed to send string methods and must be defined for all requests
    throw new TypeError(`Invalid Method Received: ${request.method}`);
  } else if (!request.payload) {
    throw new Error(`Invalid Payload for method ${request.method}`);
  } else if (client.state.handshaked && (!request.sid || request.sid !== client.props.identity)) {
    // when an invalid sid value is provided, the client is disconnected and the client
    // is expected to re-connect to refresh the identity
    errors.sessionID(client);
    return false;
  }

  return true;
}
/**
 * Implements the core WebSocket event subscriptions.  It extends
 * our {WebSocketClient} which include additional methods for
 * operating on the clients data.
 *
 * @class WebSocketClient
 */
export class WebSocketClient {
  props: WS$ClientProps;

  state: WS$ClientState = getClientInitialState();

  constructor(ws: UWebSocket) {
    const sock = ws._socket;
    const { remotePort, remoteAddress } = sock;
    const { servername } = ws.upgradeReq.connection;
    const ip = remoteAddress ? trimLeft(remoteAddress, '::ffff:') : 'unknown';
    this.props = {
      identity: getClientSessionID(),
      ip,
      ws,
      servername,
      remotePort,
      key: undefined,
    };
    this.setIdentity();
  }

  /**
   * Returns information that can be used to
   * describe a given client (identity, ip, etc)
   *
   * @memberof WebSocketClient
   */
  describe = () => process.env.NODE_ENV === 'production'
    ? {
      ip: this.props.ip,
      servername: this.props.servername,
    }
    : {
      type: this.state.type,
      version: this.state.version,
      identity: this.props.identity,
      ip: this.props.ip,
      servername: this.props.servername,
    };

  log = (...msgs: mixed[]) => {
    LOG(...msgs, this.describe());
  };

  /**
   * Is the WebSocketClient connected?
   * @memberof WebSocketClient
   */
  isConnected = () => {
    if (
      !this.props.ws
      || this.state.disconnecting
      || !this.state.connected
      || !this.state.isAlive
    ) {
      return false;
    }
    return true;
  };

  /**
   * Disconnect the WebSocket and remove the client from our context maps.
   * @param {number} code Optionally provide a disconnect code to dispatch to client
   * @param {string} reason Optionall provide a string to dispatch to client
   * @memberof WebSocketClient
   */
  disconnect = async (code?: number, reason?: string) => {
    const { ws } = this.props;
    if (!ws) {
      await this.handleCleanup();
      return;
    }
    if (!this.state.connected || this.state.disconnecting === true) {
      // If we are not connected or waiting for a connection to terminate then
      // this will do nothing.  kill() should be used instead to force things
      return;
    }
    // TODO: Consider looking into redundancy check to confirm client is removed properly after timeout period.
    this.state.disconnecting = true;
    ws.close(code, reason);
  };

  /**
   * Terminate the WebSocket Client immediately, cleaning up the
   * client and using ws.terminate() rather than ws.close()
   *
   * @memberof WebSocketClient
   */
  kill = async () => {
    const { ws } = this.props;
    this.state.disconnecting = true;
    await this.handleCleanup();
    if (!ws) {
      return;
    }
    ws.terminate();
  };

  /**
   * Sends a payload to the client
   * @param {Object} data
   * @memberof WebSocketClient
   */
  send = (data: WS$SuccessResponse | WS$ErrorResponse) => {
    const { ws } = this.props;
    let str: string;

    if (!data || !ws) {
      this.log(
        '[ERROR] | [WebSocket Session Send] | Session closed or empty data received: ',
        data,
      );
      return this;
    }

    // if (data.payload && typeof data.payload !== 'string') {
    //   data.payload = JSON.stringify(data.payload);
    // }

    if (typeof data !== 'string') {
      str = JSON.stringify(data);
    } else {
      str = data;
    }

    if (typeof str === 'string') {
      ws.send(
        str,
        error => error
          && LOG('[ERROR] | A CLIENT ERROR OCCURRED DURING SEND', data, this.describe(), error),
      );
    }

    return this;
  };

  /**
   * Registered as the on('message') ws handler.
   * @memberof WebSocketClient
   */
  handleMessage = (msg: string) => {
    if (!msg) return;

    let request: WS$Request;

    try {
      request = JSON.parse(msg);
      if (!verifyRequest(this, request)) {
        return;
      }
      const rid = getRequestID(request);
      request = {
        rid,
        sid: this.props.identity,
        method: request.method,
        payload: request.payload,
      };
    } catch (e) {
      return this.handleError(e, request);
    }

    /* Reset the isAlive value when valid request received */
    this.handlePong(this.props.identity);

    handleRequest(
      /* Dispatch the request to be parsed */
      request,
      this,
    ).catch((error: Error) => this.handleError(error, request));
  };

  async handleResponse<M: string, P>(request: WS$RouteRequest<M, P>, route: WS$RouteType<M, P>) {
    const response: WS$SuccessResponse = {
      result: 'success',
      sid: this.props.identity,
      rid: request.rid,
      method: request.method,
    };
    if (typeof route.onResponse === 'function') {
      const payload = await route.onResponse(request, this);
      if (typeof payload === 'object') {
        response.payload = payload;
      }
    }
    this.send(response);
  }

  /**
   * Registered as the on('error') ws handler.
   * @memberof WebSocketClient
   */
  handleError = (error: Error, request?: WS$Request) => {
    LOG(
      '[ERROR] | [WEBSOCKET] | A CLIENT ERROR OCCURRED DURING REQUEST',
      request,
      this.describe(),
      error,
    );
    const payload: WS$ErrorResponse = {
      result: 'error',
      payload: {
        message: error.message,
      },
    };
    if (this.state.handshaked) {
      payload.sid = this.props.identity;
    }
    if (request) {
      Object.assign(payload, {
        rid: request.rid,
        method: request.method,
      });
    }
    this.send(payload);
  };

  /**
   * Registered as the on('pong') ws handler
   * @memberof WebSocketClient
   */
  handlePong = (msg?: mixed) => {
    if (msg === this.props.identity) {
      this.state.isAlive = true;
    }
  };

  /**
   * Registered as the on('close') ws handler.
   * @memberof WebSocketClient
   */
  handleClose = (/* code, reason */) => {
    this.props.ws = undefined;
    this.state.connected = false;
    this.handleCleanup();
  };

  /**
   * Merges the given state into clients `this.state`
   * @param {$Shape<WS$ClientState} [state={}] The state to merge into the client state.
   * @memberof WebSocketClient
   */
  setState = (state: $Shape<WS$ClientState> = {}) => {
    Object.assign(this.state, state);
    return this;
  };

  /**
   * Sets an identity value on the appropriate context mapping so that we
   * can handle routes for the given key when needed.
   */
  setIdentity = () => setIdentities(this.props.identity, this);

  /**
   * Removes a given identity from the Application context maps and
   * subscriptions.
   *
   * @memberof WebSocketClient
   */
  removeIdentity = () => removeIdentities(this.props.identity, this);

  /**
   * Called when the client should be cleaned up (upon disconnection or
   * an upcoming process restart).  Cleans the client from any subscriptions
   * or datastores.
   *
   * @memberof WebSocketClient
   */
  handleCleanup = async () => {
    if (!this.props.ws) {
      this.removeIdentity();
      return;
    }
    try {
      // Remove our identifies from any context maps.
      this.removeIdentity();

      // Cancel any PubChan Subscriptions if we have subscribed.
      await handleCleanupClientFromRoutes(this);
    } catch (error) {
      LOG('An Error Occurred During Client Cleanup of Identity: ', this.describe(), error);
    } finally {
      // Set the state to show we have disconnected properly.
      Object.assign(this.state, {
        isAlive: false,
        connected: false,
      });
      this.props.ws = undefined;
    }
  };

  /**
   * Called when the client successfully handshakes with the
   * server.
   *
   * @memberof WebSocketClient
   */
  onHandshake = (request: WS$RouteRequest<'handshake', WS$Request$Handshake>) => {
    const { payload } = request;
    this.props.key = payload.key;
    Object.assign(this.state, {
      type: payload.type,
      version: payload.version,
      isAlive: true,
      connected: true,
      handshaked: true,
    });
  };
}

/**
 * Registers any WebSocket events for a client.  Called
 * after instatiation by {startWebSocketConnection}
 * @param {UWebSocket} ws
 * @param {WebSocketClient} client
 */
function registerCallbacks(ws, client) {
  ws.on('message', client.handleMessage);
  ws.on('close', client.handleClose);
  ws.on('error', client.handleError);
  ws.on('pong', client.handlePong);
}

/**
 * Creates an instance of WebSocketClient and registers callbacks for them. This is
 * registered as the callback for uws.Server.on('connection');
 * @param {UWebSocket} ws
 */
function startWebSocketConnection(ws: UWebSocket) {
  const client = new WebSocketClient(ws);
  /* Register WebSocket Event Listeners */
  registerCallbacks(ws, client);
}

export default startWebSocketConnection;
