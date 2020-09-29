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
	const decoType = vscode.window.createTextEditorDecorationType({
		backgroundColor: decoBgColor,
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	});

	const outputChannel = vscode.window.createOutputChannel('Translate it');

	const commandCallback = async (editor: vscode.TextEditor) => {
		const document = editor.document;
		const selections = editor.selections;
		const languageId = document.languageId;
		const eol = (document.eol == vscode.EndOfLine.LF) ? '\n' : '\r\n';

		if (selections.length == 1 && selections[0].isEmpty) {
			editor.setDecorations(decoType, []);
			return;
		}

		const config = getConfiguration();

		const selectedTexts: string[] = [];
		const selectedRanges: vscode.Range[] = [];

		for (const selection of selections) {
			let line = selection.start.line;
			do {
				const { text, range, firstNonWhitespaceCharacterIndex } = document.lineAt(line);

				const startIndex = range.start.isBefore(selection.start) ?
					selection.start.character : range.start.character;
				const startCharacter = Math.max(startIndex, firstNonWhitespaceCharacterIndex);
				const endCharacter = range.end.isAfter(selection.end) ?
					selection.end.character : range.end.character;

				selectedTexts.push(text.substring(startCharacter, endCharacter));
				selectedRanges.push(new vscode.Range(line, startCharacter, line, endCharacter));
			} while (line++ < selection.end.line);
		}

		const [parsedText, parsedRanges] = parseText(selectedTexts, eol, selectedRanges, languageId);

		await vscode.window.withProgress({
			title: 'Translating...',
			location: vscode.ProgressLocation.Notification,
		}, async () => {
			const [translatedText, fromTo] = await translateText(parsedText, config.targetLanguage);
			const horizontalRule = '-'.repeat(Math.max(fromTo.length, 3));
			const header = `${fromTo}\n${horizontalRule}\n`;

			if (config.hoverDisplay) {
				const hoverMessage = new vscode.MarkdownString();
				hoverMessage.appendMarkdown(config.hoverDisplayHeader ? header.replace(/\n/g, '\n\n') : '');
				hoverMessage.appendMarkdown(config.hoverMultiLineFormatting ? translatedText.replace(/\n/g, '\n\n') : translatedText);
				hoverMessage.isTrusted = true;

				const decoOptions = parsedRanges.map(e => ({ hoverMessage: hoverMessage, range: e }));
				editor.setDecorations(decoType, decoOptions);
	
				const lastPosition = selections[selections.length - 1].end;
				editor.selection = new vscode.Selection(lastPosition, lastPosition);
	
				editor.revealRange(selections[0]);
				
				vscode.commands.executeCommand('editor.action.showHover');
			}

			outputChannel.appendLine(header + translatedText);
			outputChannel.appendLine('');
			if (!config.hoverDisplay) outputChannel.show();
		});
	}

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('translateIt.run', commandCallback));
}

// this method is called when your extension is deactivated
export function deactivate() { }
