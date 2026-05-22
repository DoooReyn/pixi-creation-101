import { Container } from 'pixi.js';

import { generator } from '../foundation/generator';
import { Game } from '../game';
import { ISize } from '../interface/math';
import { RendererPlugin } from '../plugin/renderer-plugin';

interface ViewManifest {
  label: string;
  layer: string;
  ctor: ViewConstructor;
  multi?: boolean;
  mask?: boolean;
}

interface ViewConstructor {
  new (vid: number, manifest: ViewManifest): View;
}

class View extends Container {
  public static readonly Generator = generator();
  public readonly vid: number;
  public readonly vvid: number;
  public readonly manifest: ViewManifest;
  private _paused: boolean;
  protected args: unknown[];

  public constructor(vid: number, manifest: ViewManifest) {
    super();
    this._paused = false;
    this.vid = vid;
    this.vvid = View.Generator();
    this.manifest = manifest;
  }

  public async prepare(...args: unknown[]): Promise<void> {
    this.args = args;
    this.doPrepare();
    this.resize(this.screen);
    await this.doShow();
  }

  public async reset(): Promise<void> {
    await this.doHide();
    this.doReset();
  }

  public update(_dt: number): void {
    if (this.running) {
      this.doUpdate(_dt);
    }
  }

  public resize(_size: ISize): void {}

  public blur?(): void;

  public focus?(): void;
  public pause() {
    this._paused = true;
  }

  public resume() {
    this._paused = false;
  }

  public get running() {
    return !this._paused;
  }

  public get screen() {
    return Game.Resolve(RendererPlugin).screen;
  }

  protected doPrepare(): void {}
  protected doReset(): void {}
  protected doUpdate(_dt: number): void {}
  protected async doShow(): Promise<void> {}
  protected async doHide(): Promise<void> {}
}

export { View, type ViewConstructor, type ViewManifest };
