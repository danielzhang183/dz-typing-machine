import { describe, expect, it } from 'vitest'
import { applyPatches, calculatePatch, patch } from '../src'
import { input, output } from './fixture'

describe('should', () => {
  it('exported', () => {
    const diff = patch(input, output)
    expect(diff).toMatchSnapshot('diff')
    const patches = calculatePatch(diff)
    expect(patches).toMatchSnapshot('patches')
    const res = applyPatches(input, patches)
    expect(res).toMatchSnapshot('res')
  })
})
