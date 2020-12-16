import { ICommand } from '../commandManager';

import * as vscode from 'vscode';

export class ClearTranslateItCommand implements ICommand {
	public readonly id = 'translateIt.clear';

	public constructor(
		private readonly _decorationType: vscode.TextEditorDecorationType,
		private readonly _latestTranslationMap: Map<vscode.TextEditor, vscode.Selection[]>
	) { }

	public async execute(): Promise<void> {
		const { activeTextEditor } = vscode.window;
		if (!activeTextEditor) return;

		activeTextEditor.setDecorations(this._decorationType, []);
		this._latestTranslationMap.clear();

		return vscode.commands.executeCommand('setContext', 'editorHasTranslationHighlighting', false);
	}
}
