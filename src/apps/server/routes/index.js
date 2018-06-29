/* @flow */

import type { WS$RequestTypes } from '../types';

import type { WebSocketClient } from '../websocket/client';

import { listDirectory } from '../../../utils/filesystem';

const ServerRoutes = new Map();

const CleanupRoutes = new Set();

/**
 * Automatically parses the ./request folder and imports any requests to be
 * handled by the server.  Called when building the server.
 */
export async function buildServerRoutes() {
  const paths = await listDirectory('./route', /\.js/);
  const promises = [];
  paths.forEach(path => {
    promises.push(import(`./route/${path}`).then(m => m.default));
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
 * When a route defines a "validate" key, its payload will be
 * validated by running each of its validation calls.
 *
 * @param {*} route
 * @param {*} request
 */
function validateRoutedRequest(route, request) {
  const { validate } = route;
  for (const validatePayloadKey in validate) {
    if (
      Object.prototype.hasOwnProperty.call(validate, validatePayloadKey)
      && !validate[validatePayloadKey](request.payload[validatePayloadKey])
    ) {
      return validatePayloadKey;
    }
  }
}

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

export default async function handleClientRequestRoute<
  R: $Values<WS$RequestTypes>,
  C: WebSocketClient,
>(request: R, client: C) {
  const route = ServerRoutes.get(request.method);
  if (route && route.onRequest) {
    if (route.validate) {
      const invalidPayloadKey = validateRoutedRequest(route, request);
      if (invalidPayloadKey) {
        throw new TypeError(
          `Invalid Request Payload for ${request.method}, ${invalidPayloadKey} is not valid.`,
        );
      }
    }
    await route.onRequest(request, client);
  } else {
    throw new TypeError(`Invalid Request Method ${request.method}`);
  }
}
