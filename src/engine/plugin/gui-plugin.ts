import { Assets, Container, Sprite, Texture, Ticker, UPDATE_PRIORITY } from 'pixi.js';

import { VB } from '../../business/view-registry';
import { Game } from '../game';
import { View, ViewManifest } from '../gui/view';
import { ISize } from '../interface/math';
import { Logger } from '../logger';
import { EventBusPlugin } from './event-bus-plugin';
import { plugin, Plugin } from './plugin';
import { RenderLoopPlugin } from './render-loop';
import { RendererPlugin } from './renderer-plugin';
import { ResizePlugin } from './resize-plugin';

interface GuiPluginOptions {
  layers: string[];
}

@plugin('gui')
class GuiPlugin extends Plugin<GuiPluginOptions> {
  declare public static readonly Trait: string;

  private _layers: Map<string, Container>;
  private _views: Map<string, View>;
  private _registry: Map<number, ViewManifest>;
  private _mask: Sprite;
  private _maskRef: number;
  private _maskStack: Map<number, View>;
  public stage: Container;

  public constructor() {
    super();
    this._layers = new Map();
    this._views = new Map();
    this._registry = new Map();
    this._maskRef = 0;
    this._maskStack = new Map();
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

    const { layer, label, ctor, multi, mask } = manifest;

    if (!multi && this._views.has(label)) {
      Logger.Sys.W(`[${vid}] ${label} 视图已打开`);
      return;
    }

    const container = this._layers.get(layer);
    if (!container) {
      Logger.Sys.W(`${layer} 层级不存在`);
      return;
    }

    if (VB[vid] !== undefined) {
      const { name, assets } = VB[vid];
      Assets.addBundle(name, assets);
      await Assets.loadBundle(name);
    }

    const view = new ctor(manifest);
    const key = multi ? `${label}_${view.vvid}` : label;
    this._views.set(key, view);
    view.label = label;
    if (mask) {
      this._presentMask(container, view);
    }
    container.addChild(view);
    await view.prepare(...args);
  }

  public async close(vid: number, vvid?: number) {
    const manifest = this._registry.get(vid);
    if (!manifest) {
      Logger.Sys.E(`${vid} 视图未注册`);
      return;
    }

    const { label, multi, mask } = manifest;
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
    if (mask) {
      this._dismissMask(view);
    }
    view.destroy();
    this._views.delete(key);
  }

  protected async doInit(options: Partial<GuiPluginOptions>): Promise<void> {
    const eventBus = Game.Resolve(EventBusPlugin);
    const loop = Game.Resolve(RenderLoopPlugin);
    const { stage } = Game.Resolve(RendererPlugin);
    eventBus.sys.add(ResizePlugin.EventType.Resize, this._resize, this);
    (options.layers ?? ['screen', 'popup']).forEach((v) => {
      this._createLayer(v, stage);
    });

    this.stage = stage;

    const mask = new Sprite(Texture.WHITE);
    mask.label = 'mask';
    mask.tint = 0x0;
    mask.alpha = 0.25;
    mask.anchor = 0.5;
    mask.visible = false;
    mask.interactive = false;
    mask.interactiveChildren = false;
    this._mask = mask;
    stage.addChildAt(mask, 0);

    loop.ticker.add(this._update, this, UPDATE_PRIORITY.LOW);
  }

  protected doDestroy(): void {
    const eventBus = Game.Resolve(EventBusPlugin);
    const loop = Game.Resolve(RenderLoopPlugin);
    loop.ticker.remove(this._update, this);
    eventBus.sys.remove({ event: ResizePlugin.EventType.Resize, handler: this._resize, context: this });
  }

  private _presentMask(parent: Container, view: View) {
    this._maskRef++;
    this._mask.visible = true;
    this._maskStack.set(view.vvid, view);
    parent.addChild(this._mask);
  }

  private _dismissMask(view: View) {
    this._maskRef = Math.max(0, --this._maskRef);
    this._maskStack.delete(view.vvid);
    if (this._maskRef === 0) {
      this._mask.visible = false;
      this.stage.addChildAt(this._mask, 0);
    } else {
      const next = Array.from(this._maskStack.entries()).pop()[1];
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
    this._mask.setSize(size);
    this._mask.position.set(size.width / 2, size.height / 2);
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
