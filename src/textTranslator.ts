import * as vscode from 'vscode';
import translate from 'google-translate-open-api';
import { getLocale, getDisplayLanguage } from './constants/locale';

export default async function translateText(text: string, targetLanguage: string): Promise<[string, string]> {
    const targetLocale = (targetLanguage === 'Automatic') ? vscode.env.language : getLocale(targetLanguage);
    const options = { from: getLocale('Automatic'), to: targetLocale }
    const translatedText = await translate(text, options);

    const fromTo = `${getDisplayLanguage(translatedText.data[1])} → ${getDisplayLanguage(targetLocale)}`;
    const translatedFromTo = await translate(fromTo, options);

    return [translatedText.data[0], translatedFromTo.data[0]];
}
