import { VB, VID, VMM } from './business/view-registry';
import { Game } from './engine/game';
import { DevtoolsPlugin } from './engine/plugin/devtools-plugin';
import { EventBusPlugin } from './engine/plugin/event-bus-plugin';
import { GuiPlugin } from './engine/plugin/gui-plugin';
import { RenderLoopPlugin } from './engine/plugin/render-loop';
import { RendererPlugin } from './engine/plugin/renderer-plugin';
import { ResizePlugin, ResizeStrategy } from './engine/plugin/resize-plugin';
import { VisibilityPlugin } from './engine/plugin/visibility-plugin';

(async () => {
  // 插件注册
  Game.Regsiter(RendererPlugin, { background: '#0e7be0' });
  Game.Regsiter(DevtoolsPlugin);
  Game.Regsiter(EventBusPlugin);
  Game.Regsiter(VisibilityPlugin);
  Game.Regsiter(ResizePlugin, { designWidth: 640, designHeight: 1136, resizeStrategy: ResizeStrategy.FitAuto });
  Game.Regsiter(RenderLoopPlugin, { maxFPS: 60, minFPS: 24 });
  Game.Regsiter(GuiPlugin, { layers: ['screen', 'window', 'popup', 'alert', 'message', 'notification'], bundles: VB });

  // 应用初始化
  await Game.Init();

  // Gui 注册
  const gui = Game.Resolve(GuiPlugin);
  for (const [vid, manifest] of Object.entries(VMM)) {
    gui.register(+vid, manifest);
  }

  // 打开 MainScreen
  await gui.open(VID.Main, { msg: 'This is a message from outer space' });
})();
