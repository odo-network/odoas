/* @flow */
import type { WS$ServerDescriptor } from '../server';

import LOG from '../utils/log';
import startWebSocketConnection from './client';

/**
 * Registers the WebSocket Server callbacks and conducts any
 * intermediary steps.
 * @param {WS$ServerDescriptor} descriptor
 *  @prop {UWebSocket} WS
 */
function registerWebSocketCallbacks({ WS }: WS$ServerDescriptor) {
  LOG('[DATSTREAM READY] | Datastream Server Listening on port', process.env.PORT);
  /*
    Our Websocket Server standard events.  This will handle the lifecycle of the
    connection by creating events to handle the open, close, and message received
    events from a client.  We will forward these into the Client class so they
    can be handled properly.
  */
  WS.on('connection', startWebSocketConnection);
}

export default registerWebSocketCallbacks;
