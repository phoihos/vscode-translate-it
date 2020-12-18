import { Disposable, DisposableStore } from './dispose';

export abstract class EventListenerBase extends Disposable { }
export class AggregateEventListener extends DisposableStore<EventListenerBase> { }
