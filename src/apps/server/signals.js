/* @flow */
import LOG from './utils/log';
import handleServerCleanup from './server/cleanup';

process.on('uncaughtException', (err: Error) => {
  LOG('[ERROR] | Uncaught Exception Occurred!!');
  console.error(err);
});

process.on('uncaughtRejection', (err: Error) => {
  LOG('[ERROR] | Uncaught Promise Rejection Occurred!');
  console.error(err);
});

process.on('warning', (warning: { name: string, message: string, stack: Object }) => {
  LOG('[WARN] | A Process Warning Occurred');
  console.warn(warning.name); // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack); // Print the stack trace
});

/*
  When our server is going to be shutdown or restarted we receive a SIGINT.  In
  this case we need to dispatch to our server so it can clean up all the connected
  clients.
*/
process.on('SIGINT', () => {
  LOG('-------------------------------------------------\n');
  LOG('[EVENT] | SIGNAL | SIGINT | Starting Process Cleanup');
  handleServerCleanup()
    .then(() => {
      LOG('[COMPLETE] | Process is Complete and has finished cleanup, exiting now');
      console.log('-------------------------------------------------\n');
      return process.exit(0);
    })
    .catch((err: Error) => {
      LOG('[ERROR] | During Process SIGINT Handler \n', err);
      console.log('-------------------------------------------------\n');
      process.exit(1);
    });
});
