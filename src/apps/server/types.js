/* @flow */

// eslint-disable-next-line import/no-cycle
import type { WebSocketClient } from './websocket/client';

// eslint-disable-next-line import/no-cycle
import type {
  WS$InstanceIdentity as InstanceIdentity,
  WS$ClientSessionID as ClientSessionID,
  WS$RequestIdentity as RequestID,
} from './utils/identity';

export type WS$InstanceIdentity = InstanceIdentity;
export type WS$ClientSessionID = ClientSessionID;
export type WS$RequestIdentity = RequestID;

export type WS$Event = {||};

export type WS$IdentityMaps = {|
  +identity: Map<ClientSessionID, WebSocketClient>,
|};

export type WS$ErrorResponse = {|
  result: 'error',
  method?: string,
  rid?: RequestID,
  payload: | string
    | {|
        +message: string,
      |},
|};

export type RequestHeader = {|
  +rid: RequestID,
  +sid: void | ClientSessionID,
|};

export type WS$Response = WS$ErrorResponse;

export type WS$RequestTypes = {|
  handshake: {|
    ...RequestHeader,
    +method: 'handshake',
    +payload: {|
      +version: '1.0',
      +type?: 'client',
      +key: string,
    |},
  |},
|};

export type WS$RouteRequest<M, P> = {|
  ...RequestHeader,
  +method: M,
  +payload: P,
|};

export type WS$RouteType<M, P> = {|
  method: M,
  validate: {
    [payloadKey: string]: (value: *) => boolean,
  },
  onRequest: (request: WS$RouteRequest<M, P>, client: WebSocketClient) => Promise<*>,
  onCleanup?: (client: WebSocketClient) => Promise<*>,
|};

export type WS$RawRequest = {|
  rid?: string,
  sid?: string,
  +method: $Keys<WS$RequestTypes>,
  +payload: string,
|};

export type WS$ResponseHeader = {|
  +result: 'success',
  +rid: RequestID,
  +sid: ClientSessionID,
|};

export type WS$ResponseTypes = {|
  +handshake: {|
    ...WS$ResponseHeader,
    +method: 'handshake',
  |},
  +subscribe: {|
    ...WS$ResponseHeader,
    +method: 'subscribe',
  |},
|};

export type WS$HandshakeRequest = $ElementType<WS$RequestTypes, 'handshake'>;

export type WS$Request = $Values<WS$RequestTypes>;

export type WS$Methods = $Keys<WS$RequestTypes>;

export type WS$ClientProps = {|
  +ip: string,
  +servername: string,
  +remotePort: number,
  +identity: WS$ClientSessionID,
  ws: void | UWebSocket,
|};

export type WS$ClientState = {|
  log: boolean,
  type?: string,
  version?: $ElementType<$ElementType<WS$HandshakeRequest, 'payload'>, 'version'>,
  isAlive: boolean,
  handshaked: boolean,
  connected: boolean,
  disconnecting: boolean,
  created: number,
|};
