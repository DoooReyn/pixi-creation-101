import { Sprite } from 'pixi.js';

import { Handler, Handlers } from '../foundation/handlers';

class Background extends Sprite {
  private _handler: Handler;
  constructor() {
    super();

    this.anchor = 0.5;
  }

  public onClickHandler(handler: Handler) {
    if (this._handler) {
      this.offClickHandler();
    }
    this._handler = handler;
    this.interactive = true;
    this.on('click', this._clicked, this);
  }

  public offClickHandler() {
    this.interactive = false;
    this.off('click', this._clicked, this);
    this._handler = null;
  }

  private _clicked() {
    if (this._handler) {
      Handlers.Run(this._handler);
    }
  }
}

export { Background };
