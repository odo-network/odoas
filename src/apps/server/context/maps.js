/* @flow */

import LOG from '../utils/log';

import type { WS$ClientSessionID } from '../types';

import type { WebSocketClient } from '../websocket/client';

import { connectedUsers } from '../metrics/connectedUsers';

/**
 * IdentityMaps is used to store references to active connections
 */
const IdentityMap: Map<WS$ClientSessionID, WebSocketClient> = new Map();

/**
 *  Each client registers to have their unique Session ID added to the
 *  IdentityMap.  This servers as a way of maintaining active tracking
 *  of all currently active clients.
 * @param {WS$ClientSessionID} identities
 * @param {WebSocketClient} client
 * @returns {WebSocketClient}
 */
function setIdentities<+I: WS$ClientSessionID, +C: WebSocketClient>(identity: I, client: C): C {
  if (IdentityMap.has(identity) && IdentityMap.get(identity) !== client) {
    throw new Error(`Identity Collission Occurs for: ${identity}`);
  }

  IdentityMap.set(identity, client);

  connectedUsers.set(IdentityMap.size);

  if (process.env.NODE_ENV !== 'production') {
    LOG(`New Client Added - Total Clients at ${IdentityMap.size}`);
  }

  return client;
}

/**
 * When the client disconnects or is removed for any reason, we need to clean it up
 * from the IdentityMap. This method will remove the values from each IdentityMap
 * so that we do not accidentally attempt to send events to the wrong destination.
 * @param {$Shape<WS$ClientIdentities>} identities
 * @param {WebSocketClient} client
 * @returns {WebSocketClient}
 */
function removeIdentities<+I: WS$ClientSessionID, +C: WebSocketClient>(identity: I, client: C): C {
  if (IdentityMap.has(identity) && IdentityMap.get(identity) === client) {
    IdentityMap.delete(identity);

    connectedUsers.set(IdentityMap.size);

    if (process.env.NODE_ENV !== 'production') {
      LOG(`Client Disconected - Total Clients at ${IdentityMap.size}`);
    }
  }

  return client;
}

function getAllClients() {
  return IdentityMap;
}

export { setIdentities, removeIdentities, getAllClients };
