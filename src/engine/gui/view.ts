import { Container } from 'pixi.js';

import { ISize } from '../interface/math';

interface IView extends Container {
  show?(): Promise<void>;
  hide?(): Promise<void>;
  pause?(): Promise<void>;
  resume?(): Promise<void>;
  prepare?(): void;
  reset?(): void;
  update?(dt: number): void;
  resize?(size: ISize): void;
  blur?(): void;
  focus?(): void;
}

abstract class View extends Container implements IView {}

export { type IView, View };
