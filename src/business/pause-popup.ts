import { animate } from 'motion';
import { Container, Text } from 'pixi.js';

import { View } from '../engine/gui/view';
import { ISize } from '../engine/interface/math';

class PausePopup extends View {
  private panel: Container;
  private text: Text;

  public doPrepare(): void {
    this.panel = new Container();
    this.panel.label = 'body';
    this.addChild(this.panel);

    // Rich text with multiple styles
    this.text = new Text({
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
    this.text.label = 'text';
    this.panel.addChild(this.text);
  }

  public doReset(): void {}

  protected async doShow(): Promise<void> {
    this.panel.pivot.y = -400;
    await Promise.all([
      animate(
        this.panel.pivot,
        { y: -this.screen.height / 2 },
        { duration: 0.3, ease: 'backOut', reduceMotion: false }
      ),
    ]);
  }

  protected async doHide(): Promise<void> {
    await Promise.all([
      animate(this.panel.pivot, { y: this.screen.height / 2 }, { duration: 0.3, ease: 'backIn', reduceMotion: false }),
    ]);
  }

  public resize(_size: ISize): void {
    this.panel.pivot.x = -_size.width / 2;
    this.panel.pivot.y = -_size.height / 2;
  }
}

export { PausePopup };
