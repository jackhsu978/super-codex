import Phaser from 'phaser';

export interface GamepadInputSnapshot {
  connected: boolean;
  isBackbone: boolean;
  leftDown: boolean;
  rightDown: boolean;
  upDown: boolean;
  downDown: boolean;
  jumpDown: boolean;
  jumpPressed: boolean;
  downPressed: boolean;
  runDown: boolean;
  runPressed: boolean;
  attackPressed: boolean;
  confirmPressed: boolean;
  cancelPressed: boolean;
  pausePressed: boolean;
  helpPressed: boolean;
}

interface GamepadDigitalState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  run: boolean;
  cancel: boolean;
  pause: boolean;
  help: boolean;
}

const LEFT_STICK_DEAD_ZONE = 0.28;
const BUTTON_THRESHOLD = 0.5;
const BUTTON_BOTTOM = 0;
const BUTTON_RIGHT = 1;
const BUTTON_LEFT = 2;
const BUTTON_TOP = 3;
const BUTTON_RIGHT_SHOULDER = 5;
const BUTTON_RIGHT_TRIGGER = 7;
const BUTTON_VIEW = 8;
const BUTTON_MENU = 9;

const EMPTY_STATE: GamepadDigitalState = {
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false,
  run: false,
  cancel: false,
  pause: false,
  help: false
};

const EMPTY_SNAPSHOT: GamepadInputSnapshot = {
  connected: false,
  isBackbone: false,
  leftDown: false,
  rightDown: false,
  upDown: false,
  downDown: false,
  jumpDown: false,
  jumpPressed: false,
  downPressed: false,
  runDown: false,
  runPressed: false,
  attackPressed: false,
  confirmPressed: false,
  cancelPressed: false,
  pausePressed: false,
  helpPressed: false
};

const justPressed = (current: boolean, previous: boolean): boolean => current && !previous;

export class GamepadControls {
  private readonly scene: Phaser.Scene;
  private activePadIndex?: number;
  private previous: GamepadDigitalState = { ...EMPTY_STATE };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  snapshot(): GamepadInputSnapshot {
    const pad = this.getActivePad();
    if (!pad) {
      this.activePadIndex = undefined;
      this.previous = { ...EMPTY_STATE };
      return { ...EMPTY_SNAPSHOT };
    }

    if (this.activePadIndex !== pad.index) {
      this.activePadIndex = pad.index;
      this.previous = { ...EMPTY_STATE };
    }

    const state = this.readState(pad);
    const jumpPressed = justPressed(state.jump, this.previous.jump);
    const runPressed = justPressed(state.run, this.previous.run);
    const snapshot: GamepadInputSnapshot = {
      connected: true,
      isBackbone: /backbone/i.test(pad.id),
      leftDown: state.left,
      rightDown: state.right,
      upDown: state.up,
      downDown: state.down,
      jumpDown: state.jump,
      jumpPressed,
      downPressed: justPressed(state.down, this.previous.down),
      runDown: state.run,
      runPressed,
      attackPressed: runPressed,
      confirmPressed: jumpPressed,
      cancelPressed: justPressed(state.cancel, this.previous.cancel),
      pausePressed: justPressed(state.pause, this.previous.pause),
      helpPressed: justPressed(state.help, this.previous.help)
    };

    this.previous = state;
    return snapshot;
  }

  private getActivePad(): Phaser.Input.Gamepad.Gamepad | undefined {
    const plugin = this.scene.input.gamepad;
    if (!plugin) {
      return undefined;
    }

    const pads = plugin.getAll().filter((pad) => pad.connected);
    if (this.activePadIndex !== undefined) {
      const activePad = pads.find((pad) => pad.index === this.activePadIndex);
      if (activePad && this.hasInput(activePad)) {
        return activePad;
      }
    }

    return pads.find((pad) => this.hasInput(pad)) ??
      pads.find((pad) => pad.index === this.activePadIndex) ?? pads[0];
  }

  private hasInput(pad: Phaser.Input.Gamepad.Gamepad): boolean {
    return (
      pad.buttons.some((button) => button.value >= BUTTON_THRESHOLD) ||
      Math.abs(pad.leftStick.x) >= LEFT_STICK_DEAD_ZONE ||
      Math.abs(pad.leftStick.y) >= LEFT_STICK_DEAD_ZONE
    );
  }

  private readState(pad: Phaser.Input.Gamepad.Gamepad): GamepadDigitalState {
    const stickX = pad.leftStick.x;
    const stickY = pad.leftStick.y;
    const jump = this.isButtonDown(pad, BUTTON_BOTTOM) || this.isButtonDown(pad, BUTTON_RIGHT);
    const run =
      this.isButtonDown(pad, BUTTON_LEFT) ||
      this.isButtonDown(pad, BUTTON_RIGHT_SHOULDER) ||
      this.isButtonDown(pad, BUTTON_RIGHT_TRIGGER);

    return {
      left: pad.left || stickX <= -LEFT_STICK_DEAD_ZONE,
      right: pad.right || stickX >= LEFT_STICK_DEAD_ZONE,
      up: pad.up || stickY <= -LEFT_STICK_DEAD_ZONE,
      down: pad.down || stickY >= LEFT_STICK_DEAD_ZONE,
      jump,
      run,
      cancel: this.isButtonDown(pad, BUTTON_RIGHT),
      pause: this.isButtonDown(pad, BUTTON_MENU),
      help: this.isButtonDown(pad, BUTTON_TOP) || this.isButtonDown(pad, BUTTON_VIEW)
    };
  }

  private isButtonDown(pad: Phaser.Input.Gamepad.Gamepad, index: number): boolean {
    return (pad.buttons[index]?.value ?? 0) >= BUTTON_THRESHOLD;
  }
}
