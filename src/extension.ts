// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import parseText from './textParser';
import translateText from './textTranslator'
import getConfiguration from './configuration'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const decoBgColor = new vscode.ThemeColor('editor.wordHighlightStrongBackground');
	const decoType = vscode.window.createTextEditorDecorationType({ backgroundColor: decoBgColor })

	const outputChannel = vscode.window.createOutputChannel('Translate it');

	const commandCallback = async (editor: vscode.TextEditor) => {
		const document = editor.document;
		const selections = editor.selections;
		const languageId = document.languageId;

		if (selections.length == 1 && selections[0].isEmpty) {
			editor.setDecorations(decoType, []);
			return;
		}

		const config = getConfiguration();

		let text = '';
		for (const selection of selections) {
			text += document.getText(selection);
		}
		text = parseText(text, languageId);

		await vscode.window.withProgress({
			title: 'Translating...',
			location: vscode.ProgressLocation.Notification,
		}, async () => {
			const [translated, fromTo] = await translateText(text, config.targetLanguage);
			const horizontalRule = '-'.repeat(Math.max(fromTo.length, 3));
			const header = `${fromTo}\n${horizontalRule}\n`;

			if (config.hoverDisplay) {
				const hoverMessage = new vscode.MarkdownString();
				hoverMessage.appendMarkdown(config.hoverDisplayHeader ? header.replace(/\n/g, '\n\n') : '');
				hoverMessage.appendMarkdown(config.hoverMultiLineFormatting ? translated.replace(/\n/g, '\n\n') : translated);
				hoverMessage.isTrusted = true;

				const decoOptions = selections.map(e => ({ hoverMessage: hoverMessage, range: e }));

				editor.setDecorations(decoType, decoOptions);
				vscode.commands.executeCommand('editor.action.showHover');
			}

			outputChannel.show(!config.hoverDisplay);
			outputChannel.appendLine(header + translated);
			outputChannel.appendLine('');
		});
	}

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('translateIt.run', commandCallback));
}

// this method is called when your extension is deactivated
export function deactivate() { }
