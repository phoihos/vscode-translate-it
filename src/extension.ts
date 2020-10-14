// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import parseText from './textParser';
import translateText from './textTranslator'
import getConfiguration from './configuration'

type ITaskProgress = vscode.Progress<{ message?: string; increment?: number }>;
type TaskHandler = (progress: ITaskProgress) => Thenable<void>;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const decoType = vscode.window.createTextEditorDecorationType({
		backgroundColor: new vscode.ThemeColor('editor.hoverHighlightBackground'),
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	});

	const outputChannel = vscode.window.createOutputChannel('Translate it');
	const config = getConfiguration();

	const latestTranslationMap = new WeakMap<vscode.TextEditor, vscode.Selection[]>();

	async function translate(editor: vscode.TextEditor, selections: vscode.Selection[], preTaskHandler?: TaskHandler) {
		const document = editor.document;
		const languageId = document.languageId;
		const eol = (document.eol === vscode.EndOfLine.LF) ? '\n' : '\r\n';

		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification
		}, async (progress) => {
			await preTaskHandler?.(progress);

			const lineTexts: string[] = [];
			const lineRanges: vscode.Range[] = [];

			for (const selection of selections) {
				let line = selection.start.line;
				do {
					const { text, range, firstNonWhitespaceCharacterIndex } = document.lineAt(line);

					const startIndex = range.start.isBefore(selection.start) ?
						selection.start.character : range.start.character;
					const startCharacter = Math.max(startIndex, firstNonWhitespaceCharacterIndex);
					const endCharacter = range.end.isAfter(selection.end) ?
						selection.end.character : range.end.character;

					lineTexts.push(text.substring(startCharacter, endCharacter));
					lineRanges.push(new vscode.Range(line, startCharacter, line, endCharacter));
				} while (line++ < selection.end.line);
			}

			const { parsedText, parsedRanges } = parseText(lineTexts, eol, lineRanges, languageId);
			const targetLanguage = config.targetLanguage;

			progress.report({ message: `Translating to "${targetLanguage}" ...` });

			const { translatedText, sourceLanguage: from, targetLanguage: to } =
				await translateText(parsedText, targetLanguage);

			const command = 'command:translateIt.changeTargetLanguage';
			const hr = '-'.repeat(from.length + to.length + 3);

			if (config.hoverDisplay) {
				const hoverMessage = new vscode.MarkdownString();
				hoverMessage.appendMarkdown(config.hoverDisplayHeader ?
					`${from} → [${to}](${command})\n\n${hr}\n\n` : '');
				hoverMessage.appendMarkdown(config.hoverMultiLineFormatting ?
					translatedText.replace(/\n/g, '\n\n') : translatedText);
				hoverMessage.isTrusted = true;

				const decoOptions = parsedRanges.map(e => ({ hoverMessage: hoverMessage, range: e }));
				editor.setDecorations(decoType, decoOptions);

				const lastPosition = parsedRanges[parsedRanges.length - 1].end;
				editor.selection = new vscode.Selection(lastPosition, lastPosition);

				editor.revealRange(parsedRanges[0]);

				await vscode.commands.executeCommand('editor.action.showHover');
			}

			outputChannel.appendLine(`${from} → ${to}\n${hr}\n` + translatedText);
			outputChannel.appendLine('');
			if (!config.hoverDisplay) outputChannel.show();
		});
	}

	const runCallback = async (editor: vscode.TextEditor) => {
		const selections = editor.selections;
		latestTranslationMap.set(editor, selections);

		if (selections.length === 1 && selections[0].isEmpty)
			return editor.setDecorations(decoType, []);

		return translate(editor, editor.selections);
	}

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('translateIt.run', runCallback));

	const changeTargetLanguageCallback = async (editor: vscode.TextEditor) => {
		const quickPickOptions = { placeHolder: "Select Target Language" };
		const pickedLanguage = await vscode.window.showQuickPick(config.supportedLanguages, quickPickOptions);
		if (!pickedLanguage || pickedLanguage === config.targetLanguage) return;

		const selections = latestTranslationMap.get(editor);
		if (!selections) return;

		const preTaskHandler = (progress: ITaskProgress) => {
			progress.report({ message: `Changing target language to "${pickedLanguage}" ...` });
			return config.updateTargetLanguage(pickedLanguage);
		}

		return translate(editor, selections, preTaskHandler);
	}

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('translateIt.changeTargetLanguage', changeTargetLanguageCallback));
}

// this method is called when your extension is deactivated
export function deactivate() { }
