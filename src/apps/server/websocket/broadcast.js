/* @flow */
import type { WS$IdentityMaps, WS$ResponseTypes } from '../types';
import { WebSocketClient } from './client';
import { IdentityMaps } from '../context/maps';

/**
 * Broadcasts a payload to all matching clients.  If the payload has a params.route object, it will only broadcast
 * the payload to matching clients, if found.
 *
 * ? Rules:
 *  1. If params.route is not defined...
 *    a. If payload.client is defined, send as reply to client if found
 *    b. Otherwise, broadcast to all clients
 *  2. If params.route is defined...
 *    a. Iterate params.route object and obtain the values of each.
 *      a1. If the value is a string - search the IdentityMap for the value
 *      a2. If the value is an array - search IdentityMap for all values
 *      a3. If the value is true - sends to all
 *  3. Finally - broadcast payload to all matching clients.
 *
 * * Multiple clients may match a value if they have both registered for a given Identity.
 * @exports default
 * @param {$Values<WS$ResponseTypes>} payload
 */
export function broadcastEvent(payload: $Values<WS$ResponseTypes>) {
  return payload;
}

/**
 * Takes route type and iterates through the request payload object.  Expects
 * the payload is an object of keys matching route keys and their values are
 * a payload to send.
 * @param {$Keys<WS$IdentityMaps>} routeType
 * @param {$Values<WS$ResponseTypes>} request
 */
export function broadcastToMatchingRoutes(
  routeType: $Keys<WS$IdentityMaps>,
  request: $Values<
    $Diff<WS$ResponseTypes, {| handshake: $ElementType<WS$ResponseTypes, 'handshake'> |}>,
  >,
) {
  const map = IdentityMaps[routeType];
  if (!map) return;
  const { payload } = request;
  if (typeof payload === 'object') {
    for (const route of Object.keys(payload)) {
      const match = map.get(route);
      const clientPayload = payload[route];
      if (match instanceof WebSocketClient) {
        match.send(clientPayload);
      } else if (match) {
        match.forEach(client => client.send(clientPayload));
      }
    }
  }
}
