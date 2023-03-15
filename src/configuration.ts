import * as vscode from 'vscode';

import { getLanguageName, getAllLanguageNames } from './constants/languageCode';

export interface Configuration {
  hoverDisplay: boolean;
  hoverDisplayHeader: boolean;
  hoverMultiLineFormatting: boolean;
  targetLanguage: string;
  api: string;
  supportedLanguages: string[];

  updateTargetLanguage(language: string): Thenable<void>;
}

class ConfigurationImpl implements Partial<Configuration> {
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

export default function getConfiguration(): Readonly<Configuration> {
  return new Proxy(new ConfigurationImpl() as Configuration, {
    get: function (target: Configuration, prop: keyof Configuration) {
      return target[prop] ?? vscode.workspace.getConfiguration('translateIt').get(prop);
    }
  });
}
