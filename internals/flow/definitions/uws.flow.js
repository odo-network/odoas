import * as http from 'http';
import * as https from 'https';
import * as events from 'events';
import * as net from 'net';

import type { Server as HTTPServer, ServerResponse } from 'http';

declare class tls$TLSSocket extends net$Socket {
  constructor(socket: net$Socket, options?: Object): void;
  servername: string;
  authorized: boolean;
  authorizationError: string | null;
  encrypted: true;
  getCipher(): { name: string, version: string } | null;
  getEphemeralKeyInfo():
    | { type: 'DH', size: number }
    | { type: 'EDHC', name: string, size: number }
    | null;
  getPeerCertificate(detailed?: boolean): Object | null;
  getSession(): ?Buffer;
  getTLSTicket(): Buffer | void;
  renegotiate(options: Object, callback: Function): boolean | void;
  setMaxSendFragment(size: number): boolean;
}

declare class net$Socket extends stream$Duplex {
  constructor(options?: Object): void;
  servername: string;
  address(): net$Socket$address;
  bufferSize: number;
  bytesRead: number;
  bytesWritten: number;
  connect(options: Object, connectListener?: Function): void;
  destroy(exception?: Error): void;
  end(
    chunk?: string | Buffer,
    encodingOrCallback?: string | ((data: any) => void),
    callback?: (data: any) => void,
  ): void;
  localAddress: string;
  localPort: number;
  pause(): stream$Readable;
  ref(): net$Socket;
  remoteAddress: string | void;
  remoteFamily: string;
  remotePort: number;
  resume(): stream$Readable;
  setEncoding(encoding?: string): stream$Readable;
  setKeepAlive(enable?: boolean, initialDelay?: number): net$Socket;
  setNoDelay(noDelay?: boolean): net$Socket;
  setTimeout(timeout: number, callback?: Function): net$Socket;
  unref(): net$Socket;
  write(
    chunk?: string | Buffer,
    encodingOrCallback?: string | ((data: any) => void),
    callback?: (data: any) => void,
  ): boolean;
}

declare class http$ServerResponse extends stream$Writable {
  addTrailers(headers: { [key: string]: string }): void;
  finished: boolean;
  getHeader(name: string): void;
  headersSent: boolean;
  removeHeader(name: string): void;
  sendDate: boolean;
  setHeader(name: string, value: string | Array<string>): void;
  setTimeout(msecs: number, callback?: Function): http$ServerResponse;
  statusCode: number;
  statusMessage: string;
  writeContinue(): void;
  connection: net$Socket;
  writeHead(status: number, statusMessage?: string, headers?: { [key: string]: string }): void;
  writeHead(status: number, headers?: { [key: string]: string }): void;
}

declare interface UWS$IClientOptions {
  protocol?: string;
  agent?: http.Agent;
  headers?: {
    [key: string]: string,
  };
  protocolVersion?: any;
  host?: string;
  origin?: string;
  pfx?: any;
  key?: any;
  passphrase?: string;
  cert?: any;
  ca?: any[];
  ciphers?: string;
  rejectUnauthorized?: boolean;
}

declare class UWebSocket extends events.EventEmitter {
  static CONNECTING: number;
  static OPEN: number;
  static CLOSING: number;
  static CLOSED: number;

  bytesReceived: number;
  readyState: number;
  protocolVersion: string;
  url: string;
  supports: any;
  upgradeReq: http$ServerResponse;
  protocol: string;
  _socket: tls$TLSSocket;

  CONNECTING: number;
  OPEN: number;
  CLOSING: number;
  CLOSED: number;

  onopen: (event: { target: UWebSocket }) => void;
  onerror: (err: Error) => void;
  onclose: (event: {
    wasClean: boolean,
    code: number,
    reason: string,
    target: UWebSocket,
  }) => void;
  onmessage: (event: { data: any, type: string, target: UWebSocket }) => void;

  constructor(address: string, options?: UWS$IClientOptions): this;
  constructor(address: string, protocols?: string | string[], options?: UWS$IClientOptions): this;

  close(code?: number, data?: any): void;
  pause(): void;
  resume(): void;
  ping(data?: any, options?: { mask?: boolean, binary?: boolean }, dontFail?: boolean): void;
  pong(data?: any, options?: { mask?: boolean, binary?: boolean }, dontFail?: boolean): void;
  send(data: any, cb?: (err: Error) => void): void;
  send(data: any, options: {| mask?: boolean, binary?: boolean |}, cb?: (err: Error) => void): void;
  stream(
    options: { mask?: boolean, binary?: boolean },
    cb?: (err: Error, final: boolean) => void,
  ): void;
  stream(cb?: (err: Error, final: boolean) => void): void;
  terminate(): void;

