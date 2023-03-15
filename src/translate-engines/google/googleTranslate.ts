import { RestClient } from 'typed-rest-client/RestClient';
import * as querystring from 'querystring';

import { Translation, Translator } from '../translator';
import { getLanguageCode, getLanguageName } from '../../constants/languageCode';

interface GoogleToken {
  get(text: string, opts: { tld?: string }): Promise<{ name: string; value: string }>;
}
const _googleToken: GoogleToken = require('@vitalets/google-translate-token');

export class GoogleTranslate implements Translator {
  public get name(): string {
    return 'Google';
  }

  public async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<Translation> {
    const from = getLanguageCode(sourceLanguage || 'Automatic');
    const to = getLanguageCode(targetLanguage);

    const tld = 'com';
    const token = await _googleToken.get(text, { tld });

    const data: any = {
      client: 'gtx',
      sl: from,
      tl: to,
      hl: to,
      dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
      ie: 'UTF-8',
      oe: 'UTF-8',
      otf: 1,
      ssel: 0,
      tsel: 0,
      kc: 7,
      q: text
    };
    data[token.name] = token.value;

    const url = `https://translate.google.${tld}/translate_a/single?` + querystring.stringify(data);
    const rest = new RestClient(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36'
    );
    const response = await rest.get<Array<any>>(url);
    if (response.statusCode !== 200) {
      throw new Error(`HTTP Error: ${response.statusCode}`);
    } else if (response.result === null) {
      throw new Error('HTTP Result is null');
    }

    const sentences = response.result[0];
    if (!sentences || !(sentences instanceof Array)) {
      return {
        text,
        from: sourceLanguage || 'Automatic',
        to: targetLanguage,
        api: this.name
      };
    }

    return {
      text: sentences
        .map(([s]) => {
          return s?.replace(/((\/|\*|-) )/g, '$2') ?? '';
        })
        .join(''),
      from: getLanguageName(response.result[2]),
      to: targetLanguage,
      api: this.name
    };
  }
}
