# Elation Health API Client - Node.js

A Node.js client for the Elation Health API. Work In Progress, pull requests accepted.

Usage:

```js
import elationFactory from 'elation-health'

const credentials {
  clientID: string,
  clientSecret: string,
  username: string,
  password: string,
}
const sandbox: boolean = false

const Elation = elationFactory(credentials, sandbox)
```

