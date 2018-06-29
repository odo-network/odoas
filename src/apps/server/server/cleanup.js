/* @flow */
import LOG from '../utils/log';
import { getAllClients } from '../context/maps';

/**
 * When we are able to gracefully restart the server, we call handleServerCleanup
 * so that we can inform any connected clients that a restart will be conducted
 * prior to disconnect.
 * @returns {Promise<*>}
 */
function handleServerCleanup(): Promise<Array<void>> {
  const promises = [];
  const clients = getAllClients();

  LOG('Starting Server Cleanup - Total Clients: ', clients.size);
  // iterate our clients and remove them gracefully if possible.
  clients.forEach(client => {
    if (client.state.connected) {
      promises.push(
        client.disconnect(1012, 'Server Restarting').catch((e: Error) => {
          console.error('[ERROR] | During Client Cleanup of ', client.props.identity, e);
          // if an error occurs while attempting to remove the client,
          // we call kill to attempt a forced termination instead.
          return client.kill();
        }),
      );
    } else if (client.props.ws) {
      promises.push(client.handleCleanup());
    }
  });
  return Promise.all(promises);
}

export default handleServerCleanup;
