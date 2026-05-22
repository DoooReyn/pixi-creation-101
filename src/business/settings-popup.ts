import { Sprite, Texture } from 'pixi.js';

import { ViewPopup } from '../engine/gui/popup';

class SettingsPopup extends ViewPopup {
  protected doPrepare(): void {
    super.doPrepare();

    const rect = new Sprite(Texture.WHITE);
    rect.setSize(100, 100);
    rect.anchor = 0.5;
    rect.position.set(this.panel.width / 2, this.panel.height / 2);
    this.panel.addChild(rect);
  }
}

export { SettingsPopup };
