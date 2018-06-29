/* @flow */
import path from 'path';

import type { WS$Request } from '../types';

import type { WebSocketClient } from '../websocket/client';

import { listDirectory } from '../../../utils/filesystem';

const ServerRoutes = new Map();

const CleanupRoutes = new Set();

/**
 * Automatically parses the ./request folder and imports any requests to be
 * handled by the server.  Called when building the server.
 */
export async function buildServerRoutes() {
  const paths = await listDirectory(path.resolve(__dirname, 'route'), /\.js/);
  const promises = [];
  paths.forEach(p => {
    promises.push(import(path.resolve(__dirname, 'route', p)).then(m => m.default));
  });
  if (promises.length) {
    const routes = await Promise.all(promises);
    routes.forEach(({ method, ...route }) => {
      if (ServerRoutes.has(method)) {
        throw new Error(`Method collision occurred, ${method} is already registered.`);
      }
      ServerRoutes.set(method, route);
      if (typeof route.onCleanup === 'function') {
        CleanupRoutes.add(route.onCleanup);
      }
    });
  }
}

/**
 * Check to see if a given route is available.
 *
 * @param {string} method
 */
export function hasRoute(method: string) {
  return ServerRoutes.has(method);
}

/**
 * When a client is being "cleaned", some routes may need to
 * conduct some cleanup for that client.  Any routes which
 * register an "onCleanup" function will be called with the
 * client when necessary.
 *
 * @param {*} client
 */
export async function handleCleanupClientFromRoutes(client: WebSocketClient) {
  const promises = [];
  CleanupRoutes.forEach(onCleanup => {
    const promise = onCleanup(client);
    if (typeof promise === 'object' && typeof promise.then === 'function') {
      promises.push(promise);
    }
  });
  if (promises.length) {
    await Promise.all(promises);
  }
}

export default async function handleClientRequestRoute<R: WS$Request, C: WebSocketClient>(
  request: R,
  client: C,
) {
  const route = ServerRoutes.get(request.method);
  if (route && route.onRequest) {
    if (route.onValidate) {
      await route.onValidate(request, client);
    }
    await route.onRequest(request, client);
    await client.handleResponse(request, route);
  } else {
    throw new TypeError(`Invalid Request Method ${request.method}`);
  }
}
