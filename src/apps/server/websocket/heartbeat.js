/* @flow */
import { getAllClients } from '../context/maps';
import errors from './errors';

/*
  WebSocket Heartbeat is a globally running interval event which monitors for
  unhealthy sessions which have not been responding to ping requests for a given
  time.

  Upon each ${HEATBEAT_INTERVAL}, each client is checked to see if it has
  marked the ${state.connection.isAlive} property to "true."  If it hasn't
  then we terminate the connection.

  We ping the client at the end of each check.
*/
// How long should we allow a client to respond before disconnecting them?
let HEARTBEAT_INTERVAL = 60000;
let HEARTBEAT_ID;

function heartbeat() {
  getAllClients().forEach(client => {
    const { ws, identity } = client.props;
    if (!ws) {
      console.error('[ERROR] | Client Persisted In IdentityMaps after Disconnect ', identity);
      return client.removeIdentity();
    }
    if (client.state.isAlive === false) return ws.terminate();
    if (!client.state.handshaked && Date.now() - client.state.created >= 30000) {
      errors.handshake(client);
      return;
    }
    client.state.isAlive = false;
    ws.ping(identity);
  });
}

/**
 * Starts the WebSocket heartbeat timer which is used to
 * monitor active connections and validate they are responding
 * to our `ping` messages.
 * @export
 */
export function startWebSocketHeartbeat() {
  clearInterval(HEARTBEAT_ID);
  HEARTBEAT_ID = setInterval(heartbeat, HEARTBEAT_INTERVAL);
  return HEARTBEAT_INTERVAL;
}

/**
 * Stops the WebSocket heartbeat timer.
 * @export
 */
export function stopWebSocketHeartbeat() {
  clearInterval(HEARTBEAT_ID);
  return HEARTBEAT_INTERVAL;
}

/**
 * Sets the WebSocket heartbeat timer to the given interval
 * @export
 * @param {number} n The time, in ms, that our heartbeat interval should be set to
 * @returns {number} Returns new heartbeat interval
 * @throws {TypeError} When no argument is provided, throws TypeError
 */
export function setWebSocketHeartbeatInterval(n: number) {
  if (typeof n === 'number') {
    HEARTBEAT_INTERVAL = n;
    return startWebSocketHeartbeat();
  }
  throw new TypeError(
    `Expected a number representing new WebSocket Heartbeat Interval but got ${typeof n}`,
  );
}
