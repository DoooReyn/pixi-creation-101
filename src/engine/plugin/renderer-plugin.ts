import { autoDetectRenderer, AutoDetectOptions, Container, Renderer } from 'pixi.js';

import { plugin, Plugin } from './plugin';

interface RendererOptions extends AutoDetectOptions {
  element: string;
}

@plugin('renderer')
class RendererPlugin extends Plugin<RendererOptions> {
  declare public static readonly Trait: string;
  public readonly renderer: Renderer;
  public readonly stage: Container;

  public constructor() {
    super();
    this.stage = new Container();
  }

  public render() {
    this.renderer.render({ container: this.stage });
  }

  public get screen() {
    return this.renderer.screen;
  }

  protected async doInit(options: Partial<RendererOptions>): Promise<void> {
    const opt = {
      element: 'pixi-container',
      backgroundColor: 0x1099bb,
      ...(options ?? {}),
    };

    const renderer = await autoDetectRenderer(opt as Partial<AutoDetectOptions>);
    Object.defineProperty(this, 'renderer', {
      value: renderer,
      configurable: false,
      writable: false,
      enumerable: true,
    });

    document.getElementById(opt.element)!.appendChild(renderer.canvas);
  }

  protected doDestroy(): void {
    this.renderer.destroy();
  }
}

export { RendererPlugin };
