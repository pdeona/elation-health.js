# `elation.js`

## Elation Health API Client - Node.js

A Node.js client for the Elation Health API. Work In Progress, pull requests accepted.

## Usage

```js
// elation-client.js
import Elation from 'elationjs'

const credentials = { // your Elation API credentials
  clientID: string,
  clientSecret: string,
  username: string,
  password: string,
}
const sandbox: boolean = false // Use sandbox API URL. default: true

const apiClient = new Elation(credentials, sandbox)
apiClient.initialize()

export default apiClient
```

### Patient endpoints

Create:

```js
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

elationClient.Patient().postPatient(patient: PatientData): Promise<Patient>
```

Get One:

```js
elationClient.Patient().getPatient(id: ID): Promise<Patient>
```

Search:

```js
type FindPatientsData = {
  first_name?: string,
  last_name?: string,
  dob?: string,
  sex?: string,
}

elationClient.Patient().findPatients(search: PatientQuery): Promise<Patient[]>
```

Update:

```js
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

elationClient.Patient().update(patientID: ID, updateData: PatientUpdateData): Promise<Patient[]>
```

### Note Endpoints

Build/Save:

```js
const Note = elationClient.Note()
const data = {
  type: 'Visit Note',
  template: 'Simple',
  patient: 12345678,
  physician: 12345678,
  chart_date: new Date().toISOString(),
  document_date: new Date().toISOString(),
}
const note = new Note(data)
note.addBullet({
  category: 'Assessment',
  text: 'Patient is feeling bad',
})
note.addBullet({
  category: 'Assessment',
  text: 'Patient is feeling bad',
})
note.removeBullet(1) // remove bullets by index (bullets can't have an ID field)
note.save().then(note => console.log('Note saved: ', note))
```

Create:

```js
type NoteInput = // see Flowtypes in src/Note.js for complete Note input type

elationClient.Note().create(note: NoteInput): Promise<Note>
```

Get One:

```js
elationClient.Note().getNote(id: ID): Promise<Note>
```

Search:

```js
type NoteSearchInput = {
  +patient: ID[],
  +physician: ID[],
  +practice: ID[],
}

elationClient.Note().findNotes(query: NoteSearchInput): Promise<Note[]>
```

Delete:

```js
elationClient.Note().delete(id: NoteID): Promise<{ id: NoteID, deleted: true }>
```

## Contributions

Pull requests welcome, need help with adding endpoint coverage and starting the test library.
