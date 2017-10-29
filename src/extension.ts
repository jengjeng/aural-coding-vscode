'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import AuralCoding from './lib/main'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  AuralCoding.activate()
  console.log('"aural-coding-vscode" is now active!');

  let disposable: vscode.Disposable = null

  disposable = vscode.commands.registerCommand(`extension.aural-coding-vscode-enable`, async () => {
    AuralCoding.deactivate()
    AuralCoding.activate()
    await saveState(context, { enabled: true })
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(`extension.aural-coding-vscode-disable`, async () => {
    AuralCoding.deactivate()
    await saveState(context, { enabled: false })
  });
  context.subscriptions.push(disposable);

  disposable = vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
    if (!AuralCoding.isActivated()) return;

    const { contentChanges: [{ text }] } = event
    const textKey = text[0] || ''
    const isShift = textKey.toUpperCase() === textKey
    handleKey(textKey, isShift)
  })
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  AuralCoding.deactivate()
}

async function saveState(context: vscode.ExtensionContext, value: any) {
  await context.globalState.update('app', value)
}

async function getState(context: vscode.ExtensionContext) {
  return await context.globalState.get('app', { enabled: true })
}

async function handleKey(
  key: string,
  isShift: boolean = false,
  isCtrl: boolean = false,
  isAlt: boolean = false
): Promise < void > {
  
  await AuralCoding.auralCoding.noteOn({
    keyIdentifier: key,
    shiftKey: isShift,
    ctrlKey: isCtrl,
    altKey: isAlt,
  })
}