  // HTML5 UWebSocket events
  addEventListener(
    method: 'message',
    cb?: (event: { data: any, type: string, target: UWebSocket }) => void,
  ): void;
  addEventListener(
    method: 'close',
    cb?: (event: {
      wasClean: boolean,
      code: number,
      reason: string,
      target: UWebSocket,
    }) => void,
  ): void;
  addEventListener(method: 'error', cb?: (err: Error) => void): void;
  addEventListener(method: 'open', cb?: (event: { target: UWebSocket }) => void): void;
  // addEventListener(method: string, listener?: () => void): void;

  // Events
  on(event: 'error', cb: (err: Error) => any): this;
  on(event: 'close', cb: (code: number, message: string) => any): this;
  on(event: 'message', cb: (data: string, flags: { binary: boolean }) => any): this;
  on(event: 'pong', cb: (data: mixed, flags: { binary: boolean }) => any): this;
  on(event: 'ping', cb: (data: mixed, flags: { binary: boolean }) => any): this;

  on(event: 'open', cb: () => void): this;
  // on(event: string, listener: () => void): this;

  addListener(event: 'error', cb: (err: Error) => void): this;
  addListener(event: 'close', cb: (code: number, message: string) => void): this;
  addListener(event: 'message', cb: (data: any, flags: { binary: boolean }) => void): this;
  addListener(event: 'ping', cb: (data: any, flags: { binary: boolean }) => void): this;
  addListener(event: 'pong', cb: (data: any, flags: { binary: boolean }) => void): this;
  addListener(event: 'open', cb: () => void): this;
  // addListener(event: string, listener: () => void): this;
}

declare module 'uws' {
  declare type VerifyClientCallbackSync = (info: {
    origin: string,
    secure: boolean,
    req: http$IncomingMessage,
  }) => boolean;

  declare type VerifyClientCallbackAsync = (
    info: {
      origin: string,
      secure: boolean,
      req: http$IncomingMessage,
    },
    callback: (res: boolean) => void,
  ) => void;

  declare export interface IPerMessageDeflateOptions {
    serverNoContextTakeover?: boolean;
    clientNoContextTakeover?: boolean;
    serverMaxWindowBits?: number;
    clientMaxWindowBits?: number;
    memLevel?: number;
    serverNoContextTakeover?: boolean;
    clientNoContextTakeover?: boolean;
    serverMaxWindowBits?: number;
    clientMaxWindowBits?: number;
    memLevel?: number;
  }

  declare export interface IServerOptions {
    host?: string;
    port?: number;
    server?: HTTPServer | tls$Server;
    verifyClient?: VerifyClientCallbackAsync | VerifyClientCallbackSync;
    handleProtocols?: any;
    path?: string;
    noServer?: boolean;
    disableHixie?: boolean;
    clientTracking?: boolean;
    perMessageDeflate?: boolean | IPerMessageDeflateOptions;
  }

  declare export class Server mixins events.EventEmitter {
    options: IServerOptions;
    path: string;
    clients: UWebSocket[];
    constructor(options?: IServerOptions, callback?: Function): this;
    close(cb?: (err?: any) => void): void;
    handleUpgrade(
      request: http$IncomingMessage,
      socket: net$Socket,
      upgradeHead: ArrayBuffer,
      callback: (client: UWebSocket) => void,
    ): void;
    on(event: 'error', cb: (err: Error) => void): this;
    on(event: 'headers', cb: (headers: string[]) => void): this;
    on(event: 'connection', cb: (client: UWebSocket) => void): this;
    // on(event: string, listener: () => void): this;
    addListener(event: 'error', cb: (err: Error) => void): this;
    addListener(event: 'headers', cb: (headers: string[]) => void): this;
    addListener(event: 'connection', cb: (client: UWebSocket) => any): this;
    // addListener(event: string, listener: () => void): this
  }

  declare export interface UwsHttp {
    createServer(
      requestListener?: (request: http$IncomingMessage, response: http$ServerResponse) => void,
    ): https.Server;
    getExpressApp(express: any): any;
    getResponsePrototype(): http$ServerResponse;
    getRequestPrototype(): http$IncomingMessage;
  }

  declare export type HTTPServerType = HTTPServer;

  declare export var http: UwsHttp;

  declare export function createServer(
    options?: IServerOptions,
    connectionListener?: (client: UWebSocket) => void,
  ): Server;

  declare export function connect(address: string, openListener?: Function): void;

  declare export function createConnection(address: string, openListener?: Function): void;

  declare var npm$namespace$WebSocket: {
    createServer: typeof createServer,
    connect: typeof connect,
    createConnection: typeof createConnection,
  };
}
