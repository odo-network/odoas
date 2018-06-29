/* @flow */
import shortid from 'shortid';
import type { WS$RouteType } from '../../types';

type RequestPayload = {|
  cid?: string,
  +action: 'subscribe' | 'unsubscribe' | 'clear',
  channel: string,
|};

function getChannelID() {
  return `cid:${shortid.generate()}`;
}

const route: WS$RouteType<'subscribe', RequestPayload> = {
  method: 'subscribe',
  onValidate: async function handleValidateSubscribeRequest(request, client) {
    console.log(request, client);
    // validate: {
    //   cid: (v: void | string): boolean %checks => v === undefined || typeof v === 'string',
    //   action: (v: void | 'subscribe' | 'unsubscribe' | 'clear'): boolean %checks => v === undefined || ['subscribe', 'unsubscribe', 'clear'].includes(v),
    //   channel: (v: string): boolean %checks => typeof v === 'string',
    // },
  },
  onRequest: async function handleSubscribeRequest(request, client) {
    console.log(client, getChannelID());
    const { payload } = request;
    // const { payload } = request;
    switch (payload.action) {
      case 'subscribe': {
        // console.log('Subscribe: ', cid, channel);
        break;
      }
      case 'unsubscribe': {
        break;
      }
      case 'clear': {
        break;
      }
      default: {
        throw new Error('Unknown Subscription Handler');
      }
    }
  },
};

export default route;
