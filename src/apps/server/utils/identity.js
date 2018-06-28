/* @flow */
import shortid from 'shortid';

// eslint-disable-next-line import/no-cycle
import type { WS$RawRequest } from '../types';

export opaque type WS$InstanceIdentity: string = string;
export opaque type WS$ClientSessionID: string = string;
export opaque type WS$RequestIdentity: string = string;

export function getInstanceID(): WS$InstanceIdentity {
  return `instance:${shortid.generate()}`;
}

export function getClientSessionID(): WS$ClientSessionID {
  return `csi:${shortid.generate()}`;
}

/**
 * Each payload needs a unique "rid" property to identify it and its
 * purpose.  We assign a `shortid` to them if they have not defined
 * the id property which will then be sent back as a response if
 * necessary.
 *
 * If an `rid` property is provided, we will use that.
 * @param {WS$Request} request
 */
export function getRequestID<R: WS$RawRequest>(request: R): WS$RequestIdentity {
  if (!request.rid) {
    // Does not have an id property.  If it has an api key tag as an api
    // call otherwise a ui call.
    return `rid:${shortid.generate()}`;
  }
  return String(request.rid);
}
