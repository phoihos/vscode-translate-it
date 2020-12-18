// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import getConfiguration from './configuration'

import vscodeUtil from './vscode-util'
import commands from './commands';
import events from './events'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const decorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: new vscode.ThemeColor('editor.hoverHighlightBackground'),
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	});
	const latestTranslationMap = new Map<vscode.TextEditor, vscode.Selection[]>();

	context.subscriptions.push(registerCommands(decorationType, latestTranslationMap));
	context.subscriptions.push(registerEvents(decorationType, latestTranslationMap));
}

function registerCommands(
	decorationType: vscode.TextEditorDecorationType,
	latestTranslationMap: Map<vscode.TextEditor, vscode.Selection[]>
): vscode.Disposable {
	const config = getConfiguration();

	const commandManager = new vscodeUtil.CommandManager();

	const clearCommand = commandManager.register(
		new commands.ClearTranslateItCommand(decorationType, latestTranslationMap)
	);
	const runCommand = commandManager.register(
		new commands.RunTranslateItCommand(clearCommand, decorationType, latestTranslationMap, config)
	);
	commandManager.register(
		new commands.ChangeTargetLanguageCommand(runCommand, clearCommand, latestTranslationMap, config)
	);

	return commandManager;
}

function registerEvents(
	decorationType: vscode.TextEditorDecorationType,
	latestTranslationMap: Map<vscode.TextEditor, vscode.Selection[]>
): vscode.Disposable {
	const eventListenerList = new vscodeUtil.EventListenerList();

	eventListenerList.add(
		new events.RemoveTranslationHighlightingListener(decorationType, latestTranslationMap)
	);

	return eventListenerList;
}

// this method is called when your extension is deactivated
export function deactivate() { }
