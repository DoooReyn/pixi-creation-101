import { animate } from 'motion';
import { Point } from 'pixi.js';

import { Handlers } from '../foundation/handlers';
import { ISize } from '../interface/math';
import { Logger } from '../logger';
import { Background } from './background';
import { Panel } from './panel';
import { View, ViewManifest } from './view';

class ViewPopup extends View {
  protected background: Background;
  protected panel: Panel;
  protected center: Point;

  public constructor(vid: number, manifest: ViewManifest) {
    super(vid, manifest);
    this.label = this.manifest.label;
    this.center = new Point(this.screen.width / 2, this.screen.height / 2);
  }

  public resize(size: ISize): void {
    const { width: sw, height: sh } = size;
    const { width: pw, height: ph } = this.panel;
    const cx = sw / 2;
    const cy = sh / 2;
    this.center.set(pw / 2, ph / 2);
    super.resize(size);
    this.background.setSize(size);
    this.background.position.set(cx, cy);
    this.panel.position.set(cx - this.center.x, cy - this.center.y);
  }

  protected doPrepare(): void {
    this.background = new Background();
    this.background.onClickHandler(Handlers.Create(this.onBackgroundClicked, this));

    this.panel = new Panel(480, 640);
    this.addChild(this.background, this.panel);
  }

  protected async doShow(): Promise<void> {
    this.panel.pivot.y = this.height / 2;
    await animate(this.panel.pivot, { y: 0 }, { duration: 0.3, ease: 'backOut', reduceMotion: false });
  }

  protected async doHide(): Promise<void> {
    await animate(this.panel.pivot, { y: this.height / 2 }, { duration: 0.3, ease: 'backIn', reduceMotion: false });
  }

  protected onBackgroundClicked() {
    Logger.Gui.D('点击到背景:', this.manifest.label);
  }
}

export { ViewPopup };
