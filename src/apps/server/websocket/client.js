/* @flow */

import type {
  WS$RawRequest,
  WS$ClientProps,
  WS$ClientState,
  WS$ErrorResponse,
  WS$ClientIdentities,
  WS$RequestTypes,
  WS$ResponseTypes,
} from '../types';

import { getClientSessionID, getRequestID } from '../utils/identity';

import { setIdentities, removeIdentities } from '../context/maps';

import LOG from '../utils/log';
import { trimLeft } from '../utils/string';

import errors from './errors';
import response from './response';

import handleRequest, { requests } from '../requests';

/**
 * When a new WebSocket Client initially connects we capture data from
 * the socket and create a client state object.  This state is only meant
 * to manage the lifecycle of a websocket client and is not used outside
 * of this purpose.
 * @param {uws.Connection} ws
 * @param {WebSocketClient} client
 */
function getClientInitialState(ws, client): WS$ClientState {
  const sock = ws._socket;
  const { remotePort, remoteAddress } = sock;
  const { servername } = ws.upgradeReq.connection;

  const ip = remoteAddress ? trimLeft(remoteAddress, '::ffff:') : 'unknown';

  return {
    ip, // What is the clients Public IP?
    servername, // What is the clients servername ?
    log: process.env.NODE_ENV !== 'production' || process.env.LOGGING === true,
    // Headers to be tagged with any HTTP Requests that
    // we forward.
    headers: {
      '$WS-Identity': client.props.identity,
      '$WS-Server-Name': servername,
      '$WS-Remote-Address': ip,
      '$WS-Remote-Port': String(remotePort),
    },
    connection: {
      isAlive: true,
      connected: true,
      handshaked: false,
      disconnecting: false,
      created: Date.now(),
    },
    /* An object describing any identity values
       associated with a given Websocket Client. */
    identities: {},
  };
}

function getRequest(client: WebSocketClient, request: WS$RawRequest): $Values<WS$RequestTypes> {
  if (!requests[request.method]) {
    throw new TypeError(`Invalid Request Method ${request.method}`);
  }
  const parsedRequest = {
    rid: getRequestID(request),
    sid: client.props.identity === request.sid ? client.props.identity : undefined,
    method: request.method,
    payload: JSON.parse(request.payload),
  };
  // Without explicitly parsing every single possible request completely
  // this will be near impossible to type properly.  Ignore for now
  // $FlowFixMe
  return parsedRequest;
}

/**
 * Whenever a request is received, we call this function once it is parsed to verify
 * that the request meets the basic expected shape of a propertly formatted request.
 *
 * @throws {Error} Throws "Invalid Request Received: ${request.method}" when invalid.
 * @returns {boolean} Returns false if the request should be ignored but will handle the failure itself (do nothing).
 */
