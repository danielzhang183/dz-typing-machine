import { describe, expect, it } from 'vitest'
import { applyPatch, calculatePatch, patch } from '../src'
import { input, output } from './../src/data'

describe('should', () => {
  it('exported', () => {
    const diff = patch(input, output)
    expect(diff).toMatchSnapshot('diff')
    const patches = calculatePatch(diff)
    expect(patches).toMatchSnapshot('patches')
    const res = applyPatch(input, patches)
    expect(res).toMatchSnapshot('res')
  })
})
