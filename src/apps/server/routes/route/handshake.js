/* @flow */
import type { WS$RouteType, WS$Request$Handshake } from '../../types';
import { getAPIKey } from '../../utils/identity';

import errors from '../../websocket/errors';

function validateAPIKey(client, payload) {
  const { key } = payload;
  if (typeof key !== 'string') {
    errors.apikey(client);
    return false;
  }
  // ! NEED TO RUN API KEY VALIDATION !
  console.warn('WARNING: NOT VALIDATING API KEYS AT THIS TIME');
  return true;
}

const route: WS$RouteType<'handshake', WS$Request$Handshake> = {
  method: 'handshake',
  onValidate: function handleValidateHandshake(request) {
    if (typeof request.payload === 'string') {
      request.payload = JSON.parse(request.payload);
    }
  },
  onRequest: async function handleHandshakeRequest(request, client) {
    const { payload } = request;
    switch (payload.version) {
      case '1.0': {
        if (validateAPIKey(client, payload)) {
          client.onHandshake({
            ...request,
            payload: {
              ...request.payload,
              key: getAPIKey(request.payload.key),
            },
          });
        }
        break;
      }
      default: {
        errors.handshake(client);

        break;
      }
    }
  },
  onResponse: function handleHandshakeResponse() {},
};

export default route;
