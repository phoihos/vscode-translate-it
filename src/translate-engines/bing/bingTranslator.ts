import * as vscode from 'vscode';

import { Translation, Translator } from '../translator';
import { GoogleTranslate } from '../google/googleTranslate';
import { LanguageCodeMap, getLanguageCode, getLanguageName } from '../../constants/languageCode';

const bingApi = require('bing-translate-api');

interface BingApiResponse {
  text: string;
  userLang: string;
  translation: string;
  language: {
    from: string;
    to: string;
    score: string;
  };
}

export class BingTranslator implements Translator {
  private _languageCodeMap: LanguageCodeMap = {
    Automatic: 'auto-detect',
    'Chinese (Simplified)': 'zh-Hans',
    'Chinese (Traditional)': 'zh-Hant'
  };

  private _languageNames = Object.keys(this._languageCodeMap);

  public get name(): string {
    return 'Bing';
  }

  public async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<Translation> {
    const from = this._getLanguageCode(sourceLanguage || 'Automatic');
    const to = this._getLanguageCode(targetLanguage);

    try {
      const response: BingApiResponse = await bingApi.translate(text, from, to);

      return {
        text: response.translation,
        from: this._getLanguageName(response.language.from),
        to: targetLanguage,
        api: this.name
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        'Google Translate API will be used instead of Bing Translator API.\n' +
          'Because Bing Translator API returned error.\n' +
          'Cause: ' +
          message
      );

      const fallback = new GoogleTranslate();
      return fallback.translate(text, targetLanguage, sourceLanguage);
    }
  }

  private _getLanguageCode(languageName: string): string {
    return this._languageCodeMap[languageName] ?? getLanguageCode(languageName);
  }

  private _getLanguageName(languageCode: string): string {
    const codes = languageCode.split('-');
    const multiCodes = codes.length > 1 ? [languageCode, codes[0]] : [languageCode];

    return (
      this._languageNames.find((key) => multiCodes.includes(this._languageCodeMap[key])) ??
      getLanguageName(languageCode)
    );
  }
}
