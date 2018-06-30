/* @flow */
import registry, { hasPubChan } from 'pubchan/registry';
import type { PubChan$EmitID, PubChan$Ref } from 'pubchan/lib/types';
import type { WS$Event } from '../../../types';

// import type { WebSocketClient } from '../../../websocket/client';

interface ClientWithSendMethod {
  send(payload: WS$Event): ClientWithSendMethod;
}

function createOrGetChannel(chanID) {
  const isNewChannel = !hasPubChan(chanID);
  const chan = registry.get(chanID);
  if (isNewChannel) {
    if (process.env.NODE_ENV !== 'production') {
      // log all channel emissions when not in productions
      chan
        .subscribe()
        .to('$all')
        .do((ref, ids, payload) => {
          console.log(`[PUBCHAN] | Channel ${chanID} | RECEIVE PAYLOAD | `, ids, payload);
        });
    }
  }
  return chan;
}

function handleEmission(ref, ids, payload) {
  if (this.client.isConnected()) {
    this.client.send(payload);
  } else {
    // close the subscription if we aren't alive anymore
    // this should have been done for us already so is
    // simply a safe guard
    ref.subscription.cancel();
  }
}

/**
 * Subscribes the client to a given "chanID" and one or more id's within the channel.
 * By default if no callback is defined, it will automatically broadcast any received
 * payload directly to the client without any further checks.
 *
 * @param {WebSocketClient} client
 * @param {string} chanID
 * @param {string | string[]} to
 * @param {(ref: PubChan$Ref, ids: Set<PubChan$EmitID>, payload: WS$Event) => any} [cb=handleEmission]
 */
export default function subscribeClientToChannel(
  client: ClientWithSendMethod,
  chanID: any,
  to: string | string[],
  cb?: (ref: PubChan$Ref, ids: Set<PubChan$EmitID>, payload: WS$Event) => any = handleEmission,
) {
  const chan = createOrGetChannel(chanID);
  return chan
    .subscribe({ context: { client } })
    .to(to)
    .do(cb);
}
