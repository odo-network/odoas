/* @flow */

import LOG from '../utils/log';

import type { WS$IdentityMaps, WS$ClientIdentities } from '../types';

import type { WebSocketClient } from '../websocket/client';

import { connectedUsers } from '../metrics/connectedUsers';
import getMapMetrics from '../metrics/contextMaps';

/**
 * IdentityMaps is used to store references to active connections
 */
const IdentityMaps: WS$IdentityMaps = Object.freeze({
  // Map by Websocket Identity
  identity: new Map(),
});

/**
 *  When we receive identities from the API Requests a system will make
 *  this will be called.  It is an async function allowing the request to be
 *  returned to the client before this is handled.  It will save our identities
 *  to the appropriate IdentityMaps so we can quickly identify the client we want
 *  to send various events to.
 * @param {$Shape<WS$ClientIdentities>} identities
 * @param {WebSocketClient} client
 * @returns {WebSocketClient}
 */
function setIdentities<+I: $Shape<WS$ClientIdentities>, +C: WebSocketClient>(
  identities: I,
  client: C,
): C {
  if (!identities) {
    return client;
  }

  Object.keys(identities).forEach(type => {
    switch (type) {
      case 'identity': {
        const identity = identities[type];
        IdentityMaps[type].set(identity, client);
        if (type === 'identity') {
          connectedUsers.set(IdentityMaps.identity.size);
        }
        if (process.env.NODE_ENV !== 'production') {
          LOG(`New Client Added - Total Clients at ${IdentityMaps[type].size}`);
        }
        break;
      }
      default: {
        throw new TypeError(`Unknown Identity Type ${type}`);
      }
    }
    // record the size of the map each time it changes
    getMapMetrics()[type].set(IdentityMaps[type].size);
  });

  return client;
}

/**
 * When the client disconnects or is removed for any reason, we need to clean it up
 * from the IdentityMaps. This method will remove the values from each IdentityMap
 * so that we do not accidentally attempt to send events to the wrong destination.
 * @param {$Shape<WS$ClientIdentities>} identities
 * @param {WebSocketClient} client
 * @returns {WebSocketClient}
 */
function removeIdentities<+I: $Shape<WS$ClientIdentities>, +C: WebSocketClient>(
  identities: I,
  client: C,
): C {
  if (!identities) {
    return client;
  }

  Object.keys(identities).forEach(type => {
    switch (type) {
      case 'identity': {
        const identity = identities[type];
        const _client = IdentityMaps[type].get(identity);
        if (client === _client) {
          IdentityMaps[type].delete(identity);
          if (type === 'identity') {
            connectedUsers.set(IdentityMaps.identity.size);
          }
        }
        break;
      }
      default: {
        throw new TypeError(`Unknown Identity Type ${type}`);
      }
    }
    // record the size of the map each time it changes
    getMapMetrics()[type].set(IdentityMaps[type].size);
  });

  if (process.env.NODE_ENV !== 'production') {
    LOG(
      `New Client Removed - Total Clients at ${Object.keys(IdentityMaps)
        .map(k => `${k}: ${IdentityMaps[k].size} | `)
        .join(' ')}`,
    );
  }
  return client;
}

function getAllClients() {
  return IdentityMaps.identity;
}

function getIdentityMaps() {
  return IdentityMaps;
}

export {
  IdentityMaps, setIdentities, removeIdentities, getAllClients, getIdentityMaps,
};
