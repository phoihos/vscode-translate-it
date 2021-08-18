import * as vscode from 'vscode';

import { EventListenerBase } from '@phoihos/vsce-util';

export class RemoveTranslationHighlightingListener extends EventListenerBase {
  public constructor(
    private readonly _decorationType: vscode.TextEditorDecorationType,
    private readonly _latestTranslationMap: Map<vscode.TextEditor, vscode.Selection[]>
  ) {
    super();

    let subscriptions: vscode.Disposable[] = [];
    vscode.window.onDidChangeActiveTextEditor(
      this._onDidChangeActiveTextEditor,
      this,
      subscriptions
    );
    this.register(subscriptions);
  }

  private _onDidChangeActiveTextEditor(_editor?: vscode.TextEditor) {
    if (this._latestTranslationMap.size === 0) return;

    this._latestTranslationMap.forEach((_v, k) => k.setDecorations(this._decorationType, []));
    this._latestTranslationMap.clear();

    vscode.commands.executeCommand('setContext', 'editorHasTranslationHighlighting', false);
  }
}
