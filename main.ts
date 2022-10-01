import _TypeIt from 'typeit'
import { calculatePatch, patch } from './src/index'

const TypeIt = _TypeIt as any
let typeIt: any

const typingEl = document.getElementById('typing') as HTMLElement
const inputEl = document.getElementById('input') as HTMLTextAreaElement
const outputEl = document.getElementById('output') as HTMLTextAreaElement

const input = `
import { describe, expect, it } from 'vitest'

describe('should', () => {
  it('exported', () => {
    expect(one).toEqual(1)
  })
})
`
const output = `
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

inputEl.textContent = input
outputEl.textContent = output

function start() {
  if (typeIt)
    typeIt.reset()

  typingEl.textContent = ''
  typeIt = new TypeIt(typingEl, {
    speed: 50,
    startDelay: 900,
  })

  typeIt
    .type(input, { instant: true })

  const patches = calculatePatch(patch(input, output))
  for (const patch of patches) {
    typeIt.pause(800)
    if (patch.type === 'insert') {
      typeIt
        .move(null, { to: 'START', instant: true })
        .move(patch.from, { instant: true })
        .type(patch.text, { delay: 300 })
    }
    else {
      typeIt
        .move(null, { to: 'START', instant: true })
        .move(patch.from, { instant: true })
        .delete(patch.length)
    }
  }

  typeIt.go()
}

start()
