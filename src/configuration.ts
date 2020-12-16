import * as vscode from 'vscode';
import { getDisplayLanguage, getSupportedLanguages } from './constants/locale'

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
        const language = vscode.workspace.getConfiguration('translateIt').get<string>('targetLanguage');
        return (language && language !== 'Automatic') ? language : getDisplayLanguage(vscode.env.language);
    }

    supportedLanguages = getSupportedLanguages();

    public updateTargetLanguage(language: string): Thenable<void> {
        const config = vscode.workspace.getConfiguration('translateIt');
        return config.update('targetLanguage', language, vscode.ConfigurationTarget.Global);
    }
}

export default function getConfiguration(): Readonly<IConfiguration> {
    return new Proxy(
        (new Configuration()) as IConfiguration,
        {
            get: function (target: IConfiguration, prop: keyof IConfiguration) {
                return target[prop] ?? vscode.workspace.getConfiguration('translateIt').get(prop);
            }
        }
    )
}
