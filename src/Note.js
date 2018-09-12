// @flow
import type { ID } from './shared'

type NoteTemplate =
  | 'Simple'
  | 'SOAP'

type BulletType =
  | 'Problem'
  | 'Past'
  | 'Family'
  | 'Social'
  | 'Instr'
  | 'PE'
  | 'ROS'
  | 'Med'
  | 'Data'
  | 'Assessment'
  | 'Test'
  | 'Tx'
  | 'Narrative'
  | 'Followup'
  | 'Reason'
  | 'Plan'
  | 'Objective'
  | 'Hpi'
  | 'Allergies'
  | 'Habits'
  | 'Assessplan'
  | 'Consultant'
  | 'Attending'
  | 'Dateprocedure'
  | 'Surgical'
  | 'Orders'
  | 'Referenced'
  | 'Procedure'

type Bullet = {
  +category: BulletType,
  +text: string,
}

type NoteInput = {
  +id?: ID,
  +type: string,
  +template: NoteTemplate,
  +patient: ID,
  +physician: ID,
  +document_date: string,
  +chart_date: string,
  +bullets: Bullet[],
}

type NewNoteInput = {
  +type: string,
  +template: NoteTemplate,
  +patient: ID,
  +physician: ID,
  +bullets?: ?Bullet[],
  +chart_date?: string,
  +document_date?: string,
}

type NoteSearchInput = {
  +patient: ID[],
  +physician: ID[],
  +practice: ID[],
}

const noteFactory = (client: *): * => class Note {
  id: ?ID;
  type: string;
  template: NoteTemplate;
  patient: ID;
  physician: ID;
  document_date: string;
  chart_date: string;
  bullets: Bullet[];

  constructor(input: NoteInput) {
    this.id = input.id
    this.type = input.type
    this.template = input.template
    this.patient = input.patient
    this.physician = input.physician
    this.bullets = input.bullets
    this.chart_date = input.chart_date
    this.document_date = input.document_date
  }

  addBullet = (bullet: Bullet) => {
    this.bullets = this.bullets.concat(bullet)
    return this
  }

  removeBullet = (idx: number) => {
    this.bullets = idx > 0 ? [
      ...this.bullets.slice(0, idx),
      ...this.bullets.slice(idx + 1),
    ] : this.bullets.slice(idx + 1)
    return this
  }

  save = (): Promise<Note> => {
    return Note.postToElation(this)
  }

  static build(input: NewNoteInput): Note {
    const newNoteData: NoteInput = {
      type: input.type,
      template: input.template,
      patient: input.patient,
      physician: input.physician,
      bullets: input.bullets || [],
      chart_date: input.chart_date || new Date().toISOString(),
      document_date: input.document_date || new Date().toISOString(),
    }

    return new this(newNoteData)
  }

  static create(input: NewNoteInput): Promise<Note> {
    const note = this.build(input)
    return this.postToElation(note)
  }

  static postToElation(note: Note): Promise<Note> {
    return client.post('visit_notes/', JSON.stringify(note))
      .then(({ data }) => new this(data))
  }

  static getNote(id: ID): Promise<Note> {
    return client.get(`visit_notes/${id}`)
      .then(({ data }) => new this(data))
  }

  static findNotes(input: NoteSearchInput): Promise<Note[]> {
    const searchQString: string = Object.keys(input).reduce((qString: string, key) => qString.concat(input[key].map(data => `&${key}[]=${data}`).join('')), '')
    return client.get(`visit_notes/${searchQString.replace(/^&/, '?')}`)
      .then(({ data }) => data.results.map(note => new this(note)))
  }

  static delete(id: ID): Promise<void> {
    return client.delete(`visit_notes/${id}`)
      .then(() => ({
        id,
        deleted: true,
      }))
  }
}

export default noteFactory
