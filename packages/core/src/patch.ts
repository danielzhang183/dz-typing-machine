import { diff_match_patch as DMP } from 'diff-match-patch'
import type { Diff } from 'diff-match-patch'
import type { Patch } from './types'

export function patch(input: string, output: string): Diff[] {
  const differ = new DMP()
  const delta = differ.diff_main(input, output)
  differ.diff_cleanupSemantic(delta)

  return delta
}

export function calculatePatch(diff: Diff[]): Patch[] {
  const patches: Patch[] = []
  let cursor = 0
  for (const change of diff) {
    const length = change[1].length
    if (change[0] === 0) {
      cursor += length
      continue
    }
    else if (change[0] === -1) {
      patches.push({
        type: 'removal',
        cursor: cursor + length,
        length,
      })
    }
    else if (change[0] === 1) {
      patches.push({
        type: 'insert',
        cursor,
        content: change[1],
      })
      cursor += length
    }
    else {
      throw new Error('Unknown Patch Type')
    }
  }

  return patches
}
