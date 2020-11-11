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

	const latestTranslationMap = new Map<vscode.TextEditor, vscode.Selection[]>();

	async function translate(editor: vscode.TextEditor, selections: vscode.Selection[], preTaskHandler?: TaskHandler) {
		const document = editor.document;
		const languageId = document.languageId;
		const eol = (document.eol === vscode.EndOfLine.LF) ? '\n' : '\r\n';

		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification
		}, async (progress) => {
			await preTaskHandler?.(progress);

			latestTranslationMap.set(editor, selections);

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

			const { text: translatedText, from, to } =
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

				const lastPosition = parsedRanges[parsedRanges.length - 1].end;
				editor.selection = new vscode.Selection(lastPosition, lastPosition);
				editor.revealRange(parsedRanges[0]);

				const decoOptions = parsedRanges.map(e => ({ hoverMessage: hoverMessage, range: e }));
				editor.setDecorations(decoType, decoOptions);

				await vscode.commands.executeCommand('editor.action.showHover');
			}

			outputChannel.appendLine(`${from} → ${to}\n${hr}\n` + translatedText);
			outputChannel.appendLine('');
			if (!config.hoverDisplay) {
				outputChannel.show();
			}

			return vscode.commands.executeCommand('setContext', 'editorHasTranslationHighlighting', true);
		});
	}

	const clearCallback = (editor: vscode.TextEditor) => {
		editor.setDecorations(decoType, []);
		latestTranslationMap.clear();

		return vscode.commands.executeCommand('setContext', 'editorHasTranslationHighlighting', false);
	}

	const runCallback = (editor: vscode.TextEditor) => {
		const selections = editor.selections;
		if (selections.length === 1 && selections[0].isEmpty) {
			return clearCallback(editor);
		}

		return translate(editor, selections);
	}

	const changeTargetLanguageCallback = async (editor: vscode.TextEditor) => {
		const quickPickOptions = { placeHolder: "Select Target Language" };
		const pickedLanguage = await vscode.window.showQuickPick(config.supportedLanguages, quickPickOptions);
		if (!pickedLanguage || pickedLanguage === config.targetLanguage) return;

		const selections = latestTranslationMap.get(editor);
		if (!selections) return;

		const preTaskHandler = async (progress: ITaskProgress) => {
			progress.report({ message: `Changing target language to "${pickedLanguage}" ...` });
			await config.updateTargetLanguage(pickedLanguage);
			await clearCallback(editor);
		}

		return translate(editor, selections, preTaskHandler);
	}

	const removeTranslationHighlightingListener = (_editor: vscode.TextEditor | undefined) => {
		if (latestTranslationMap.size === 0) return;

		latestTranslationMap.forEach((_v, k) => k.setDecorations(decoType, []));
		latestTranslationMap.clear();

		vscode.commands.executeCommand('setContext', 'editorHasTranslationHighlighting', false);
	}

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('translateIt.run', runCallback));
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('translateIt.clear', clearCallback));
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('translateIt.changeTargetLanguage', changeTargetLanguageCallback));
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(removeTranslationHighlightingListener));
}

// this method is called when your extension is deactivated
export function deactivate() { }
