import { existsSync, promises as fs } from 'fs'
import { Range, Selection, commands, window, workspace } from 'vscode'
import { SnapshotManager, Snapshots, simpleAnimator } from '../../core/src'

const snapExt = '.typingMachine'

export function activate() {
  function getSnapPath(id: string) {
    return id + snapExt
  }

  const manager = new SnapshotManager({
    async ensureFallback(path) {
      const filepath = getSnapPath(path)
      if (existsSync(filepath)) {
        const content = await fs.readFile(filepath, 'utf-8')
        const snap = Snapshots.fromString(content)
        window.showInformationMessage('typingMachine: Snapshots loaded from file')

        return snap
      }
    },
  })

  workspace.createFileSystemWatcher(`**/*\\${snapExt}`)
    .onDidCreate((uri) => {
      manager.delete(uri.path.replace(snapExt, ''))
    })

  async function writeSnapshots(path: string, snap: Snapshots) {
    const filepath = getSnapPath(path)
    await fs.writeFile(filepath, snap.toString(), 'utf-8')
  }

  commands.registerCommand('typingMachine.snap', async () => {
    const doc = window.activeTextEditor?.document
    if (!doc)
      return
    const path = doc.uri.fsPath
    if (path.endsWith(snapExt))
      return

    const snaps = await manager.ensure(path)

    snaps.push({ content: doc.getText() })
    await writeSnapshots(path, snaps)

    window.showInformationMessage(`typingMachine: Snapshot added (${snaps.length})`)
  })

  commands.registerCommand('typingMachine.play', async () => {
    const editor = window.activeTextEditor
    const doc = editor?.document
    if (!editor || !doc)
      return

    const path = doc.uri.fsPath
    const snaps = await manager.ensure(path)
    if (!snaps?.length) {
      window.showErrorMessage('typingMachine: No Snapshot Found!')
      return
    }

    const lastSnap = snaps[snaps.length - 1]
    if (lastSnap.content !== doc.getText()) {
      const take = 'Take Snapshot'
      const discard = 'Discard'
      const cancel = 'Cancel'

      const result = await window.showInformationMessage(
        'The current document has been modified since last snapshot. Do you want take another snapshot?',
        { modal: true },
        take,
        discard,
        cancel,
      )
      if (!result || result === cancel)
        return
      if (result === take)
        await commands.executeCommand('retypewriter.snap')
    }

    window.showInformationMessage('typeMachine: Playing...')
    let lastContent: string | undefined
    for (const snap of snaps) {
      if (!lastContent) {
        lastContent = snap.content
        editor.edit((edit) => {
          edit.replace(
            new Range(0, 0, Infinity, Infinity),
            lastContent!,
          )
        })

        continue
      }

      const animator = simpleAnimator(lastContent, snap.content)
      let lastIndex = -1
      for (const result of animator) {
        if (lastIndex !== result.patchIndex)
          await sleep(900)

        await editor.edit((edit) => {
          if (result.char != null) {
            edit.insert(
              doc.positionAt(result.cursor - 1),
              result.char,
            )
          }
          else {
            const range = new Range(
              doc.positionAt(result.cursor),
              doc.positionAt(result.cursor + 1),
            )
            edit.delete(range)
          }
        })

        const pos = doc.positionAt(result.cursor)
        editor.selection = new Selection(pos, pos)

        await sleep(Math.random() * 60)
        lastIndex = result.patchIndex
      }

      lastContent = snap.content
    }

    window.showInformationMessage('typeMachine: Finished...')
  })
}

export function deactivate() {

}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
