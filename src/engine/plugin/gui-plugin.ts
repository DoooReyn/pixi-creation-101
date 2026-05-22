import { Assets, AssetsBundle, Container, Size, Sprite, Texture, Ticker, UPDATE_PRIORITY } from 'pixi.js';

import { KeyList } from '../foundation/key-list';
import { Game } from '../game';
import { View, ViewManifest } from '../gui/view';
import { ISize } from '../interface/math';
import { Logger } from '../logger';
import { EventBusPlugin, ISwitcher } from './event-bus-plugin';
import { plugin, Plugin } from './plugin';
import { RenderLoopPlugin } from './render-loop';
import { RendererPlugin } from './renderer-plugin';
import { ResizePlugin } from './resize-plugin';

interface GuiPluginOptions {
  bundles: { [vid: number]: AssetsBundle };
}

@plugin('gui')
class GuiPlugin extends Plugin<GuiPluginOptions> {
  declare public static readonly Trait: string;

  private _layers: Map<string, Container>;
  private _views: Map<string, View>;
  private _registry: Map<number, ViewManifest>;
  private _mask: Sprite;
  private _stack: KeyList<View>;
  public stage: Container;
  private _size: Size;
  private _bundles: { [vid: number]: AssetsBundle };
  private _switchers: ISwitcher[];

  public constructor() {
    super();
    this._layers = new Map();
    this._views = new Map();
    this._registry = new Map();
    this._stack = new KeyList();
    this._size = { width: 0, height: 0 };
    this._bundles = null;
    this._switchers = [];
  }

  public register(vid: number, manifest: ViewManifest) {
    if (this._registry.has(vid)) {
      Logger.Sys.W(`${vid} 视图已存在`);
      return;
    }
    this._registry.set(vid, manifest);
    Logger.Sys.I(`${vid} 视图已注册`);
  }

  public unregister(vid: number) {
    if (this._registry.delete(vid)) {
      Logger.Sys.I(`${vid} 视图已注册`);
    }
  }

  public async open(vid: number, ...args: unknown[]) {
    const manifest = this._registry.get(vid);
    if (!manifest) {
      Logger.Sys.E(`${vid} 视图未注册`);
      return;
    }

    const { layer, label, ctor, multi } = manifest;

    if (!multi && this._views.has(label)) {
      Logger.Sys.W(`[${vid}] ${label} 视图已打开`);
      return;
    }

    const container = this._layers.get(layer);
    if (!container) {
      Logger.Sys.W(`${layer} 层级不存在`);
      return;
    }

    if (this._bundles[vid]) {
      const { name, assets } = this._bundles[vid];
      Assets.addBundle(name, assets);
      await Assets.loadBundle(name);
    }

    const view = new ctor(vid, manifest);
    const key = multi ? `${label}_${view.vvid}` : label;
    this._views.set(key, view);
    view.label = label;
    if (this.isMaskLayer(layer)) {
      this._presentMask(container, view);
    }
    container.addChild(view);
    await view.prepare(...args);
  }

  public isMaskLayer(layer: string) {
    return layer === 'popup' || layer === 'alert';
  }

  public async close(vid: number, vvid?: number) {
    const manifest = this._registry.get(vid);
    if (!manifest) {
      Logger.Sys.E(`${vid} 视图未注册`);
      return;
    }

    const { layer, label, multi } = manifest;
    let key: string = null;
    if (vvid || (multi && vvid)) {
      key = multi ? `${label}_${vvid}` : label;
    } else {
      key = label;
    }

    const view = this._views.get(key);
    if (!view) {
      Logger.Sys.E(`${vid} 视图未打开`);
      return;
    }

    await view.reset();

    if (this.isMaskLayer(layer)) {
      this._dismissMask(view);
    }
    view.destroy();
    this._views.delete(key);
  }

  public async closePopup() {
    if (this._stack.size > 0) {
      const view = this._stack.last();
      await this.close(view.vid, view.vvid);
    }
  }

  protected async doInit(options: Partial<GuiPluginOptions>): Promise<void> {
    this._bundles = options.bundles ?? {};

    const eventBus = Game.Resolve(EventBusPlugin);
    const loop = Game.Resolve(RenderLoopPlugin);
    const { stage } = Game.Resolve(RendererPlugin);

    // stage
    this.stage = stage;
    this._size.width = stage.width;
    this._size.height = stage.height;

    // mask
    const mask = new Sprite(Texture.WHITE);
    mask.label = 'mask';
    mask.tint = 0x0;
    mask.alpha = 0.25;
    mask.anchor = 0.5;
    mask.visible = false;
    mask.interactive = true;
    this._mask = mask;
    stage.addChildAt(mask, 0);

    // layers
    ['screen', 'window', 'popup', 'alert', 'message', 'notification'].forEach((v) => {
      this._createLayer(v, stage);
    });

    // event
    const resize = eventBus.pairs(EventBusPlugin.Channel.Gui, ResizePlugin.EventType.Resize, this._resize, this);

    // update
    const update = {
      enable: () => loop.ticker.add(this._update, this, UPDATE_PRIORITY.LOW),
      disable: () => loop.ticker.remove(this._update, this),
    };

    // switchers
    this._switchers.push(resize, update);
    this._switchers.forEach((swt) => swt.enable());
  }

  protected doDestroy(): void {
    this._switchers.forEach((swt) => swt.disable());
    this._switchers.length = 0;
  }

  private _presentMask(parent: Container, view: View) {
    this._mask.visible = true;
    this._stack.set(String(view.vvid), view);
    parent.addChild(this._mask);
  }

  private _dismissMask(view: View) {
    this._stack.delete(String(view.vvid));
    if (this._stack.size === 0) {
      this._mask.visible = false;
      this.stage.addChildAt(this._mask, 0);
    } else {
      const next = this._stack.last();
      const index = Math.max(0, next.parent.getChildIndex(next) - 1);
      next.parent.addChildAt(this._mask, index);
    }
  }

  private _createLayer(name: string, stage: Container) {
    const layer = new Container();
    layer.label = name;
    this._layers.set(name, layer);
    stage.addChild(layer);
    return layer;
  }

  private _resize(size: ISize) {
    const cx = size.width / 2,
      cy = size.height / 2;

    this._size.width = size.width;
    this._size.height = size.height;

    this._mask.position.set(cx, cy);
    this._mask.setSize(size);

    for (const [, view] of this._views) {
      view.resize?.(size);
    }
  }

  private _update(ticker: Ticker) {
    for (const [, view] of this._views) {
      view.update?.(ticker.deltaMS);
    }
  }
}

export { GuiPlugin };
