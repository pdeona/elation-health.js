// @flow
import QueryString from 'query-string'
import type { ID } from './shared'

type Address = {
  address_line1: string,
  address_line2?: string,
  city?: string,
  state?: string,
  zip?: string | number,
}

type PhoneType = 'Fax' | 'Mobile' | 'Work' | 'Other' | 'Night' | 'Home' | 'Main'

type Email = {| email: string |}

type Phone = {| phone: (string | number), phone_type: PhoneType |}

type Response = {
  data: PatientData
}

type MultiResponse = {
  data: { result: PatientData[] },
}

type PatientMetadata = {
  +object_id: ID,
  data: {
    [key: string]: string
      | string[]
      | number
      | number[]
      | Object
      | Object[],
  },
}

type PatientData = {
  id: ID,
  first_name: string,
  last_name: string,
  dob: string,
  sex: string,
  primary_physician: ID,
  caregiver_practice: ID,
  address: Address,
  phones: Phone[],
  email: Email[],
  metadata: PatientMetadata,
}

type PatientUpdateData = {
  first_name?: string,
  last_name?: string,
  dob?: string,
  sex?: string,
  primary_physician?: ID,
  caregiver_practice?: ID,
  address?: Address,
  phones?: Phone[],
  email?: Email[],
  metadata?: PatientMetadata,
}

type FindPatientsData = {
  first_name?: string,
  last_name?: string,
  dob?: string,
  sex?: string,
}

export default function PatientsFactory(client: *): * {
  return class Patient {
    id: ID;
    first_name: string;
    last_name: string;
    dob: string;
    sex: string;
    primary_physician: ID;
    caregiver_practice: ID;
    address: Address;
    phones: Phone[];
    email: Email[];
    metadata: PatientMetadata;

    constructor(input: PatientData) {
      this.id = input.id
      this.first_name = input.first_name
      this.last_name = input.last_name
      this.dob = input.dob
      this.sex = input.sex
      this.primary_physician = input.primary_physician
      this.caregiver_practice = input.caregiver_practice
      this.address = input.address
      this.phones = input.phones
      this.email = input.email
      this.metadata = input.metadata
    }

    toObject = (): PatientData => ({
      id: this.id,
      first_name: this.first_name,
      last_name: this.last_name,
      dob: this.dob,
      sex: this.sex,
      primary_physician: this.primary_physician,
      caregiver_practice: this.caregiver_practice,
      address: this.address,
      phones: this.phones,
      email: this.email,
      metadata: this.metadata,
    })

    static update(patientID: ID, input: PatientUpdateData): Promise<Response> {
      return client.put(`patients/${patientID}`, JSON.stringify(input))
        .then(({ data }) => new this(data))
    }

    static findPatients(searchData: FindPatientsData): Promise<MultiResponse> {
      return client.get(`/patients/?${QueryString.stringify(searchData)}`)
        .then(({ data }) => data.results.map(patient => new this(patient)))
    }

    static getPatient(id: ID): Promise<Response> {
      return client.get(`patients/${id}`)
        .then(({ data }) => new this(data))
    }

    static postPatient(patient: PatientData): Promise<Response> {
      return client.post('/patients/', JSON.stringify(patient))
        .then(({ data }) => new this(data))
    }
  }
}
