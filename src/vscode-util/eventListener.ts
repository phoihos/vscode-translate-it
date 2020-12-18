import { EFAULT } from 'constants';
import { Disposable, DisposableStore } from './dispose';

export abstract class EventListenerBase extends Disposable { }
export class EventListenerList extends DisposableStore<EventListenerBase> { }
