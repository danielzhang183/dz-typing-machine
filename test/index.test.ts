import { describe, expect, it } from 'vitest'
import { applyPatch, calculatePatch, patch } from '../src'

const input = 'Good Dog'
const output = 'Bad Dog'

describe('should', () => {
  it('exported', () => {
    const diff = patch(input, output)
    expect(diff).toMatchInlineSnapshot(`
      [
        [
          -1,
          "Goo",
        ],
        [
          1,
          "Ba",
        ],
        [
          0,
          "d Dog",
        ],
      ]
    `)
    const patches = calculatePatch(diff)
    expect(patches).toMatchInlineSnapshot(`
      [
        {
          "from": 3,
          "length": 3,
          "type": "removal",
        },
        {
          "from": 0,
          "text": "Ba",
          "type": "insert",
        },
      ]
    `)
    const res = applyPatch(input, patches)
    expect(res).toMatchInlineSnapshot(`
      {
        "output": "Bad Dog",
      }
    `)
  })
})
