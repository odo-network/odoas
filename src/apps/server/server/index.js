/* @flow */
import { Server as WebSocketServer } from 'uws';
import http from 'http';
import type { Server as HTTPServer } from 'http';

const PORT = process.env.PORT ? Number(process.env.PORT) : 9090;

export type WS$ServerDescriptor = {|
  server: HTTPServer,
  port: number,
  WS: WebSocketServer,
|};

/**
 * Start the http Server responsible for handling
 * upgrading websocket requests and listen on PORT
 * @param {Function} resolve
 * @param {Function} reject
 */
function startServer(resolve, reject) {
  const server = http.createServer((request, response) => {
    response.writeHead(200);
    response.end('Websockets!\n');
  });
  const WS = new WebSocketServer({
    server,
    /* We do not need to do clientTracking in the ws library */
    clientTracking: false,
  });
  return server.listen(PORT, err => {
    if (err) reject(err);
    console.log('LISTENING ON PORT: ', PORT);
    resolve(({ server, port: PORT, WS }: WS$ServerDescriptor));
  });
}

export default (): Promise<WS$ServerDescriptor> => new Promise(startServer);
