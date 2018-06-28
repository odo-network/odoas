/* @flow */
import LOG from '../utils/log';
import { IdentityMaps } from '../context/maps';

/**
 * When we are able to gracefully restart the server, we call handleServerCleanup
 * so that we can inform any connected clients that a restart will be conducted
 * prior to disconnect.
 * @returns {Promise<*>}
 */
function handleServerCleanup(): Promise<Array<void>> {
  const { identity: clients } = IdentityMaps;
  const promises = [];
  LOG('Starting Server Cleanup - Total Clients: ', clients.size);
  // iterate our clients and remove them gracefully if possible.
  clients.forEach(client => {
    if (client.state.connection.connected) {
      promises.push(
        client.disconnect(999, 'Server Restarting').catch((e: Error) => {
          LOG('[ERROR] | During Client Cleanup of ', client.props.identity, e);
          // if an error occurs while attempting to remove the client,
          // we call kill to attempt a forced termination instead.
          return client.kill();
        }),
      );
    }
  });
  return Promise.all(promises);
}

export default handleServerCleanup;
