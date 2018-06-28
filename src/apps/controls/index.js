import pmx from 'pmx';
import registerIPCSubscription from './ipc-subscriber';
// import { sendIPCRequest } from '../../utils/ipc';

const NodeActions = {
  // This is used to communicate and query the running
  // application.
};

registerIPCSubscription();

Object.keys(NodeActions).forEach(actionID => {
  pmx.action(actionID, NodeActions[actionID]);
});
