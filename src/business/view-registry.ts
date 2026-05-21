import { AssetsBundle } from 'pixi.js';

import { ViewManifest } from '../engine/gui/view';
import { PausePopup } from './pause-popup';
import { MainScreen } from './screen-main';
import { SettingsPopup } from './settings-popup';

enum VID {
  Main,
  GamePause,
  Settings,
}

const VMM: { [vid: number]: ViewManifest } = {
  [VID.Main]: { label: 'main', layer: 'screen', ctor: MainScreen },
  [VID.GamePause]: { label: 'game-pause', layer: 'popup', ctor: PausePopup, mask: true },
  [VID.Settings]: { label: 'settings', layer: 'popup', ctor: SettingsPopup, mask: true },
} as const;

const VB: { [vid: number]: AssetsBundle } = {
  [VID.Main]: {
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