function verifyRequest<+R: WS$RawRequest>(client: WebSocketClient, request: R): boolean {
  if (!request || !request.method || !request.payload) {
    throw new Error(`Invalid Request Received: ${request.method}`);
  } else if (typeof request.method !== 'string') {
    // only allowed to send string methods and must be defined for all requests
    throw new TypeError(`Invalid Method Received: ${typeof request.method}`);
  } else if (!client.state.connection.handshaked && request.method !== 'handshake') {
    // before a client can do anything, they must handshake with the server
    errors.handshake(client);
    return false;
  } else if (
    client.state.connection.handshaked
    && (!request.sid || request.sid !== client.props.identity)
  ) {
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
  props: WS$ClientProps = {
    identity: getClientSessionID(),
    ws: undefined,
  };

  state: WS$ClientState;

  constructor(ws: UWebSocket) {
    this.props.ws = ws;
    this.state = getClientInitialState(ws, this);
    this.setIdentity('identity', this.props.identity);
  }

  /**
   * Returns information that can be used to
   * describe a given client (identity, ip, etc)
   *
   * @memberof WebSocketClient
   */
  describe = () => process.env.NODE_ENV === 'production'
    ? {
      ip: this.state.ip,
      servername: this.state.servername,
    }
    : {
      type: this.state.type,
      version: this.state.version,
      identity: this.props.identity,
      ip: this.state.ip,
      servername: this.state.servername,
      identities: this.state.identities,
    };

  log = (...msgs: mixed[]) => {
    LOG(this.describe(), ...msgs);
  };

  /**
   * Is the WebSocketClient connected?
   * @memberof WebSocketClient
   */
  isConnected = () => {
    if (
      !this.props.ws
      || !this.state.connection
      || this.state.connection.disconnecting
      || !this.state.connection.connected
      || !this.state.connection.isAlive
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
    const { connection } = this.state;
    if (!ws) {
      await this.handleCleanup();
      return;
    }
    if (!connection.connected || connection.disconnecting === true) {
      // If we are not connected or waiting for a connection to terminate then
      // this will do nothing.  kill() should be used instead to force things
      return;
    }
    // TODO: Consider looking into redundancy check to confirm client is removed properly after timeout period.
    connection.disconnecting = true;
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
    const { connection } = this.state;
    connection.disconnecting = true;
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
  send = (data: $Values<WS$ResponseTypes> | WS$ErrorResponse) => {
    const { ws } = this.props;
    let str: string;

    if (!data || !ws) {
      LOG('[ERROR] | [WebSocket Session Send] | Session closed or empty data received: ', data);
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
        err => err
          && LOG(
            `! -- | ERROR Sending to: ${this.props.identity} (WebSocketSession) `,
            err.message,
            this.state.identities,
          ),
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
    let request: $Values<WS$RequestTypes>;
    try {
      const rawRequest: WS$RawRequest = JSON.parse(msg);
      if (!verifyRequest(this, rawRequest)) {
        return;
      }
      request = getRequest(this, rawRequest);
    } catch (e) {
      return this.handleError(e, request);
    }
    handleRequest(
      /* Dispatch the request to be parsed */
      request,
      this,
    ).catch((err: Error) => this.handleError(err, request));
  };

  /**
   * Registered as the on('error') ws handler.
   * @memberof WebSocketClient
   */
  handleError = (error: Error, request?: $Values<WS$RequestTypes>) => {
    console.error(
      '[ERROR] | [WEBSOCKET] | A CLIENT ERROR OCCURRED WITH: ',
      this.state.identities,
      error,
      request,
    );
    const payload: WS$ErrorResponse = {
      result: 'error',
      payload: {
        message: error.message,
      },
    };
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
      this.state.connection.isAlive = true;
    }
  };

  /**
   * Registered as the on('close') ws handler.
   * @memberof WebSocketClient
   */
  handleClose = (/* code, reason */) => {
    this.props.ws = undefined;
    this.state.connection.connected = false;
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
  setIdentity = (type: $Keys<WS$ClientIdentities>, identity: $Values<WS$ClientIdentities>) => {
    switch (type) {
      /* Only handled identities will be accepted */
      case 'identity': {
        break;
      }
      default: {
        throw new Error(`[ERROR] | [WebSocketClient] | Invalid Set Identity Type: ${type}`);
      }
    }
    this.setState({
      identities: {
        ...this.state.identities,
        [type]: identity,
      },
    });
    setIdentities({ [type]: identity }, this);
    return this;
  };

  removeIdentity = (type: $Keys<WS$ClientIdentities>, identity: $Values<WS$ClientIdentities>) => {
    switch (type) {
      /* Only handled identities will be accepted */
      case 'identity': {
        break;
      }
      default: {
        throw new Error(`[ERROR] | [WebSocketClient] | Invalid Set Identity Type: ${type}`);
      }
    }
    const { [type]: removedIdentity, ...identities } = this.state.identities;
    this.setState({
      identities,
    });
    removeIdentities({ [type]: identity }, this);
    return this;
  };

  handleCleanup = () => {
    if (Object.keys(this.state.identities).length === 0 && !this.props.ws) {
      return this;
    }
    if (this.state.subscription) {
      this.state.subscription.cancel();
    }
    removeIdentities(this.state.identities, this);
    this.setState({
      connection: {
        ...this.state.connection,
        isAlive: false,
        connected: false,
      },
      subscription: undefined,
      identities: {},
    });
    this.props.ws = undefined;
    return this;
  };

  onHandshake = (request: $ElementType<WS$RequestTypes, 'handshake'>) => {
    this.setState({
      version: request.payload.version,
      connection: {
        ...this.state.connection,
        handshaked: true,
      },
    });
    this.send(response.handshake(this, request));
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
