/* @flow */
import pmx from 'pmx';

pmx.init({
  network: true, // Network monitoring at the application level
  ports: true, // Shows which ports your app is listening on (default: false)
});

/** Track how many connected websockets are currently active. */
const connectedUsers = pmx.probe().metric({
  name: 'Connected Clients',
});

connectedUsers.set(0);

export { connectedUsers };
