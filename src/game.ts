import { Logger } from './logger';
import { Plugin, PluginConstructor } from './plugin/plugin';

class Game {
  // #################### private ####################

  private static _inited: boolean = false;
  private static _destroyed: boolean = false;
  private static _classes: Map<string, [PluginConstructor<Plugin>, object, Plugin?]> = new Map();

  private static async _loadPlugin<P extends Plugin>(cls: PluginConstructor<P>, opt?: Parameters<P['init']>[0]) {
    const trait = cls.Trait;
    const plugin = this._classes.get(trait);
    if (plugin?.[2]) {
      Logger.Sys.W(`插件已存在: ${trait}`);
      return;
    }

    const inst = new cls();
    plugin[2] = inst;
    await inst.init(opt ?? {});
    Logger.Sys.I(`注册插件 ${trait}`);
  }

  // #################### public ####################

  public static Regsiter<P extends Plugin>(cls: PluginConstructor<P>, options?: Parameters<P['init']>[0]) {
    if (!this._inited) {
      this._classes.set(cls.Trait, [cls, options]);
    }
  }

  public static Unregister<P extends Plugin>(cls: PluginConstructor<P>) {
    if (!this._inited) {
      this._classes.delete(cls.Trait);
    }
  }

  public static async Init() {
    if (this._inited) return;

    this._inited = true;
    globalThis.__PIXI_GAME__ = this;

    for (const [, [cls, opt]] of this._classes) {
      await this._loadPlugin(cls, opt);
    }
  }

  public static Resolve<P extends Plugin>(cls: PluginConstructor<P> | string) {
    return this._classes.get(typeof cls === 'string' ? cls : cls.Trait)?.[2] as P;
  }

  public static Destroy() {
    if (this._destroyed) return;

    this._destroyed = true;
    delete globalThis.__PIXI_GAME__;

    Array.from(this._classes.entries())
      .reverse()
      .forEach((v) => {
        Logger.Sys.I(`注销插件: ${v[0]}`);
        v[1][2].destroy();
      });
    this._classes.clear();
  }
}

declare global {
  var __PIXI_GAME__: undefined | Game;
}

export { Game };
