import * as vscode from 'vscode';
import translate from 'google-translate-open-api';
import { getLocale, getDisplayLanguage } from './constants/locale';

interface ITranslation {
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
}

export default async function translateText(text: string, targetLanguage: string): Promise<Readonly<ITranslation>> {
    const targetLocale = (targetLanguage === 'Automatic') ? vscode.env.language : getLocale(targetLanguage);
    const options = { from: getLocale('Automatic'), to: targetLocale }
    const translatedText = await translate(text, options);

    const fromTo = `${getDisplayLanguage(translatedText.data[1])} → ${getDisplayLanguage(targetLocale)}`;
    const translatedFromTo = await translate(fromTo, options);
    const languages = translatedFromTo.data[0].split('→').map((s: string) => s.trim());

    return {
        translatedText: translatedText.data[0],
        sourceLanguage: languages[0],
        targetLanguage: languages[1]
    };
}
