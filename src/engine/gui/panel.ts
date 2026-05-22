import { Container, Sprite } from 'pixi.js';

class Panel extends Container {
  private _body: Sprite;

  public constructor(width: number, height: number) {
    super();
    this.label = 'panel';

    const body = new Sprite();
    body.label = 'body';
    body.setSize(width, height);
    this._body = body;

    this.addChild(body);
  }

  public get width() {
    return this._body.width;
  }
  public set width(width) {
    this._body.width = width;
  }

  public get height() {
    return this._body.height;
  }
  public set height(height) {
    this._body.height = height;
  }

  public setSize(width: number, height: number) {
    this._body.setSize(width, height);
  }
}

export { Panel };
