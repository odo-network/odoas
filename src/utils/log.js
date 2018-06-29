/* @flow */
import { timestamp } from './time';

export default function LOG(...msgs: mixed[]) {
  if (msgs.length >= 1) {
    console.group(timestamp());
    msgs.forEach(msg => {
      if (msg instanceof Error) {
        console.error(msg);
      } else {
        console.log(msg);
      }
    });
    console.groupEnd();
  } else {
    console.log(`${timestamp()} | `, ...msgs);
  }
}
