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
  let index = 0
  for (const change of diff) {
    const length = change[1].length
    if (change[0] === 0) {
      index += length
      continue
    }
    else if (change[0] === -1) {
      patches.push({
        type: 'removal',
        from: index + length,
        length,
      })
    }
    else if (change[0] === 1) {
      patches.push({
        type: 'insert',
        from: index,
        text: change[1],
      })
      index += length
    }
    else {
      throw new Error('Unknown Patch Type')
    }
  }

  return patches
}

export function applyPatch(input: string, patches: Patch[]) {
  let output = input

  for (const patch of patches) {
    if (patch.type === 'insert') {
      output = output.slice(0, patch.from) + patch.text + output.slice(patch.from)
    }
    else if (patch.type === 'removal') {
      const end = (patch.from - patch.length - 1) < 0 ? 0 : patch.from - patch.length - 1
      output = output.slice(0, end) + output.slice(patch.from)
    }
  }

  return {
    output,
  }
}
