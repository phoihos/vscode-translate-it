import { googleTranslate, IGoogleTranslation } from './googleTranslate';
import { getLocale, getLanguageName } from './constants/languageLocale';

export async function translateText(text: string, targetLanguage: string): Promise<Readonly<IGoogleTranslation>> {
    const option: IGoogleTranslation = {
        text,
        from: getLocale('Automatic'),
        to: getLocale(targetLanguage),
    };
    const translation = await googleTranslate(option);

    const fromToText = `${getLanguageName(translation.from)} → ${targetLanguage}`;
    const fromToTranslation = await googleTranslate({ text: fromToText, from: option.from, to: option.to });
    const fromTo = fromToTranslation.text.split('→').map((s) => s.trim());

    return { text: translation.text, from: fromTo[0], to: fromTo[1] };
}
