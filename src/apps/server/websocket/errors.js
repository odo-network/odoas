/* @flow */

import type { WebSocketClient } from './client';

const errors = {
  apikey: client => client.disconnect(403, 'Authentication Failure'),
  sessionID: client => client.disconnect(412, 'Session ID Mismatch'),
  handshake: client => client.disconnect(403, 'Protocol Negotiation Failure'),
};

// Compose a type that matches the generally
// expected signature for any errors:
// (client => {})
type ErrorsType = $ObjMap<typeof errors, <V>(V) => <C: WebSocketClient>(c: C) => Promise<void>>;

export default (errors: ErrorsType);
