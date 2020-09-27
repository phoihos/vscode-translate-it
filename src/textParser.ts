import parseComments from 'common-comment-parser';
import getLanguageExt from './constants/languageExt'

export default function parseText(text: string, languageId: string) {
    const comments = parseComments(text, getLanguageExt(languageId))
    if (comments.length === 0) {
        return text;
    }

    return comments.map(e => e.value.trim().replace(/\n +/g, '\n')).join('\n');
}
