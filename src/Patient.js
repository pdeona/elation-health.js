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

type Insurance = {
  insurance_company: number,
  insurance_plan: number,
  rank: 'primary' | 'secondary' | 'tertiary',
  carrier: string,
  member_id: string,
  group_id: string,
  plan: string,
  phone: string,
  extension: string,
  address_line1: string,
  address_line2: string,
  city: string,       
  state: string,
  zip: number,
  copay: number,  
  deductible: number,   
  insured_person_first_name: string,
  insured_person_last_name: string,
  insured_person_address: string,
  insured_person_city: string,
  insured_person_state: string,    
  insured_person_zip: number,
  insured_person_dob: string,    
  insured_person_gender: 'F' | 'M',
  insured_person_ssn: number, 
  relationship_to_insured: string,     
}

export type PatientData = {
  id: ID,
  first_name: string,
  last_name: string,
  dob: string,
  sex: string,
  primary_physician: ID,
  caregiver_practice: ID,
  address: Address,
  phones: Phone[],
  emails: Email[],
  metadata: PatientMetadata,
  insurances: Insurance[],
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
  emails?: Email[],
  metadata?: PatientMetadata,
  insurances?: Insurance[],
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
    emails: Email[];
    metadata: PatientMetadata;
    insurances: Insurance[]

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
      this.emails = input.emails
      this.metadata = input.metadata
      this.insurances = input.insurances
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
      emails: this.emails,
      metadata: this.metadata,
      insurances: this.insurances,
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
