import { animate } from 'motion';
import { Container, Sprite } from 'pixi.js';

import { View } from '../engine/gui/view';
import { ISize } from '../engine/interface/math';
import { Logger } from '../engine/logger';

class MainScreen extends View {
  private _background: Sprite;
  private _bunny: Sprite;

  public doPrepare(): void {
    const background = new Sprite();
    background.label = 'background';
    background.eventMode = 'static';
    background.onclick = () => {
      Logger.Gui.D(`点击到背景: ${this.manifest.label}`);
    };

    const bunny = Sprite.from('bunny');
    bunny.label = 'bunny';
    bunny.anchor = 0.5;

    this._background = background;
    this._bunny = bunny;
    this.addChild(background, bunny);
  }

  public async doShow(): Promise<void> {
    this.alpha = 0;
    this._bunny.angle = 0;
    await animate(
      this as Container,
      { alpha: 1 },
      { duration: 0.3, delay: 0.75, ease: 'backOut', reduceMotion: false }
    );
    animate(
      this._bunny,
      { angle: 360 },
      {
        reduceMotion: false,
        duration: 1,
        repeatType: 'loop',
        repeatDelay: 0.1,
        repeat: Number.MAX_SAFE_INTEGER,
        ease: 'backInOut',
      }
    );
  }

  public resize(size: ISize): void {
    this._background.setSize(size);
    this._bunny.x = size.width / 2;
    this._bunny.y = size.height / 2 - 320;
  }

  public doUpdate(_dt: number): void {
    // this._bunny.rotation += 9 * 0.001 * _dt;
  }
}

export { MainScreen };
