/* @flow */
/**
 * iterate through vals and remove the value if it starts with it.
 * once the first match is found, return value.
 * @param {*} str
 * @param {*} vals
 */
export function trimLeft(str: string, ...vals: Array<string>): string {
  for (const val of vals) {
    if (str.startsWith(val)) {
      return str.replace(new RegExp(`^${val}`), '');
    }
  }
  return str;
}
