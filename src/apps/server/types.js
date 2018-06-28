/* @flow */
import { Subscriber } from 'pubchan';

// eslint-disable-next-line import/no-cycle
import type { WebSocketClient } from './websocket/client';

// eslint-disable-next-line import/no-cycle
import type {
  WS$InstanceIdentity as InstanceIdentity,
  WS$ClientSessionID as ClientSessionID,
  WS$RequestIdentity as RequestID,
} from './utils/identity';

type $StrictObject<O> = $Call<AsStrictObject, O>;
type AsStrictObject = <O>(O) => $ExactReadOnly<$NonMaybeObject<O>>;
type $ExactReadOnly<O> = $ReadOnly<$Exact<O>>;
type $NonMaybeObject<O> = $Call<AsNonMaybeObject, O>;
type AsNonMaybeObject = <O>(O) => $ObjMap<O, <T>(T) => $NonMaybeType<T>>;

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

type RequestHeader = {|
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
  subscribeToMarket: {|
    ...$StrictObject<RequestHeader>,
    +method: 'subscribeToMarket',
    +payload: {|
      +symbol: string,
    |},
  |},
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
  +subscribeToMarket: {|
    ...WS$ResponseHeader,
    +method: 'subscribeToMarket',
  |},
|};

export type WS$HandshakeRequest = $ElementType<WS$RequestTypes, 'handshake'>;

export type WS$Request = $Values<WS$RequestTypes>;

export type WS$Methods = $Keys<WS$RequestTypes>;

export type WS$ClientIdentities = {|
  identity: ClientSessionID,
  [identityType: $Keys<WS$IdentityMaps>]: ClientSessionID,
|};

export type WS$ClientProps = {|
  identity: WS$ClientSessionID,
  ws: void | UWebSocket,
|};

export type WS$ClientState = {|
  ip: string,
  servername: string,
  log: boolean,
  type?: string,
  version?: $ElementType<$ElementType<WS$HandshakeRequest, 'payload'>, 'version'>,
  headers: {
    [headerName: string]: string,
  },
  connection: {|
    isAlive: boolean,
    handshaked: boolean,
    connected: boolean,
    disconnecting: boolean,
    created: number,
  |},
  subscription?: Subscriber,
  identities: $Shape<WS$ClientIdentities>,
|};
