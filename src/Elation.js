// @flow
import note from './Note'
import patient from './Patient'
import api from './Client'
import type { Client } from './Client'
import type { ElationCredentials } from './Client'

class Elation {
  client: Client;
  initialize: () => Promise<void>;
  Patient: () => $Call<typeof patient, Client>;
  Note: () => $Call<typeof note, Client>;

  constructor(credentials: ElationCredentials, sandbox: boolean = true) {
    const APIClient: Client = api(credentials, sandbox)
    this.client = new APIClient()
    this.initialize = this.client.initialize
  }

  Patient = () => patient(this.client)

  Note = () => note(this.client)
}

export default Elation
