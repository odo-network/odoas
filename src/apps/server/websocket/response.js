/* @flow */
import type { WS$ResponseTypes, WS$RequestTypes, WS$ResponseHeader } from '../types';

import type { WebSocketClient } from './client';

function commonResponseFields(client, request): WS$ResponseHeader {
  return {
    result: 'success',
    rid: request.rid,
    sid: client.props.identity,
  };
}

const responses = {
  handshake: (client, request) => Object.freeze({
    ...commonResponseFields(client, request),
    method: 'handshake',
  }),
  subscribeToMarket: (client, request) => Object.freeze({
    ...commonResponseFields(client, request),
    method: 'subscribeToMarket',
  }),
};

type ResponsesType = $ObjMapi<
  typeof responses,
  <V, K>(
    V,
    K,
  ) => (
    client: WebSocketClient,
    request: $ElementType<WS$RequestTypes, V>,
  ) => $ElementType<WS$ResponseTypes, V>,
>;

export default (responses: ResponsesType);
