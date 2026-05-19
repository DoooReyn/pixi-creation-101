import { plugin, Plugin } from './plugin';

interface IEventHandler {
  (...args: unknown[]): void;
}

type Observer = [event: string, handler: IEventHandler, context: unknown, once?: boolean];

class EventChannel {
  private _observers: Observer[];

  public constructor(public readonly tag: string) {
    this._observers = [];
  }

  public add(...observer: Observer) {
    this._observers.push(observer);
  }

  public remove(condition: Partial<{ event: string; handler: IEventHandler; context: unknown }>) {
    const { event, handler, context } = condition;
    const matches = [event !== undefined, handler !== undefined, context !== undefined];
    const count = matches.filter((v) => v == true).length;
    if (count === 0) return;

    const indexes: number[] = [];
    this._observers.forEach((v, i) => {
      let match = 0;
      const [e, h, c] = v;
      if (matches[0] && e === event) match++;
      if (matches[1] && h === handler) match++;
      if (matches[2] && c === context) match++;
      if (match === count) indexes.push(i);
    });
    if (indexes.length) {
      indexes.reverse().forEach((v) => {
        this._observers.splice(v, 1);
      });
    }
  }

  public emit(event: string, ...args: unknown[]) {
    let toRemove = [];
    let index = -1;
    for (const [evt, handler, ctx, once] of this._observers) {
      index++;
      if (evt === event) {
        handler.apply(ctx, args);
        if (once) {
          toRemove.push(index);
        }
      }
    }
    toRemove.reverse().forEach((v) => this._observers.splice(v, 1));
  }

  public clear() {
    this._observers.length = 0;
  }

  public get size() {
    return this._observers.length;
  }
}

@plugin('event-bus')
class EventBusPlugin extends Plugin {
  declare public static readonly Trait: string;

  private _channels: Map<string, EventChannel>;

  public constructor() {
    super();

    this._channels = new Map();
  }

  public get sys() {
    return this.acquire('sys');
  }

  public acquire(channel: string) {
    if (!this._channels.has(channel)) {
      this._channels.set(channel, new EventChannel(channel));
    }
    return this._channels.get(channel);
  }

  public has(channel: string) {
    return this._channels.has(channel);
  }

  public add(channel: string, ...observer: Observer) {
    this.acquire(channel).add(...observer);
  }

  public remove(channel: string, condition?: Partial<{ event: string; handler: IEventHandler; context: unknown }>) {
    if (this.has(channel)) {
      const ec = this.acquire(channel);
      if (condition) {
        ec.remove(condition);
        if (ec.size === 0) {
          this._channels.delete(channel);
        }
      } else {
        ec.clear();
        this._channels.delete(channel);
      }
    }
  }

  public clear() {
    for (const [, channel] of this._channels) {
      channel.clear();
    }
    this._channels.clear();
  }

  protected async doInit(): Promise<void> {}

  protected doDestroy(): void {
    this._channels.forEach((v) => v.clear());
    this._channels.clear();
    this._channels = null;
  }
}

export { EventBusPlugin };
