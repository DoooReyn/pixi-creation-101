import { Assets, Sprite } from 'pixi.js';

import { Game } from './game';
import { DevtoolsPlugin } from './plugin/devtools-plugin';
import { EventBusPlugin } from './plugin/event-bus-plugin';
import { GuiPlugin } from './plugin/gui-plugin';
import { RenderLoopPlugin } from './plugin/render-loop';
import { RendererPlugin } from './plugin/renderer-plugin';
import { ResizePlugin, ResizeStrategy } from './plugin/resize-plugin';
import { VisibilityPlugin } from './plugin/visibility-plugin';

(async () => {
  Game.Regsiter(RendererPlugin, { background: '#0e7be0' });
  Game.Regsiter(DevtoolsPlugin);
  Game.Regsiter(EventBusPlugin);
  Game.Regsiter(VisibilityPlugin);
  Game.Regsiter(ResizePlugin, { designWidth: 640, designHeight: 1136, resizeStrategy: ResizeStrategy.FitAuto });
  Game.Regsiter(RenderLoopPlugin, { maxFPS: 60, minFPS: 24 });
  Game.Regsiter(GuiPlugin, { layers: ['screen', 'window', 'popp', 'alert'] });
  await Game.Init();

  const { stage } = Game.Resolve(RendererPlugin);
  const eventBus = Game.Resolve(EventBusPlugin);
  const texture = await Assets.load('/assets/bunny.png');
  const bunny = new Sprite(texture);
  stage.addChild(bunny);
  eventBus.sys.add(ResizePlugin.EventType.Resize, (data: { width: number; height: number }) => {
    bunny.x = data.width - bunny.width;
    bunny.y = data.height - bunny.height;
  });
})();
