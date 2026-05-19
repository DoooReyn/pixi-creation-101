import { EventPair, IEventPair } from '../foundation/event-pair';
import { Game } from '../game';
import { Logger } from '../logger';
import { EventBusPlugin } from './event-bus-plugin';
import { plugin, Plugin } from './plugin';

@plugin('visibility')
class VisibilityPlugin extends Plugin {
  declare public static readonly Trait: string;
  public static readonly EventType = {
    VisibilityChange: 'visibilitychange',
  };

  private _eventPair: IEventPair;
  private _time: number;

  public constructor() {
    super();
    this._time = 0;
    this._eventPair = EventPair(VisibilityPlugin.EventType.VisibilityChange, this._onVisibilityChanged, this);
  }

  private _onVisibilityChanged() {
    if (document.hidden) {
      this._time = performance.now();
      Logger.Sys.I('进入后台');
      Game.Resolve(EventBusPlugin).sys.emit(VisibilityPlugin.EventType.VisibilityChange, { visible: false });
    } else {
      if (this._time > 0) {
        const elapsed = performance.now() - this._time;
        Logger.Sys.I(`回到前台，耗时: ${(elapsed / 1000).toFixed(1)}s`);
        Game.Resolve(EventBusPlugin).sys.emit(VisibilityPlugin.EventType.VisibilityChange, { visible: true, elapsed });
      }
    }
  }

  protected async doInit(): Promise<void> {
    this._eventPair.add();
  }

  protected doDestroy(): void {
    this._eventPair.remove();
    this._eventPair = null;
  }
}

export { VisibilityPlugin };
