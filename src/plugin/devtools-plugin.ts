import { initDevtools } from '@pixi/devtools';

import { Game } from '../game';
import { plugin, Plugin } from './plugin';
import { RendererPlugin } from './renderer-plugin';

@plugin('devtools')
class DevtoolsPlugin extends Plugin {
  declare static readonly Trait: string;
  protected async doInit(): Promise<void> {
    const { renderer, stage } = Game.Resolve(RendererPlugin);
    initDevtools({ renderer, stage });
  }

  protected doDestroy(): void {}
}

export { DevtoolsPlugin };
