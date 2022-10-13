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

export interface Snapshot {
  content: string
  options?: SnapshotOptions
}

export interface SnapshotOptions {
  wait?: number
  pause?: boolean
}

export interface AnimatorStepInsert {
  type: 'insert'
  cursor: number
  content: string
  char: string
}

export interface AnimatorStepRemoval {
  type: 'removal'
  cursor: number
  content: string
}

export interface AnimatorStepInit {
  type: 'init'
  content: string
}

export interface AnimatorStepPatch {
  type: 'new-patch'
  patch: Patch
  index: number
}

export interface AnimatorStepSnap {
  type: 'new-snap'
  snap: Snapshot
  index: number
}

export type AnimatorStep = AnimatorStepInsert | AnimatorStepRemoval | AnimatorStepSnap | AnimatorStepInit | AnimatorStepPatch
