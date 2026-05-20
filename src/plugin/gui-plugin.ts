import { Container } from 'pixi.js';

import { Game } from '../game';
import { View } from '../gui/view';
import { ISize } from '../interface/math';
import { EventBusPlugin } from './event-bus-plugin';
import { plugin, Plugin } from './plugin';
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

  public constructor() {
    super();
    this._layers = new Map();
    this._views = new Map();
  }

  public register() {}

  public open() {}

  public close() {}

  private _resize(size: ISize) {}

  protected async doInit(options: Partial<GuiPluginOptions>): Promise<void> {
    const eventBus = Game.Resolve(EventBusPlugin);
    const { stage } = Game.Resolve(RendererPlugin);
    eventBus.sys.add(ResizePlugin.EventType.Resize, this._resize, this);

    options.layers ??= ['screen', 'popup'];

    options.layers.forEach((v) => {
      const layer = new Container();
      layer.label = v;
      this._layers.set(v, layer);
      stage.addChild(layer);
    });
  }

  protected doDestroy(): void {
    const eventBus = Game.Resolve(EventBusPlugin);
    eventBus.sys.remove({ event: ResizePlugin.EventType.Resize, handler: this._resize, context: this });
  }
}

export { GuiPlugin };
