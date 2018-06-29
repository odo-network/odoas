/* @flow */
import shortid from 'shortid';

import type { WS$RawRequest } from '../types';

/**
 * Each instance (worker thread) will be assigned a unique
 * session ID that is used to identify a worker session.
 */
export opaque type WS$InstanceIdentity: string = string;
/**
 * Each WebSocket Client session is assigned a unique
 * identifier to act as the Session ID (sid) value.
 * One handshaked, this value must be accompanied for
 * all requests and will be included on all responses.
 */
export opaque type WS$ClientSessionID: string = string;
/**
 * If a Request ID (rid) value is not provided when a
 * request is made, one will automatically be assigned.
 * Otherwise this is the value provided by the user.
 */
export opaque type WS$RequestIdentity: string = string;

/**
 * Retrieve a new Instance ID
 */
export function getInstanceID(): WS$InstanceIdentity {
  return `instance:${shortid.generate()}`;
}

/**
 * Retrieve a new Session ID
 */
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
