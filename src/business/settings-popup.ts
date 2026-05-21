import { Sprite, Texture } from 'pixi.js';

import { View } from '../engine/gui/view';
import { ISize } from '../engine/interface/math';

class SettingsPopup extends View {
  private _body: Sprite;
  protected doPrepare(): void {
    const body = new Sprite(Texture.WHITE);
    body.label = 'body';
    body.anchor = 0.5;
    body.tint = 0xffffff;
    body.setSize(100, 100);
    this._body = body;

    this.addChild(body);
  }

  protected doReset(): void {}

  protected async doShow(): Promise<void> {}

  protected async doHide(): Promise<void> {}

  public resize(_size: ISize): void {
    super.resize(_size);
    this._body.position.set(_size.width / 2, _size.height / 2);
  }
}

export { SettingsPopup };
