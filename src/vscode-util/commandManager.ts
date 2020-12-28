import { IDisposable, DisposableStore } from './dispose'

import * as vscode from 'vscode';

export interface ICommand {
	readonly id: string;
	execute(...args: any[]): any;
}

export class CommandManager extends DisposableStore<IDisposable> {
	private readonly _commandIds = new Set<string>();

	public dispose() {
		this._commandIds.clear();
		super.dispose();
	}

	public register<T extends ICommand>(command: T): T {
		this._registerCommand(command.id, command.execute, command);
		return command;
	}

	private _registerCommand(id: string, handler: (...args: any[]) => any, thisArg?: any): void {
		if (this._commandIds.has(id)) return;

		this.add(vscode.commands.registerCommand(id, handler, thisArg));
		this._commandIds.add(id);
	}
}
