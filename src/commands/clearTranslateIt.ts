import { ICommand } from '@phoihos/vsce-util';

import * as vscode from 'vscode';

export class ClearTranslateItCommand implements ICommand {
	public readonly id = 'translateIt.clear';

	public constructor(
		private readonly _decorationType: vscode.TextEditorDecorationType,
		private readonly _latestTranslationMap: Map<vscode.TextEditor, vscode.Selection[]>
	) { }

	public async execute(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (editor === undefined) return;

		editor.setDecorations(this._decorationType, []);
		this._latestTranslationMap.clear();

		return vscode.commands.executeCommand('setContext', 'editorHasTranslationHighlighting', false);
	}
}
