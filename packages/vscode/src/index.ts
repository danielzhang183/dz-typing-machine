import { existsSync, promises as fs } from 'fs'
import { Range, Selection, commands, window, workspace } from 'vscode'
import { SnapshotManager, Snapshots } from '../../core/src'

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

  const watcher = workspace.createFileSystemWatcher(`**/*\\${snapExt}`)
  watcher.onDidChange(uri => manager.delete(uri.path.replace(snapExt, '')))
  watcher.onDidDelete(uri => manager.delete(uri.path.replace(snapExt, '')))
  watcher.onDidCreate(uri => manager.delete(uri.path.replace(snapExt, '')))

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
        await commands.executeCommand('typingMachine.snap')
    }

    window.showInformationMessage('typingMachine: Playing...')

    const setCursor = (index: number) => {
      const pos = doc.positionAt(index)
      editor.selection = new Selection(pos, pos)
    }
    for (const snap of snaps.animate()) {
      switch (snap.type) {
        case 'init':
          editor.edit((edit) => {
            edit.replace(
              new Range(0, 0, Infinity, Infinity),
              snap.content!,
            )
          })
          break
        case 'new-snap':
          await sleep(900)
          break
        case 'new-patch':
          await sleep(900)
          break
        case 'insert':
          await editor.edit(edit => edit.insert(
            doc.positionAt(snap.cursor - 1),
            snap.char,
          ))
          setCursor(snap.cursor)
          await sleep(Math.random() * 60)
          break
        case 'removal':
          await editor.edit(edit => edit.delete(new Range(
            doc.positionAt(snap.cursor),
            doc.positionAt(snap.cursor + 1),
          )))
          setCursor(snap.cursor)
          await sleep(Math.random() * 10)
          break
      }
    }

    window.showInformationMessage('typingMachine: Finished...')
  })
}

export function deactivate() {

}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
