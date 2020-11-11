//import translate, { Options as IOptions } from 'google-translate-open-api';
import { getLocale, getDisplayLanguage } from './constants/locale';
import { translate, ITranslation, IOption } from './googleTranslate';

export default async function translateText(text: string, targetLanguage: string): Promise<Readonly<ITranslation>> {
    const option: IOption = { text, from: getLocale('Automatic'), to: getLocale(targetLanguage) }
    const translation = await translate(option);

    const fromTo = `${getDisplayLanguage(translation.from)} → ${targetLanguage}`;
    const translatedFromTo = await translate({ ...option, text: fromTo });
    const languages = translatedFromTo.text.split('→').map((s: string) => s.trim());

    return {
        text: translation.text,
        from: languages[0],
        to: languages[1]
    };
}
