import Phaser from 'phaser';

export interface PlatformerControls {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  jumpAlt: Phaser.Input.Keyboard.Key;
  run: Phaser.Input.Keyboard.Key;
  attack: Phaser.Input.Keyboard.Key;
  attackAlt: Phaser.Input.Keyboard.Key;
  restart: Phaser.Input.Keyboard.Key;
  start: Phaser.Input.Keyboard.Key;
  pause: Phaser.Input.Keyboard.Key;
}

export const createPlatformerControls = (scene: Phaser.Scene): PlatformerControls => {
  const keyboard = scene.input.keyboard;
  if (!keyboard) {
    throw new Error('Keyboard input is unavailable');
  }

  const keys = keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    jump: Phaser.Input.Keyboard.KeyCodes.W,
    jumpAlt: Phaser.Input.Keyboard.KeyCodes.SPACE,
    run: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    attack: Phaser.Input.Keyboard.KeyCodes.X,
    attackAlt: Phaser.Input.Keyboard.KeyCodes.K,
    restart: Phaser.Input.Keyboard.KeyCodes.R,
    start: Phaser.Input.Keyboard.KeyCodes.ENTER,
    pause: Phaser.Input.Keyboard.KeyCodes.P
  }) as Record<string, Phaser.Input.Keyboard.Key>;

  return {
    cursors: keyboard.createCursorKeys(),
    left: keys.left,
    right: keys.right,
    down: keys.down,
    jump: keys.jump,
    jumpAlt: keys.jumpAlt,
    run: keys.run,
    attack: keys.attack,
    attackAlt: keys.attackAlt,
    restart: keys.restart,
    start: keys.start,
    pause: keys.pause
  };
};
