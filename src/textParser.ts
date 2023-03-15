import parseComments from 'common-comment-parser';

import { getLanguageExt } from './constants/languageExt';

interface ParseResult {
  texts: string[];
  lines: number[];
}

export function parseTexts(texts: string[], languageId: string): Readonly<ParseResult> {
  const parsedResults = parseComments(texts.join('\n'), getLanguageExt(languageId));

  const comments: string[] = [];
  const lines: number[] = [];

  if (parsedResults.length === 0) {
    texts.forEach((e, i) => {
      const comment = e.trim();
      if (comment.length > 0) {
        comments.push(comment);

        lines.push(i); // Zero-based line number
      }
    });
  } else {
    parsedResults.forEach((e) => {
      const comment = e.value.trim();
      if (comment.length > 0) {
        comments.push(comment);

        let line = e.loc.start.line;
        do {
          lines.push(line - 1); // One-based line number
        } while (line++ < e.loc.end.line);
      }
    });
  }

  return { texts: comments, lines };
}
