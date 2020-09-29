import * as vscode from 'vscode';
import parseComments from 'common-comment-parser';
import getLanguageExt from './constants/languageExt'

export default function parseText(texts: string[], eol: string, ranges: vscode.Range[], languageId: string): [string, vscode.Range[]] {
    const mergedText = texts.join(eol);
    const results = parseComments(mergedText, getLanguageExt(languageId))
    if (results.length === 0) return [mergedText, ranges];

    const comments: string[] = [];
    const commentLines: number[] = [];

    for (const result of results) {
        comments.push(result.value.trim());

        let line = result.loc.start.line;
        do {
            commentLines.push(line);
        } while (line++ < result.loc.end.line);
    }

    return [comments.join(eol), ranges.filter((_, line) => commentLines.includes(line + 1))];
}
