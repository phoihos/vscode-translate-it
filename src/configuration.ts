import * as vscode from 'vscode';
import { getSupportedLanguages } from './constants/locale'

interface IConfiguration {
    hoverDisplay: boolean;
    hoverDisplayHeader: boolean;
    hoverMultiLineFormatting: boolean;
    targetLanguage: string;
    supportedLanguages: string[];

    setTargetLanguage: (language: string) => Thenable<void>;
}

export default function getConfiguration(): Readonly<IConfiguration> {
    function setTargetLanguage(language: string) {
        const config = vscode.workspace.getConfiguration('translateIt');
        return config.update('targetLanguage', language, vscode.ConfigurationTarget.Global);
    }

    return new Proxy(
        {
            supportedLanguages: getSupportedLanguages(),
            setTargetLanguage: setTargetLanguage
        } as IConfiguration,
        {
            get: function (target: IConfiguration, prop: keyof IConfiguration) {
                return target[prop] ?? vscode.workspace.getConfiguration('translateIt').get(prop);
            }
        }
    )
}
