import { DisposableStore } from './dispose'

import * as vscode from 'vscode';

export interface ICommand {
	readonly id: string;
	execute(...args: any[]): void;
}

export class CommandManager extends DisposableStore {
	private readonly _commandIds = new Set<string>();

	public dispose() {
		this._commandIds.clear();
		super.dispose();
	}

	public register<T extends ICommand>(command: T): T {
		this.registerCommand(command.id, command.execute, command);
		return command;
	}

	private registerCommand(id: string, handler: (...args: any[]) => void, thisArg?: any): void {
		if (this._commandIds.has(id)) return;

		this.add(vscode.commands.registerCommand(id, handler, thisArg));
		this._commandIds.add(id);
	}
}
