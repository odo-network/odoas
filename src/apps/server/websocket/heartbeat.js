/* @flow */
/** Heartbeat for the Websocket to run pings against connected clients to confirm their connectivity. */
import { getAllClients, removeIdentities } from '../context/maps';

// How long should we allow a client to respond before disconnecting them?
let HEARTBEAT_INTERVAL = 60000;
let HEARTBEAT_ID;

function heartbeat() {
  getAllClients().forEach(client => {
    const { ws, identity } = client.props;
    const { connection, identities } = client.state;
    if (!ws) {
      console.error('Client Persisted In IdentityMaps after Disconnect ', identity);
      removeIdentities(
        {
          identity,
          ...identities,
        },
        client,
      );
      return;
    }
    if (connection.isAlive === false) return ws.terminate();
    connection.isAlive = false;
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
