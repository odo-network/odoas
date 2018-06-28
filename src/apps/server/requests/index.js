/* @flow */

import type { WS$RequestTypes } from '../types';

import type { WebSocketClient } from '../websocket/client';

import errors from '../websocket/errors';

type RequestHandler = <V, K>(
  K,
) => (request: $ElementType<WS$RequestTypes, K>, client: WebSocketClient) => Promise<*>;

type RequestHandlers = $ObjMapi<WS$RequestTypes, RequestHandler>;

function validateAPIKey(client, request) {
  const { key } = request.payload;
  if (typeof key !== 'string') {
    errors.apikey(client);
    return false;
  }
  return true;
}

export const requests: RequestHandlers = Object.freeze({
  async handshake(request, client) {
    const {
      payload: { version },
    } = request;
    switch (version) {
      case '1.0': {
        if (validateAPIKey(client, request)) {
          client.onHandshake(request);
        }
        break;
      }
      default: {
        errors.handshake(client);
        break;
      }
    }
  },
  async subscribeToMarket(request, client) {
    console.log(request, client);
  },
});

export default async function handleClientRequest<R: $Values<WS$RequestTypes>, C: WebSocketClient>(
  request: R,
  client: C,
) {
  const { method } = request;

  if (requests[method]) {
    // Flow cant handle this type of dynamic assignment although
    // all other parts are properly typed
    // $FlowFixMe
    requests[method](request, client);
  } else {
    throw new TypeError(`Invalid Method ${request.method}`);
  }
}
