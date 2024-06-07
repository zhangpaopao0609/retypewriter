import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import type { TextDocument, TextEditor } from 'vscode'
import { Uri, ViewColumn, window, workspace } from 'vscode'
import { getOriginalFilePath } from '../../core/src'

export async function resolveDoc(doc?: TextDocument | Uri): Promise<{
  doc?: TextDocument
  editor?: TextEditor
}> {
  if (doc instanceof Uri) {
    const path = getOriginalFilePath(doc.fsPath) || doc.fsPath
    doc = await workspace.openTextDocument(Uri.file(path))
  }
  doc = doc || window.activeTextEditor?.document
  if (!doc)
    return {}

  const editor = await window.showTextDocument(doc)

  return {
    doc,
    editor,
  }
}

export async function openPlayEditor(doc: TextDocument) {
  let filePath: string | null = null

  // Get the original file name and extension
  const { ext, name } = path.parse(doc.uri.fsPath)

  // Create a temporary file with the same name and extension in the current directory
  filePath = path.join(path.dirname(doc.uri.fsPath), `${name}-playing${ext}`)
  await fs.writeFile(filePath, doc.getText())

  // Open the temporary file in a new editor
  const playingDoc = await workspace.openTextDocument(filePath)
  const editor = await window.showTextDocument(playingDoc, ViewColumn.Beside)

  const disposable = window.onDidChangeVisibleTextEditors(async (editors) => {
    if (filePath && !editors.some(editor => editor.document.uri.fsPath === filePath)) {
      await fs.unlink(filePath)
      filePath = null

      if (disposable)
        disposable.dispose()
    }
  })

  return editor
}

export async function reveal(uri: Uri) {
  const doc = await workspace.openTextDocument(uri)
  await window.showTextDocument(doc)
}
