import * as restm from 'typed-rest-client/RestClient';
import * as querystring from "querystring";
const GoogleToken: IGetToken = require('@vitalets/google-translate-token');

interface IGetToken {
    get(text: string, opts: { tld?: string }):
        Promise<{ name: string, value: string }>;
}

export interface ITranslation {
    text: string;
    from: string;
    to: string;
}

export interface IOption extends ITranslation {
    tld?: string;
}

const TRANSLATE_API_URL_A = 'https://translate.google.';
const TRANSLATE_API_URL_B = '/translate_a/single?';

export async function translate(option: IOption): Promise<ITranslation> {
    const tld = option.tld ?? 'com';
    const token = await GoogleToken.get(option.text, { tld });

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

    const url = TRANSLATE_API_URL_A + tld + TRANSLATE_API_URL_B + querystring.stringify(data);
    const rest = new restm.RestClient('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36');
    const response = await rest.get<Array<any>>(url);
    if (response.statusCode != 200)
        throw new Error(`HTTP Error: ${response.statusCode}`);
    else if (response.result == null)
        throw new Error('HTTP Result is null');

    const translation: ITranslation = {
        text: option.text,
        from: option.from,
        to: option.to,
    };

    const sentences = response.result[0];
    if (!sentences || !(sentences instanceof Array)) return translation;

    translation.from = response.result[2];
    translation.text = sentences.map(([s]) => { return s?.replace(/((\/|\*|-) )/g, '$2') ?? ''; }).join('');

    return translation;
}
