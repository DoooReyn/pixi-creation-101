import { Game } from './game';
import { DevtoolsPlugin } from './plugin/devtools-plugin';
import { EventBusPlugin } from './plugin/event-bus-plugin';
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
  await Game.Init();
})();
