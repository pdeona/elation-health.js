// @flow
import axios from 'axios'
import QueryString from 'query-string'

type Header = {| Authorization: string |}
type Config = {
  headers: {
    ...Header,
    [key: string]: string,
  },
  [key: string]: *,
}

export type ElationCredentials = {|
  clientID: string,
  clientSecret: string,
  username: string,
  password: string,
|}

type APITokenResponse = {|
  data: {|
    +access_token: string,
    +refresh_token: string,
    +expires_in: string,
  |},
|}

type APIClientData = {|
  +accessToken: string,
  +refreshToken: string,
  +expiresIn: number,
|}

type ElationInput = {|
  ...APIClientData,
  client: axios,
|}

function ClientFactory(credentials: ElationCredentials, sandbox: boolean) {
  const URL = sandbox 
    ? 'https://sandbox.elationemr.com/api/2.0/'
    : 'https://app.elationemr.com/api/2.0'

  const handleTokenResponse = ({
    data: {
      access_token,
      refresh_token,
      expires_in,
    },
  }: APITokenResponse): APIClientData => ({
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresIn: parseInt(expires_in, 10),
  })

  const authString = (credentials: ElationCredentials): string => Buffer.from(
    `${credentials.clientID}:${credentials.clientSecret}`
  ).toString('base64')

  function createAPIClient(credentialsObject: ElationCredentials): Promise<ElationInput> {
    const {
      username,
      password,
    } = credentialsObject
    const authHeader: string = `Basic ${authString(credentialsObject)}`
    const tokenQueryString: string = QueryString.stringify({
      grant_type: 'password',
      username,
      password,
    }, { sort: false, encode: false })
    const client: axios = axios.create({
      baseURL: URL,
      headers: {
        'content-type': 'application/json'
      },
    })

    const getAPITokenAndRefresh = (): Promise<APITokenResponse> =>
      client.post('/oauth2/token/', tokenQueryString, {
        headers: {
          Authorization: authHeader,
          'content-type': 'application/x-www-form-urlencoded',
        },
      })

    const buildConstructorInput = ({
      accessToken,
      expiresIn,
      refreshToken,
    }: APIClientData): ElationInput => ({
      accessToken,
      expiresIn,
      refreshToken,
      client,
    })

    return getAPITokenAndRefresh()
      .then(handleTokenResponse)
      .then(buildConstructorInput)
      .catch((error: Error) => { throw error })
  }

  return class APIClient {
    client: axios;
    token: string;
    refresh: string;
    expires: number;
    get: (path: string, config?: *) => Promise<axios.Response>;
    post: (path: string, data: *, config?: *) => Promise<axios.Response>;
    put: (path: string, data: *, config?: *) => Promise<axios.Response>;
    delete: (path: string, config?: *) => Promise<axios.Response>;

    initialize = () => createAPIClient(credentials)
      .then(({
        client,
        accessToken,
        refreshToken,
        expiresIn,
      }) => {
        this.client = client
        this.token = accessToken
        this.refresh = refreshToken
        this.expires = new Date().getTime() + expiresIn * 1000
      })
      .catch((error: Error) => { throw error })

    authHeader = (): Promise<Header> => {
      if (this.expires && new Date().getTime() > this.expires) {
        return this.refreshAuthToken()
          .then(() => ({
            Authorization: `Bearer ${this.token}`
          }))
      }

      return Promise.resolve({
        Authorization: `Bearer ${this.token}`
      })
    }

    refreshAuthToken = (): Promise<void> => {
      const refreshQstring: string = QueryString.stringify({
        grant_type: 'refresh_token',
        refresh_token: (this.refresh),
      })

      return this.client.post('/oauth2/token/', refreshQstring, {
        headers: {
          Authorization: `Basic ${authString(credentials)}`,
          'content-type': 'application/x-www-form-urlencoded',
        },
      })
        .then(handleTokenResponse)
        .then(({
          accessToken,
          refreshToken,
          expiresIn,
        }): void => {
          this.token = accessToken
          this.refresh = refreshToken
          this.expires = new Date().getTime() + expiresIn * 1000
        })
    }

    mergeConfig = (config: *, header: Header): Config => ({
      ...config,
      headers: config ? {
        ...config.headers,
        ...header,
      } : header,
    })

    delete = (path: string, config?: *): axios.Request => this.authHeader()
      .then(
        header => this.client.delete(path, this.mergeConfig(config, header))
      )


    get = (path: string, config?: *): axios.Request => this.authHeader()
      .then(header => this.client.get(path, this.mergeConfig(config, header)))

    post = (path: string, data: *, config?: *): axios.Request => this.authHeader()
      .then(header => this.client.post(path, data, this.mergeConfig(config, header)))
    
    put = (path: string, data: *, config?: *): axios.Request => this.authHeader()
      .then(header => this.client
        .put(path, data, this.mergeConfig(config, header)))
  }
}

export type Client = $Call<typeof ClientFactory, ElationCredentials, boolean>

export default ClientFactory
