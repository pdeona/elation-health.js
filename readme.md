# `elation.js`

## Elation Health API Client - Node.js

A Node.js client for the Elation Health API. Work In Progress, pull requests accepted.

Usage:

```js
import Elation from 'elationjs'

const credentials = { // your Elation API credentials
  clientID: string,
  clientSecret: string,
  username: string,
  password: string,
}
const sandbox: boolean = false // Use sandbox API URL. default: true

const apiClient = new Elation(credentials, sandbox)
apiClient.initiailize()

export default apiClient
```

## Contributions

Pull requests welcome, need help with adding endpoint coverage and starting the test library.
