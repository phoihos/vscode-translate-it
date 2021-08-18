import { RestClient } from 'typed-rest-client/RestClient';
import * as querystring from 'querystring';

interface IGoogleToken {
  get(text: string, opts: { tld?: string }): Promise<{ name: string; value: string }>;
}
const _googleToken: IGoogleToken = require('@vitalets/google-translate-token');

export interface IGoogleTranslation {
  text: string;
  from: string;
  to: string;
}

export async function googleTranslate(
  option: IGoogleTranslation & { tld?: string }
): Promise<IGoogleTranslation> {
  const tld = option.tld ?? 'com';
  const token = await _googleToken.get(option.text, { tld });

  const data: any = {
    client: 'gtx',
    sl: option.from,
    tl: option.to,
    hl: option.to,
    dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
    ie: 'UTF-8',
    oe: 'UTF-8',
    otf: 1,
    ssel: 0,
    tsel: 0,
    kc: 7,
    q: option.text
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
    return option;
  }

  return {
    text: sentences
      .map(([s]) => {
        return s?.replace(/((\/|\*|-) )/g, '$2') ?? '';
      })
      .join(''),
    from: response.result[2],
    to: option.to
  };
}
