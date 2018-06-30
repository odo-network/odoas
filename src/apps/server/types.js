/* @flow */

// eslint-disable-next-line import/no-cycle
import type { WebSocketClient } from './websocket/client';

// eslint-disable-next-line import/no-cycle
import type {
  WS$InstanceIdentity as InstanceIdentity,
  WS$ClientSessionID as ClientSessionID,
  WS$RequestIdentity as RequestID,
  WS$APIKey as APIKey,
} from './utils/identity';

export type WS$InstanceIdentity = InstanceIdentity;
export type WS$ClientSessionID = ClientSessionID;
export type WS$RequestIdentity = RequestID;
export type WS$APIKey = APIKey;

export type RequestHeader = {|
  +rid: RequestID,
  +sid: void | ClientSessionID,
|};

export type WS$Event = {|
  sid?: ClientSessionID,
  +event: string,
  +payload: { [key: string]: any },
|};

export type ResponseHeader = {|
  +rid?: RequestID,
  +sid?: ClientSessionID,
|};

export type WS$SuccessResponse = {|
  ...ResponseHeader,
  +result: 'success',
  +method: string,
  payload?: void | {},
|};

export type WS$ErrorResponse = {|
  ...ResponseHeader,
  +result: 'error',
  method?: string,
  +payload: {|
    message: string,
  |},
|};

export type WS$Response = WS$ErrorResponse;

export type WS$Request = {|
  ...RequestHeader,
  +method: string,
  +payload: Object,
|};

export type WS$RouteRequest<+M, +P> = {|
  ...RequestHeader,
  +method: M,
  +payload: P,
|};

export type WS$RouteType<M, P: Object, S: Object = Object> = {|
  method: M,
  onValidate?: (request: WS$RouteRequest<M, P>, client: RoutedClient<M, S>) => any,
  onRequest: (request: WS$RouteRequest<M, P>, client: RoutedClient<M, S>) => Promise<*>,
  onCleanup?: (client: RoutedClient<M, S>) => any,
  onResponse?: <R: Object>(request: WS$RouteRequest<M, P>, client: RoutedClient<M, S>) => void | R,
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

export type WS$ClientProps = {|
  +ip: string,
  +servername: string,
  +remotePort: number,
  +identity: WS$ClientSessionID,
  key: void | APIKey,
  ws: void | UWebSocket,
|};

export type WS$ClientState = {|
  log: boolean,
  type?: string,
  version?: string,
  isAlive: boolean,
  handshaked: boolean,
  connected: boolean,
  disconnecting: boolean,
  created: number,
  routes?: Map<string, Object>,
|};

export type WS$Request$Handshake = {|
  +version: '1.0',
  +type?: 'client',
  +key: APIKey,
|};

export interface WS$ClientWithRouteState<RM: string, RS: Object> {
  state: {|
    ...WS$ClientState,
    routes?: Map<RM, RS>,
  |};
  setState(route: RM, state: $Shape<RS>): WebSocketClient;
  getState(route: RM): $Shape<RS>;
  onHandshake(request: WS$RouteRequest<'handshake', WS$Request$Handshake>): void;
  disconnect(code: number, reason: string): Promise<void>;
  send(payload: WS$Event | WS$SuccessResponse | WS$ErrorResponse): WS$ClientWithRouteState<RM, RS>;
}

type RoutedClient<RM, RS> = WS$ClientWithRouteState<RM, RS>;
