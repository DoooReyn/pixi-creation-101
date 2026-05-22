import { plugin, Plugin } from './plugin';

interface ISwitcher {
  enable(): void;
  disable(): void;
}

interface IEventHandler {
  (...args: any[]): void;
}

type Observer = [event: string, handle: IEventHandler, context?: unknown, once?: boolean];

class EventChannel {
  private _observers: Observer[];

  public constructor(public readonly tag: string) {
    this._observers = [];
  }

  public add(...observer: Observer) {
    this._observers.push(observer);
  }

  public remove(condition: Partial<{ event: string; handle: IEventHandler; context: unknown }>) {
    const { event, handle, context } = condition;
    const matches = [event !== undefined, handle !== undefined, context !== undefined];
    const count = matches.filter((v) => v == true).length;
    if (count === 0) return;

    const indexes: number[] = [];
    this._observers.forEach((v, i) => {
      let match = 0;
      const [e, h, c] = v;
      if (matches[0] && e === event) match++;
      if (matches[1] && h === handle) match++;
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

  public static readonly Channel = {
    Sys: 'sys',
    Gui: 'gui',
  };

  private _channels: Map<string, EventChannel>;

  public constructor() {
    super();

    this._channels = new Map();
  }

  public get sys() {
    return this.acquire(EventBusPlugin.Channel.Sys);
  }

  public get gui() {
    return this.acquire(EventBusPlugin.Channel.Gui);
  }

  public pairs(channel: string, event: string, handle: (...args: any[]) => void, context: unknown): ISwitcher {
    const bus = this.acquire(channel);
    function enable() {
      disable();
      bus.add(event, handle, context);
    }
    function disable() {
      bus.remove({ event, handle, context });
    }
    return { enable, disable };
  }

  public static Pairs(event: string, handle: (...args: any[]) => void, context: unknown): ISwitcher {
    const handler = handle.bind(context);
    function enable() {
      disable();
      globalThis.addEventListener(event, handler);
    }
    function disable() {
      globalThis.removeEventListener(event, handler);
    }
    return { enable, disable };
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

  public remove(channel: string, condition?: Partial<{ event: string; handle: IEventHandler; context: unknown }>) {
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

export { type ISwitcher, EventBusPlugin };
