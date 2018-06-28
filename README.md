# odo Application Server (odoas)

> **UNFINISHED** - While the underlying server and infrastructure has been used for years in production on multiple applications, `odoas` is a port that is being built as a general-purpose solution. At this time the server should not be considered finished.

`odoas` is built to be a flexible and scalable WebSocket Server that can be used in a variety of ways to provide horizontally scalable realtime data to clients. At its core, `odows` uses `pm2`, `uws`, `ioredis`, and `pubchan` to provide an architecture which can be seamlessly scaled across multiple processors (or systems).

Reliability is a critical component of `odoas`. We utilize `pm2`, a powerful Node.js Process Manager to scale and maintain each of the apps. Combined with `keymetrics` dashboard, this provides a powerful capability for monitoring, controlling, and maintaining the entire infrastructure.

Out of the box, `odoas` provides metric reporting, extensibility via "apps", WebSocket Client Subscriptions / Channels (`pubchan`), and much more. It has been proven in applications serving tens of thousands of persistent clients across multiple applications.

## Example Applications

- Realtime Financial Chart Data (TradingView)
- Realtime API Updates
- Realtime Communication / Chat

## Technologies

- **[pm2](http://pm2.keymetrics.io/)** - Advanced, production process manager for Node.js
- **[UWebSocket](https://github.com/uNetworking/uWebSockets)** - Blazing fast WebSocket and HTTP implementation for clients and servers. Simple, efficient, and lightweight.
- **[Redis](https://redis.io/)** - An in-memory data structure store, used as a database, cache and message broker. Specifically utilizing the lightweight "pubsub" mechanisms provided.
- **[PubChan](https://github.com/Dash-OS/pubchan)** - A lightweight, powerful, and flexible Node.js pubsub broker for in-app subscription and channel management.

## Setup & Configuration

> Coming Soon...

### Deployment

`odoas` is meant to be run within a 3-stage setup.

- `production` - Your production server clients will connect with.
- `staging` - A clone of your production server to test before final rollout (and possibly implement A/B Testing/Canary rollouts with).
- `test` - A test environment which should model your `production`/`staging` environments as closely as possible.

```
yarn deploy:${ODOAS_STAGE}
```

If configured appropriately, the command above should handle the deployment, build, and running of your application.

> Your application will be gracefully updated if possible so that your users do not experience any downtime.

## Adding Applications

`odoas` is meant to be a lightweight boilerplate for your Realtime Application's backend infrastructure. It is the interface from your UI layer to your backend layer and can be extended to meet nearly any infrastructure required.

> More Details Coming Soon...
