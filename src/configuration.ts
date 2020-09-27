import * as vscode from 'vscode';

interface IConfiguration {
    hoverDisplay: boolean;
    hoverDisplayHeader: boolean;
    hoverMultiLineFormatting: boolean;
    targetLanguage: string;
}

export default function getConfiguration(): IConfiguration {
    const workspaceConfig = vscode.workspace.getConfiguration('translateIt');

    return new Proxy(
        {} as IConfiguration,
        {
            get: function (_target, prop: string) {
                return workspaceConfig.get(prop);
            }
        }
    )
}
