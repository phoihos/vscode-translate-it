import { ICommand } from '../vscode-util';
import { ClearTranslateItCommand } from './clearTranslateIt'

import parseText from '../textParser';
import translateText from '../textTranslator'
import { IConfiguration } from '../configuration'

import * as vscode from 'vscode';

interface ITranslationOption {
    editor: vscode.TextEditor;
    selections: vscode.Selection[];
    preTaskHandler?: (
        progress: vscode.Progress<{ message?: string; increment?: number }>
    ) => Thenable<void>;
}

export class RunTranslateItCommand implements ICommand {
    public readonly id = 'translateIt.run';

    private readonly _outputChannel = vscode.window.createOutputChannel('Translate it');

    public constructor(
        private readonly _clearCommand: ClearTranslateItCommand,
        private readonly _decorationType: vscode.TextEditorDecorationType,
        private readonly _latestTranslationMap: Map<vscode.TextEditor, vscode.Selection[]>,
        private readonly _config: Readonly<IConfiguration>
    ) { }

    public async execute(translationOption?: ITranslationOption): Promise<void> {
        return translationOption ? this.translate(translationOption) : this.translateActiveEditor();
    }

    private async translateActiveEditor(): Promise<void> {
        const { activeTextEditor } = vscode.window;
        if (!activeTextEditor) return;

        const selections = activeTextEditor.selections;
        if (selections.length === 1 && selections[0].isEmpty) {
            return this._clearCommand.execute();
        }

        return this.translate({ editor: activeTextEditor, selections });
    }

    private async translate(translationOption: ITranslationOption): Promise<void> {
        const { editor, selections, preTaskHandler } = translationOption;

        const document = editor.document;
        const languageId = document.languageId;
        const eol = (document.eol === vscode.EndOfLine.LF) ? '\n' : '\r\n';

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification
        }, async (progress) => {
            await preTaskHandler?.(progress);

            this._latestTranslationMap.set(editor, selections);

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
            const targetLanguage = this._config.targetLanguage;

            progress.report({ message: `Translating to "${targetLanguage}" ...` });

            const { text: translatedText, from, to } =
                await translateText(parsedText, targetLanguage);

            const command = 'command:translateIt.changeTargetLanguage';
            const hr = '-'.repeat(from.length + to.length + 3);

            if (this._config.hoverDisplay) {
                const hoverMessage = new vscode.MarkdownString();
                hoverMessage.appendMarkdown(this._config.hoverDisplayHeader ?
                    `${from} → [${to}](${command})\n\n${hr}\n\n` : '');
                hoverMessage.appendMarkdown(this._config.hoverMultiLineFormatting ?
                    translatedText.replace(/\n/g, '\n\n') : translatedText);
                hoverMessage.isTrusted = true;

                const lastPosition = parsedRanges[parsedRanges.length - 1].end;
                editor.selection = new vscode.Selection(lastPosition, lastPosition);
                editor.revealRange(parsedRanges[0]);

                const decoOptions = parsedRanges.map(e => ({ hoverMessage: hoverMessage, range: e }));
                editor.setDecorations(this._decorationType, decoOptions);

                await vscode.commands.executeCommand('editor.action.showHover');
            }

            this._outputChannel.appendLine(`${from} → ${to}\n${hr}\n` + translatedText);
            this._outputChannel.appendLine('');
            if (!this._config.hoverDisplay) {
                this._outputChannel.show();
            }

            return vscode.commands.executeCommand('setContext', 'editorHasTranslationHighlighting', true);
        });
    }
}
