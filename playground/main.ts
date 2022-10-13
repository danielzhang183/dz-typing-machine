import { input, output } from '../packages/core/test/fixture'
import { calculatePatch, createAnimator, patch } from '../packages/core/src'

const typingEl = document.getElementById('typing') as HTMLElement
const inputEl = document.getElementById('input') as HTMLTextAreaElement
const outputEl = document.getElementById('output') as HTMLTextAreaElement

inputEl.textContent = input
outputEl.textContent = output

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function start() {
  const _input = input
  const patches = calculatePatch(patch(_input, output))
  const animator = createAnimator(_input, patches)
  for (const result of animator) {
    typingEl.textContent = result.content
    await sleep(100)
  }
}

start()
