import * as vscode from 'vscode';
import parseComments from 'common-comment-parser';
import getLanguageExt from './constants/languageExt'

interface IParseResult {
    parsedText: string;
    parsedRanges: vscode.Range[];
}

export default function parseText(texts: string[], eol: string, ranges: vscode.Range[], languageId: string): Readonly<IParseResult> {
    const results = parseComments(texts.join(eol), getLanguageExt(languageId))

    const comments: string[] = [];
    const lines: number[] = [];

    if (results.length === 0) {
        texts.forEach((e, i) => {
            const comment = e.trim();
            if (comment.length > 0) {
                comments.push(comment);

                lines.push(i); // zero based
            }
        });
    }
    else {
        results.forEach((e, _) => {
            const comment = e.value.trim();
            if (comment.length > 0) {
                comments.push(comment);

                let line = e.loc.start.line;
                do {
                    lines.push(line - 1); // one based
                } while (line++ < e.loc.end.line);
            }
        });
    }

    return {
        parsedText: comments.join(eol),
        parsedRanges: ranges.filter((_, i) => lines.includes(i))
    };
}
