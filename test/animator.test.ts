import { describe, expect, it } from 'vitest'
import { calculatePatch, createAnimator, patch } from '../src'
import { input, output } from './../src/data'

describe('should', () => {
  it('animator', () => {
    const delta = patch(input, output)
    const patches = calculatePatch(delta)
    const animator = createAnimator(input, patches)
    expect([...animator]).toMatchSnapshot('animator')
  })
})
