/* @flow */
// import type { Subscriber } from 'pubchan';
import registry from 'pubchan/registry';
import type { WS$ResponseTypes } from '../types';
import type { WebSocketClient } from '../websocket/client';

const chan = createPubChan();

const subscriptions = new WeakMap();

/*
  Pubchan System can be utilized to allow subscriptions to specific markets rather than
  spamming all payloads to all clients.  In order for this to work, the client will need
  to inform the server which market it is interested in receiving updates from.

  When a subscription occurs, it should call subscribeToChannels(client, MARKET)

  so subscribeToChannels(client, 'ETH_REN');

  Multiple channels are allowed and any previous channels subscribed using this
  process will be cancelled upon registering a new subscription.

  When we want to broadcast a payload to all the listeners of a market we can do so
  by calling `sendToChannels`

  sendToChannels({ method: 'myMethod' }, 'ETH_REN');

  All subscribed clients will be sent the payload automatically.
*/

if (process.env.NODE_ENV !== 'production') {
  // log all channel emissions when not in productions
  chan
    .subscribe()
    .to('$all', '$close')
    .do((ref, ids, payload) => {
      if (ids.has('$close')) {
        console.log('Channel Closed!');
      } else {
        console.log('[PUBCHAN] | RECEIVE PAYLOAD | ', ids, payload);
      }
    });
}

function handleEmission(ref, ids, payload) {
  if (client.isConnected()) {
    client.send(payload);
  } else {
    // close the subscription if we aren't alive anymore
    ref.subscription.cancel();
  }
}

export function subscribeToChannels(client: WebSocketClient, ...channels: mixed[]) {
  if (!channels.length) {
    throw new Error('Market Size Error');
  }

  const subscription = chan
    .subscribe()
    .to(...channels)
    .do();

  return subscription;
}

export function sendToChannels(payload: $Values<WS$ResponseTypes>, ...channels: mixed[]) {
  if (!channels.length) {
    throw new Error('Market Size Error');
  }
  return chan.emit(...channels).send(payload);
}
