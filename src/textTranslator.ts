import { Translation } from './translate-engines/translator';
import { GoogleTranslate } from './translate-engines/google/googleTranslate';
import { BingTranslator } from './translate-engines/bing/bingTranslator';

export async function translateText(
  text: string,
  targetLanguage: string,
  translationApi: string
): Promise<Readonly<Translation>> {
  const translator = translationApi === 'Bing' ? new BingTranslator() : new GoogleTranslate();
  const translation = await translator.translate(text, targetLanguage);

  const fromToText = `${translation.from} → ${targetLanguage}`;
  const fromToTranslation = await translator.translate(
    fromToText,
    targetLanguage,
    translation.from
  );
  const fromTo = fromToTranslation.text.split('→').map((s) => s.trim());

  return {
    text: translation.text,
    from: fromTo[0],
    to: fromTo[1],
    api: translation.api
  };
}
