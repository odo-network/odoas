/* @flow */
import Redis from 'ioredis';
import path from 'path';
import os from 'os';

/*
  IPC Channels are used to aid in properly handling Redis Pubsub.  It allows us
  to create pubsub channels and efficiently create the necessary instances of
  ioredis as-needed.

  We only require one Redis Instance for all of our write operations and only need
  an instance for each read instance.  This reduces the total required connections
  to the socket significantly less.
*/

export type RChan$Descriptor = {
  config: Redis$Options,
  tx: Redis,
  rx: Redis,
};

const getConfig = (config: $Shape<Redis$Options> = {}): Redis$Options => ({
  path: path.resolve(os.homedir(), '/.odoas/ipc.sock'),
  ...config,
});

// we only ever need a single tx handler,
// once it is created we re-use it throughout.
let TX: ?Redis;

const CHANNELS: Map<string, RChan$Descriptor> = new Map();

function closeRedisChannel(id: string): void {
  const { rx, tx } = CHANNELS.get(id) || {};
  if (rx) {
    rx.disconnect();
  }
  CHANNELS.delete(id);
  if (CHANNELS.size === 0) {
    tx.disconnect();
    TX = undefined;
  }
}

/**
 * Close all Redis Channels that are currently open
 */
function closeAllRedisChannels(): void {
  for (const [id] of CHANNELS) {
    closeRedisChannel(id);
  }
  if (TX) {
    TX.disconnect();
    TX = undefined;
  }
}

function getOpenChannels(): Array<[string, RChan$Descriptor]> {
  return [...CHANNELS];
}

function createRedisChannel(
  id: string,
  _config: ?$Shape<Redis$Options>,
  pubsub?: boolean = true,
): RChan$Descriptor {
  let descriptor: RChan$Descriptor;

  const d: ?RChan$Descriptor = CHANNELS.get(id);

  if (d) {
    descriptor = d;
  } else {
    const config: Redis$Options = getConfig(_config);
    if (!TX) {
      TX = new Redis(config);
    }
    const tx = TX;
    let rx: Redis;
    if (pubsub) {
      rx = new Redis(config);
    }
    // ignoring, rx being optional is not needed
    // $FlowIgnore
    descriptor = {
      config,
      tx,
      rx,
    };

    CHANNELS.set(id, descriptor);
  }

  return descriptor;
}

export {
  getOpenChannels, createRedisChannel, closeRedisChannel, closeAllRedisChannels,
};

export default createRedisChannel;
