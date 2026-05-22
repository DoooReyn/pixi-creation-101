import { Game } from '../game';
import { Logger } from '../logger';
import { EventBusPlugin, ISwitcher } from './event-bus-plugin';
import { plugin, Plugin } from './plugin';

@plugin('visibility')
class VisibilityPlugin extends Plugin {
  declare public static readonly Trait: string;
  public static readonly EventType = {
    VisibilityChange: 'visibilitychange',
  };

  private _visibilitySwt: ISwitcher;
  private _time: number;

  public constructor() {
    super();
    this._time = 0;
    this._visibilitySwt = EventBusPlugin.Pairs(
      VisibilityPlugin.EventType.VisibilityChange,
      this._onVisibilityChanged,
      this
    );
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
    this._visibilitySwt.enable();
  }

  protected doDestroy(): void {
    this._visibilitySwt.disable();
    this._visibilitySwt = null;
  }
}

export { VisibilityPlugin };
