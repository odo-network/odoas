/* @flow */
import day from 'dayjs';

export function timestamp(format?: string = 'h:mm:ss:SSS a'): string {
  return day().format(format);
}

export function timein(n: number, op: string): number {
  return day()
    .add(n, op)
    .valueOf();
}
