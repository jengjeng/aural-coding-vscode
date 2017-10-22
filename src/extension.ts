'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import AuralCoding from './lib/main'

interface VSCodeKeybinding {
  key: string;
  specialKey?: boolean,
  command: string;
  when: string;
}

const packagejson: {
  contributes: {
    keybindings: VSCodeKeybinding[];
  }
} = require('../package.json');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  AuralCoding.activate()

  // const editor = vscode.window.activeTextEditor;
  // console.log(editor)
  
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('"aural-coding-vscode" is now active!');
  let disposable = null

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

  for (let { key, specialKey, command } of packagejson.contributes.keybindings) {
    const keyCodeAndBranch = command.split('aural-coding-vscode_')[1].split('_')
    const keyCode = +keyCodeAndBranch[0]
    const branch = keyCodeAndBranch[1]
    const keyText = String.fromCharCode(keyCode)
    const isShiftRg = new RegExp('Shift\\+', "gi");
    const isCtrlRg = new RegExp('Ctrl\\+', "gi");
    const isAltRg = new RegExp('Alt\\+', "gi");
    const isShift = isShiftRg.test(key)
    const isCtrl = isCtrlRg.test(key)
    const isAlt = isAltRg.test(key)
    
    disposable = vscode.commands.registerCommand(`extension.aural-coding-vscode_${ keyCode }${ branch ? '_' + branch : ''}`, () => {
      handleKey(context, key, specialKey, keyText, keyCode, isShift, isCtrl, isAlt);
    });
    context.subscriptions.push(disposable);
  }
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
  context: vscode.ExtensionContext,
  key: string,
  specialKey: boolean,
  keyText: string,
  keyCode: number,
  isShift: boolean,
  isCtrl: boolean,
  isAlt: boolean
): Promise < void > {
  
  await vscode.commands.executeCommand('default:type', {
    text: keyText
  });
  
  const { enabled } = await getState(context)
  if (enabled === false) return;
  await AuralCoding.auralCoding.noteOn({
    keyIdentifier: specialKey ? key : keyText,
    shiftKey: isShift,
    ctrlKey: isCtrl,
    altKey: isAlt,
  })
}
