export interface IDisposable {
	dispose(): void;
}

export class DisposableStore implements IDisposable {
	private _toDispose = new Set<IDisposable>();
	private _isDisposed = false;

	public add(disposable: IDisposable): IDisposable {
		if (!disposable) return disposable;
		if ((disposable as unknown as DisposableStore) === this) {
			throw new Error('Cannot register a disposable on itself!');
		}

		if (this._isDisposed) disposable.dispose();
		else this._toDispose.add(disposable);
		return disposable;
	}

	public clear(): void {
		try {
			for (const value of this._toDispose.values()) {
				value.dispose();
			}
		} finally {
			this._toDispose.clear();
		}
	}

	public dispose(): void {
		if (this._isDisposed) return;

		this._isDisposed = true;
		this.clear();
	}
}

export abstract class Disposable implements IDisposable {
	protected readonly _store = new DisposableStore();

	public dispose(): void {
		this._store.dispose();
	}

	protected _register<T extends IDisposable>(disposables: T | T[]): void {
		disposables = (disposables instanceof Array) ? disposables : [disposables];

		for (const v of disposables) {
			if ((v as unknown as Disposable) === this) {
				throw new Error('Cannot register a disposable on itself!');
			}

			this._store.add(v);
		}
	}
}
