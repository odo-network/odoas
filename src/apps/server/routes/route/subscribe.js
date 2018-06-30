/* @flow */
import type { Subscriber } from 'pubchan';
import type { WS$RouteType } from '../../types';

import subscribeClientToChannel from './subscribe/registry';

/**
 * Implements the subscribe method for controlling channel subscriptions
 * within the server.  These channels are controlled in multiple ways to
 * maximize performance.
 *
 * 1. cid (Optional)
 *      Provided as a way to split the channels into
 *      smaller pieces.  Each "category" of channel should be given a channelID
 *      and enforced within the "onValidate" function below.
 * 2. channel (Required)
 *      One or more channels that we want to subscribe to.  These need to
 *      match in order to receive any of the WS$Event payloads that will
 *      be dispatched.  One or more channels may be subscribed to at any
 *      time.
 * 3. action (Required)
 *      subscribe   - Subscribes to the channel (or channels) provided
 *      unsubscribe - Unsubscribes from the channel (or channels) provided
 *      clear       - Removes all subscriptions the client has subscribed to
 *
 */
const DefaultChannelID = Symbol.for('@subscription/DefaultChannelID');

type Subscriber$ChannelID = typeof DefaultChannelID | string;
type Subscriber$SubscriptionID = string | string[];

export type Request$Payload = {|
  cid?: Subscriber$ChannelID,
  +action: 'subscribe' | 'unsubscribe' | 'clear',
  channel: Subscriber$SubscriptionID,
|};

opaque type Route$Method = 'subscribe';

type Route$SubscriptionMap = Map<Subscriber$ChannelID, Map<Subscriber$SubscriptionID, Subscriber>>;
// the shape of the state we will save on the
// client.
export type Route$State = {|
  subscriptions: Route$SubscriptionMap,
|};

function subscribeClient(client, subscriptions, channelID, channel) {
  unsubscribeClientFromChannel(subscriptions, channelID, channel);
  const subscription = subscribeClientToChannel(client, channelID, channel);

  const channels = subscriptions.get(channelID) || new Map();
  channels.set(channel, subscription);
  subscriptions.set(channelID, channels);
}

function unsubscribeClientFromChannel(
  subscriptions: Route$SubscriptionMap,
  cid: Subscriber$ChannelID,
  channel?: Subscriber$SubscriptionID,
) {
  const channels = subscriptions.get(cid);
  if (channels) {
    if (!channel) {
      channels.forEach(subscription => subscription.cancel());
    } else if (Array.isArray(channel)) {
      channel.forEach(channelValue => {
        const subscription = channels.get(channelValue);
        if (subscription) {
          subscription.cancel();
        }
      });
    } else {
      const subscription = channels.get(channel);
      if (subscription) {
        subscription.cancel();
      }
    }
  }
}

function cancelAllSubscriptionsForClient(subscriptions) {
  subscriptions.forEach(channels => channels.forEach(subscription => subscription.cancel()));
}

const route: WS$RouteType<Route$Method, Request$Payload, Route$State> = {
  method: 'subscribe',
  onValidate: function handleSubscriptionValidation(request) {
    if (!request.payload || !request.payload.action) {
      throw new TypeError('');
    }
  },
  onCleanup: function handleSubscriptionCleanup(client) {
    const { subscriptions } = client.getState('subscribe');
    if (subscriptions) {
      cancelAllSubscriptionsForClient(subscriptions);
    }
  },
  onRequest: async function handleSubscribeRequest(request, client) {
    const { payload } = request;

    const channelID = payload.cid || DefaultChannelID;
    const state = client.getState('subscribe');

    let subscriptions: Route$SubscriptionMap;

    if (!state.subscriptions) {
      subscriptions = state.subscriptions = new Map();
    } else {
      ({ subscriptions } = state);
    }

    switch (payload.action) {
      case 'subscribe': {
        if (Array.isArray(payload.channel)) {
          // eslint-disable-next-line max-len
          payload.channel.forEach(channel => subscribeClient(client, subscriptions, channelID, channel));
        } else {
          subscribeClient(client, subscriptions, channelID, payload.channel);
        }
        break;
      }
      case 'unsubscribe': {
        unsubscribeClientFromChannel(subscriptions, channelID, payload.channel);
        break;
      }
      case 'clear': {
        cancelAllSubscriptionsForClient(subscriptions);
        break;
      }
      default: {
        throw new Error('Unknown Subscription Action');
      }
    }
  },
};

export default route;
