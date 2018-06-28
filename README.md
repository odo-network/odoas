# odo Application Server (odoas)

> **UNFINISHED** - While the underlying server and infrastructure has been used for years in production on multiple applications, `odoas` is a port that is being built as a general-purpose solution. At this time the server should not be considered finished.

`odoas` is built to be a flexible and scalable WebSocket Server that can be used in a variety of ways to provide horizontally scalable realtime data to clients. At its core, `odows` uses `pm2`, `uws`, `ioredis`, and `pubchan` to provide an architecture which can be seamlessly scaled across multiple processors (or systems).

Reliability is a critical component of `odoas`. We utilize `pm2`, a powerful Node.js Process Manager to scale and maintain each of the apps. Combined with `keymetrics` dashboard, this provides a powerful capability for monitoring, controlling, and maintaining the entire infrastructure.

Out of the box, `odoas` provides metric reporting, extensibility via "apps", WebSocket Client Subscriptions / Channels (`pubchan`), and much more. It has been proven in applications serving tens of thousands of persistent clients across multiple applications.

## Example Applications

- Realtime Financial Chart Data (TradingView)
- Realtime API Updates
- Realtime Communication / Chat
