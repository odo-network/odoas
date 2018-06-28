/* @flow */
/*
  By utilizing Redis PubSub we can communicate throughout our cluster
*/
import LOG from '../log';
import { createRedisChannel } from './channel';

export type odows$IPCReceivePayload = {};

type MessageCallback = <P: Object>(payload: P) => void;

let chan;

/**
 * Sends a IPC Request through the Redis PubSub Channel designated
 * @param {Object} message
 * @param {string} [channel='plugin:ipc:worker']
 * @returns
 */
function sendIPCRequest(data: Object, channel?: string = 'plugin:ipc:worker') {
  if (!chan) {
    throw new Error('IPC Channel not Setup - Failed to Send IPC Request');
  }

  if (!data || !data.method) {
    throw new TypeError('All IPC Requests must have a method property');
  }
  // return chan.tx.publish(
  //   channel,
  //   JSON.stringify({
  //     id: data.id,
  //     client: data.client,
  //     api: data.api,
  //     method: data.method,
  //     params: data.params,
  //     payload: data.payload,
  //   }),
  // );
  return chan.tx.publish(channel, JSON.stringify(data));
}

/**
 * When a matching IPC Request is received, we need to parse the payload and
 * route the request to the subscriber.
 * @param {string} channel
 * @param {string} pattern
 * @param {string} _payload
 * @returns {(Promise<void | Object>)}
 */
async function handleReceiveMessage(
  channel: string,
  pattern: string,
  _payload: string,
): Promise<void | Object> {
  if (process.env.NODE_ENV !== 'production') {
    LOG('IPC MESSAGE: ', channel, pattern, _payload);
  }
  let data: $Exact<Object>;
  try {
    data = JSON.parse(_payload);
  } catch (e) {
    console.error('Failed to Parse IPC Request: ', e);
    return;
  }
  if (!data || !data.method) {
    return;
  }
  return {
    ...data,
    params: {
      channel,
      pattern,
      ...(data.params || {}),
    },
  };
}

/**
 * Starts a subscription and calls the onMessage callback whenever a match
 * is found.
 * @param {String} pattern
 * @param {MessageCallback} onMessage
 */
function startIPCSubscription(pattern: string, onMessage: MessageCallback) {
  startIPCChannel();
  chan.rx.on('pmessage', (p: string, c: string, _payload: string) => handleReceiveMessage(c, p, _payload)
    .then(m => m && onMessage(m))
    .catch((err: Error) => {
      LOG(
        '[ERROR] | [IPC] | An Error occurred while processing an IPC Message: ',
        c,
        _payload,
        err,
      );
    }));
  // subscribe to all ipc messages.
  // ipc:request
  // ipc:response
  // ipc:event
  chan.rx.psubscribe(pattern);
}

function startIPCChannel() {
  if (!chan) {
    chan = createRedisChannel('plugin:ipc');
  }
}

export { startIPCSubscription, sendIPCRequest, startIPCChannel };
