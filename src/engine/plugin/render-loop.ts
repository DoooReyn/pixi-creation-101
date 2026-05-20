import { Ticker, UPDATE_PRIORITY } from 'pixi.js';

import { Game } from '../game';
import { plugin, Plugin } from './plugin';
import { RendererPlugin } from './renderer-plugin';

interface RenderLoopOptions {
  minFPS: number;
  maxFPS: number;
}

@plugin('render-loop')
class RenderLoopPlugin extends Plugin<RenderLoopOptions> {
  declare static readonly Trait: string;
  public ticker: Ticker;

  public constructor() {
    super();
    this.ticker = null;
  }

  public pause() {
    this.ticker.stop();
  }

  public resume() {
    this.ticker.start();
  }

  public get started() {
    return this.ticker.started;
  }

  public get paused() {
    return !this.ticker.started;
  }

  private _render() {
    Game.Resolve(RendererPlugin).render();
  }

  protected async doInit(options: Partial<RenderLoopOptions>): Promise<void> {
    const { minFPS, maxFPS } = {
      minFPS: 24,
      maxFPS: 60,
      ...options,
    };
    const ticker = new Ticker();
    ticker.minFPS = minFPS;
    ticker.maxFPS = maxFPS;
    ticker.autoStart = true;
    ticker.add(this._render, this, UPDATE_PRIORITY.LOW);
    this.ticker = ticker;
  }

  protected doDestroy(): void {
    this.ticker.destroy();
    this.ticker = null;
  }
}

export { RenderLoopPlugin };
