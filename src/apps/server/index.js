/* @flow */
import LOG from './utils/log';
import { getInstanceID } from './utils/identity';

import startServer from './server';

import { buildServerRoutes } from './routes';

import registerWebSocketCallbacks from './websocket/callbacks';
import { startWebSocketHeartbeat } from './websocket/heartbeat';

import './signals';

/* Each instance should have a global instanceID string which uniquely
   identifies it */
const instanceID = getInstanceID();
global.instanceID = instanceID;

buildServerRoutes()
  .then(startServer)
  .then(registerWebSocketCallbacks)
  .then(startWebSocketHeartbeat)
  .then(() => process && typeof process.send === 'function' && process.send('ready'))
  .catch((err: Error) => {
    LOG('[STARTUP ERROR] | Failed to Startup the odows WebSocket Server!');
    console.error(err);
    process.exit(1);
  });
