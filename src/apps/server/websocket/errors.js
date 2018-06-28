/* @flow */
// eslint-disable-next-line import/no-cycle
import type { WebSocketClient } from './client';

const errors = {
  handshake: client => client.disconnect(403, 'Protocol Negotiation Failure'),
  sessionID: client => client.disconnect(412, 'Session ID Mismatch'),
  apikey: client => client.disconnect(403, 'Authentication Failure'),
};

type ErrorsType = $ObjMap<typeof errors, <V>(V) => <C: WebSocketClient>(c: C) => Promise<void>>;

export default (errors: ErrorsType);
