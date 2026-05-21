import { animate } from 'motion';
import { Container, Sprite } from 'pixi.js';

import { View } from '../engine/gui/view';
import { ISize } from '../engine/interface/math';

class MainScreen extends View {
  private _bunny: Sprite;

  public doPrepare(): void {
    const bunny = Sprite.from('bunny');
    bunny.label = 'bunny';
    bunny.anchor = 0.5;
    this.addChild(bunny);
    this._bunny = bunny;
  }

  public async doShow(): Promise<void> {
    this.alpha = 0;
    this._bunny.angle = 0;
    await animate(this as Container, { alpha: 1 }, { duration: 0.3, delay: 0.75, ease: 'backOut' });
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
    this._bunny.x = size.width / 2;
    this._bunny.y = size.height / 2;
  }

  public doUpdate(_dt: number): void {
    // this._bunny.rotation += 9 * 0.001 * _dt;
  }
}

export { MainScreen };
