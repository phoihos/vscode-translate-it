import { ICommand } from '@phoihos/vsce-util';

import { IConfiguration } from '../configuration'

import * as vscode from 'vscode';

export class ChangeTargetLanguageCommand implements ICommand {
	public readonly id = 'translateIt.changeTargetLanguage';

	public constructor(
		private readonly _runCommand: ICommand,
		private readonly _clearCommand: ICommand,
		private readonly _latestTranslationMap: Map<vscode.TextEditor, vscode.Selection[]>,
		private readonly _config: Readonly<IConfiguration>
	) { }

	public async execute(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (editor === undefined) return;

		const quickPickOptions = { placeHolder: "Select Target Language" };
		const pickedLanguage = await vscode.window.showQuickPick(this._config.supportedLanguages, quickPickOptions);
		if (pickedLanguage === undefined || pickedLanguage === this._config.targetLanguage) return;

		const selections = this._latestTranslationMap.get(editor);
		if (selections === undefined) return;

		const preTaskHandler = async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
			progress.report({ message: `Changing target language to "${pickedLanguage}" ...` });
			await this._config.updateTargetLanguage(pickedLanguage);
			await this._clearCommand.execute();
		}

		return this._runCommand.execute({ editor, selections, preTaskHandler });
	}
}
