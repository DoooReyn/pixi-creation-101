import { EventPair, IEventPair } from '../foundation/event-pair';
import { Game } from '../game';
import { Logger } from '../logger';
import { EventBusPlugin } from './event-bus-plugin';
import { plugin, Plugin } from './plugin';
import { RendererPlugin } from './renderer-plugin';

export enum ResizeStrategy {
  None,
  FitWith,
  FitHeight,
  FitAuto,
}

interface ResizeOptions {
  designWidth?: number;
  designHeight?: number;
  resizeDebounce?: number;
  resizeStrategy?: ResizeStrategy;
  resizeTo?: Window | HTMLElement;
}

@plugin('resize')
class ResizePlugin extends Plugin<ResizeOptions> {
  declare static readonly Trait: string;

  public static readonly EventType = {
    Resize: 'resize',
  };

  private _options: ResizeOptions;
  private _resizeId: number;
  private _eventPair: IEventPair;

  public constructor() {
    super();
    this._options = null;
    this._resizeId = null;
    this._eventPair = EventPair(ResizePlugin.EventType.Resize, this._queueResize, this);
  }

  public resize() {
    if (!this._options.resizeTo) {
      return;
    }

    this._cancelResize();

    const { resizeTo, designWidth, designHeight, resizeStrategy } = this._options;

    let cw: number;
    let cy: number;

    if (resizeTo === globalThis.window) {
      cw = globalThis.innerWidth;
      cy = globalThis.innerHeight;
    } else {
      const { clientWidth, clientHeight } = resizeTo as HTMLElement;
      cw = clientWidth;
      cy = clientHeight;
    }

    const ox = cw / designWidth;
    const oy = cy / designHeight;
    let scale = { x: 1, y: 1 };

    switch (resizeStrategy) {
      case ResizeStrategy.FitWith:
        scale.x = ox;
        scale.y = ox;
        break;
      case ResizeStrategy.FitHeight:
        scale.x = oy;
        scale.y = oy;
        break;
      case ResizeStrategy.FitAuto:
        const autoScale = ox > oy ? oy : ox;
        scale.x = autoScale;
        scale.y = autoScale;
        break;
      case ResizeStrategy.None:
        break;
    }

    const width = Math.floor(cw * scale.x);
    const height = Math.floor(cy * scale.y);
    const plugin = Game.Resolve(RendererPlugin);
    plugin.renderer.canvas.style.width = `${cw}px`;
    plugin.renderer.canvas.style.height = `${cy}px`;
    plugin.renderer.resize(width, height);
    plugin.render();

    window.scrollTo(0, 0);
    Game.Resolve(EventBusPlugin).sys.emit(ResizePlugin.EventType.Resize, { width, height });
    Logger.Sys.I(`scale(${scale.x.toFixed(2)},${scale.y.toFixed(2)}) canvas(${cw},${cy}) size(${width},${height})`);
  }

  private _queueResize() {
    if (!this._options.resizeTo) {
      return;
    }

    this._cancelResize();

    this._resizeId = setTimeout(() => this.resize(), this._options.resizeDebounce);
  }

  private _cancelResize() {
    if (this._resizeId) {
      cancelAnimationFrame(this._resizeId);
      this._resizeId = null;
    }
  }

  protected async doInit(options?: Partial<ResizeOptions>): Promise<void> {
    this._options = {
      designWidth: 800,
      designHeight: 600,
      resizeDebounce: 100,
      resizeStrategy: ResizeStrategy.FitAuto,
      resizeTo: options.resizeTo ?? window,
      ...(options ?? {}),
    };

    this._eventPair.add();
    this._queueResize();
  }

  protected doDestroy(): void {
    this._cancelResize();
    this._eventPair.remove();
    this._eventPair = null;
  }
}

export { ResizePlugin };
