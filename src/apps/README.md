# odoas Applications

Each folder here holds an `odoas` Application. Applications are self-contained stateless containers meant to handle a specific piece of your overall platforms business logic.

## Design Principles

- Stateless
- Should never matter what applications are running in the cluster.
- Clearly defined input/output and IPC (Pubsub) mechanisms.
- Clearly defined metrics reported for analytics & maitenance.
- Side-effect free (no app should alter the way another app operates).
- It should never matter if we run one or 100 instances of the application (horizontally scalable).

## Execution Environment
