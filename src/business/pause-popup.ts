import { Text } from 'pixi.js';

import { ViewPopup } from '../engine/gui/popup';

class PausePopup extends ViewPopup {
  private _text: Text;

  public doPrepare(): void {
    super.doPrepare();

    this._text = new Text({
      text: 'This is a long text\nthat has manual breaks',
      style: {
        fontFamily: 'Agave',
        fontSize: 24,
        fill: 0xff1010,
        wordWrap: true,
        wordWrapWidth: 400,
        whiteSpace: 'pre-line',
        lineHeight: 30,
        align: 'center',
      },
      anchor: 0.5,
    });
    this._text.label = 'text';
    this._text.position.set(this.panel.width / 2, this.panel.height / 2);
    this.panel.addChild(this._text);
  }
}

export { PausePopup };
