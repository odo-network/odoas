/* @flow */
import type { WS$RouteType } from '../../types';

import errors from '../../websocket/errors';

type RequestPayload = {|
  +version: '1.0',
  +type?: 'client',
  +key: string,
|};

function validateAPIKey(client, request) {
  const { key } = request.payload;
  if (typeof key !== 'string') {
    errors.apikey(client);
    return false;
  }
  // ! NEED TO RUN API KEY VALIDATION !
  console.warn('WARNING: NOT VALIDATING API KEYS AT THIS TIME');
  return true;
}

const route: WS$RouteType<'handshake', RequestPayload> = {
  method: 'handshake',
  validate: {
    version: (v: '1.0') => v === '1.0',
    type: (v?: void | 'client') => v === undefined || v === 'client',
    key: (v: string) => typeof v === 'string',
  },
  onRequest: async function handleHandshakeRequest(request, client) {
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
};

export default route;
