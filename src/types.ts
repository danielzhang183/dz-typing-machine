export interface InsertPatch {
  type: 'insert'
  from: number
  text: string
}

export interface DeletePatch {
  type: 'removal'
  from: number
  length: number
}

export type Patch = InsertPatch | DeletePatch
