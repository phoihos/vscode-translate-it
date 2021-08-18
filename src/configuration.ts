import * as vscode from 'vscode';

import { getLanguageName, getAllLanguageNames } from './constants/languageLocale';

export interface IConfiguration {
  hoverDisplay: boolean;
  hoverDisplayHeader: boolean;
  hoverMultiLineFormatting: boolean;
  targetLanguage: string;
  supportedLanguages: string[];

  updateTargetLanguage: (language: string) => Thenable<void>;
}

class Configuration implements Partial<IConfiguration> {
  get targetLanguage(): string {
    const config = vscode.workspace.getConfiguration('translateIt');
    const languageName = config.get<string>('targetLanguage', 'Automatic');
    return languageName !== 'Automatic' ? languageName : getLanguageName(vscode.env.language);
  }

  get supportedLanguages(): string[] {
    return getAllLanguageNames();
  }

  public updateTargetLanguage(language: string): Thenable<void> {
    const config = vscode.workspace.getConfiguration('translateIt');
    return config.update('targetLanguage', language, vscode.ConfigurationTarget.Global);
  }
}

export default function getConfiguration(): Readonly<IConfiguration> {
  return new Proxy(new Configuration() as IConfiguration, {
    get: function (target: IConfiguration, prop: keyof IConfiguration) {
      return target[prop] ?? vscode.workspace.getConfiguration('translateIt').get(prop);
    }
  });
}
