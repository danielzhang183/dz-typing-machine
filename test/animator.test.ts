import { describe, expect, it } from 'vitest'
import { calculatePatch, createAnimator, patch } from '../packages/core/src'
import { input, output } from '../packages/core/src/data'

describe('should', () => {
  it('animator', () => {
    const delta = patch(input, output)
    const patches = calculatePatch(delta)
    const animator = createAnimator(input, patches)
    expect([...animator]).toMatchSnapshot('animator')
  })
})
