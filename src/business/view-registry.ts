import { AssetsBundle } from 'pixi.js';

import { ViewManifest } from '../engine/gui/view';
import { PausePopup } from './pause-popup';
import { MainScreen } from './screen-main';

enum VID {
  MainScreen,
  PausePopup,
}

const VMM: { [vid: number]: ViewManifest } = {
  [VID.MainScreen]: { label: 'main-screen', layer: 'screen', ctor: MainScreen },
  [VID.PausePopup]: { label: 'pause-popup', layer: 'popup', ctor: PausePopup, mask: true },
} as const;

const VB: { [vid: number]: AssetsBundle } = {
  [VID.MainScreen]: {
    name: 'main-screen',
    assets: [
      {
        alias: ['bunny'],
        src: ['/assets/bunny.png'],
      },
      {
        alias: ['logo'],
        src: ['/assets/logo.svg'],
      },
    ],
  },
} as const;

export { VID, VMM, VB };
