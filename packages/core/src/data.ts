export const input = `
import { describe, expect, it } from 'vitest'

describe('should', () => {
  it('exported', () => {
    expect(one).toEqual(1)
  })
})
`

export const output = `
import { describe, expect, it } from 'vitest'

describe('should', () => {
  it('one', () => {
    expect(one).toEqual(1)
  })

  it('two', () => {
    expect(two).toEqual(2)
  })
})
`
