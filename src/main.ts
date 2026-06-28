import Phaser from 'phaser';
import './style.css';
import { GameScene } from './game/phaser/scenes/GameScene';
import { HudController } from './ui/hud';

const hud = new HudController(document);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  backgroundColor: '#8bd7ff',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 768,
    height: 432
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1180 },
      debug: false
    }
  },
  scene: [new GameScene(hud)]
};

new Phaser.Game(config);
