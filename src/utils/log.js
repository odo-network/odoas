/* @flow */
import { timestamp } from './time';

export default function LOG(...msgs: mixed[]) {
  console.log(`${timestamp()} | `, ...msgs);
}
