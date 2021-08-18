import * as vscode from 'vscode';

import { ICommand } from '@phoihos/vsce-util';

import { parseTexts } from '../textParser';
import { translateText } from '../textTranslator';
import { IConfiguration } from '../configuration';

export interface ITranslationOption {
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
    private readonly _clearCommand: ICommand,
    private readonly _decorationType: vscode.TextEditorDecorationType,
    private readonly _latestTranslationMap: Map<vscode.TextEditor, vscode.Selection[]>,
    private readonly _config: Readonly<IConfiguration>
  ) {}

  public execute(option?: ITranslationOption): Promise<void> {
    return option ? this._translate(option) : this._translateActiveEditor();
  }

  private async _translateActiveEditor(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (editor === undefined) return;

    const selections = editor.selections;
    if (selections.length === 1 && selections[0].isEmpty) {
      return this._clearCommand.execute();
    }

    return this._translate({ editor, selections });
  }

  private async _translate(option: ITranslationOption): Promise<void> {
    const { editor, selections, preTaskHandler } = option;

    const document = editor.document;
    const languageId = document.languageId;

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification
      },
      async (progress) => {
        // Run pre task before to translate
        await preTaskHandler?.(progress);

        this._latestTranslationMap.set(editor, selections);

        const lineTexts: string[] = [];
        const lineRanges: vscode.Range[] = [];

        for (const selection of selections) {
          let line = selection.start.line;
          do {
            const { text, range, firstNonWhitespaceCharacterIndex } = document.lineAt(line);

            const startIndex = range.start.isBefore(selection.start)
              ? selection.start.character
              : range.start.character;
            const startCharacter = Math.max(startIndex, firstNonWhitespaceCharacterIndex);
            const endCharacter = range.end.isAfter(selection.end)
              ? selection.end.character
              : range.end.character;

            lineTexts.push(text.substring(startCharacter, endCharacter));
            lineRanges.push(new vscode.Range(line, startCharacter, line, endCharacter));
          } while (line++ < selection.end.line);
        }

        const targetLanguage = this._config.targetLanguage;

        progress.report({ message: `Translating to "${targetLanguage}" ...` });

        const { texts: parsedTexts, lines: parsedLines } = parseTexts(lineTexts, languageId);
        const parsedRanges = lineRanges.filter((_, i) => parsedLines.includes(i));

        const {
          text: translatedText,
          from,
          to
        } = await translateText(parsedTexts.join('\n'), targetLanguage);

        // see: https://jrgraphix.net/r/Unicode/
        const regexCJK = /[\u3000-\u9fff\uac00-\ud7af\uff01-\uff60]/g;
        // CJK characters take up 2 width
        const headerWidth = [from, to].reduce(
          (a, c) => a + c.length + (c.match(regexCJK)?.length ?? 0),
          3
        );
        const horizontalRule = '-'.repeat(headerWidth);

        if (this._config.hoverDisplay) {
          const commandLink = 'command:translateIt.changeTargetLanguage';

          const hoverMessage = new vscode.MarkdownString();
          hoverMessage.appendMarkdown(
            this._config.hoverDisplayHeader
              ? `${from} → [${to}](${commandLink})\n\n${horizontalRule}\n\n`
              : ''
          );
          hoverMessage.appendMarkdown(
            this._config.hoverMultiLineFormatting
              ? translatedText.replace(/\n/g, '\n\n')
              : translatedText
          );
          hoverMessage.isTrusted = true;

          const lastPosition = parsedRanges[parsedRanges.length - 1].end;
          editor.selection = new vscode.Selection(lastPosition, lastPosition);
          editor.revealRange(parsedRanges[0]);

          const decorationOptions = parsedRanges.map((range) => ({ hoverMessage, range }));
          editor.setDecorations(this._decorationType, decorationOptions);

          await vscode.commands.executeCommand('editor.action.showHover');
        }

        this._outputChannel.appendLine(`${from} → ${to}\n${horizontalRule}\n` + translatedText);
        this._outputChannel.appendLine('');
        if (this._config.hoverDisplay === false) {
          this._outputChannel.show();
        }

        return vscode.commands.executeCommand(
          'setContext',
          'editorHasTranslationHighlighting',
          true
        );
      }
    );
  }
}
