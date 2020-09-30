// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import parseText from './textParser';
import translateText from './textTranslator'
import getConfiguration from './configuration'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const decoType = vscode.window.createTextEditorDecorationType({
		backgroundColor: new vscode.ThemeColor('editor.wordHighlightStrongBackground'),
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	});

	const outputChannel = vscode.window.createOutputChannel('Translate it');
	const config = getConfiguration();

	const latestTranslationRange = new WeakMap<vscode.TextEditor, vscode.Range[]>();

	async function translate(editor: vscode.TextEditor, ranges: vscode.Range[]) {
		const document = editor.document;
		const languageId = document.languageId;
		const eol = (document.eol === vscode.EndOfLine.LF) ? '\n' : '\r\n';

		const lineTexts: string[] = [];
		const lineRanges: vscode.Range[] = [];

		for (const range of ranges) {
			let line = range.start.line;
			do {
				const { text, range, firstNonWhitespaceCharacterIndex } = document.lineAt(line);

				const startIndex = range.start.isBefore(range.start) ?
					range.start.character : range.start.character;
				const startCharacter = Math.max(startIndex, firstNonWhitespaceCharacterIndex);
				const endCharacter = range.end.isAfter(range.end) ?
					range.end.character : range.end.character;

				lineTexts.push(text.substring(startCharacter, endCharacter));
				lineRanges.push(new vscode.Range(line, startCharacter, line, endCharacter));
			} while (line++ < range.end.line);
		}

		const { parsedText, parsedRanges } = parseText(lineTexts, eol, lineRanges, languageId);

		await vscode.window.withProgress({
			title: 'Translating...',
			location: vscode.ProgressLocation.Notification,
		}, async () => {
			const { translatedText, sourceLanguage: from, targetLanguage: to } =
				await translateText(parsedText, config.targetLanguage);

			const hline = '-'.repeat(from.length + to.length + 3);

			if (config.hoverDisplay) {
				const hoverMessage = new vscode.MarkdownString();
				hoverMessage.appendMarkdown(config.hoverDisplayHeader ?
					`${from} → [${to}](command:translateIt.changeTargetLanguage)\n\n${hline}\n\n` : '');
				hoverMessage.appendMarkdown(config.hoverMultiLineFormatting ?
					translatedText.replace(/\n/g, '\n\n') : translatedText);
				hoverMessage.isTrusted = true;

				const decoOptions = parsedRanges.map(e => ({ hoverMessage: hoverMessage, range: e }));
				editor.setDecorations(decoType, decoOptions);

				const lastPosition = ranges[ranges.length - 1].end;
				editor.selection = new vscode.Selection(lastPosition, lastPosition);

				editor.revealRange(ranges[0]);

				vscode.commands.executeCommand('editor.action.showHover');
			}

			outputChannel.appendLine(`${from} → ${to}\n${hline}\n` + translatedText);
			outputChannel.appendLine('');
			if (!config.hoverDisplay) outputChannel.show();
		});
	}

	const runCallback = async (editor: vscode.TextEditor) => {
		const selections = editor.selections;
		latestTranslationRange.set(editor, selections);

		if (selections.length === 1 && selections[0].isEmpty)
			return editor.setDecorations(decoType, []);

		return translate(editor, editor.selections);
	}

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('translateIt.run', runCallback));

	const changeTargetLanguageCallback = async (editor: vscode.TextEditor) => {
		const quickPickOptions = { placeHolder: "Select Target Language" };
		const pickedLanguage = await vscode.window.showQuickPick(config.supportedLanguages, quickPickOptions);
		if (!pickedLanguage || pickedLanguage === config.targetLanguage) return;

		await config.setTargetLanguage(pickedLanguage);

		const ranges = latestTranslationRange.get(editor);
		if (!ranges) return;

		return translate(editor, ranges);
	}

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('translateIt.changeTargetLanguage', changeTargetLanguageCallback));
}

// this method is called when your extension is deactivated
export function deactivate() { }
