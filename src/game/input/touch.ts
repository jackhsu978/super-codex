export interface TouchInputSnapshot {
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
}

interface GesturePointer {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startedAt: number;
  startedOnPad: boolean;
  startedOnLeftSide: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jumpHold: boolean;
  queuedJump: boolean;
  queuedDown: boolean;
}

interface QueuedPresses {
  jump: boolean;
  down: boolean;
  run: boolean;
  attack: boolean;
}

const DEAD_ZONE_X = 18;
const DEAD_ZONE_Y = 24;
const FIELD_DRAG_X = 24;
const FIELD_SWIPE_UP = 34;
const FIELD_SWIPE_DOWN = 42;
const TAP_MAX_DISTANCE = 12;
const TAP_MAX_MS = 230;
const RIGHT_JUMP_HOLD_MS = 210;

export class TouchControls {
  private readonly stage: HTMLElement;
  private readonly root?: HTMLElement;
  private readonly layer?: HTMLElement;
  private readonly stick?: HTMLElement;
  private readonly actionButton?: HTMLElement;
  private readonly helpButton?: HTMLElement;
  private readonly onHelp: () => void;
  private readonly gestures = new Map<number, GesturePointer>();
  private readonly actionPointers = new Set<number>();
  private readonly queued: QueuedPresses = { jump: false, down: false, run: false, attack: false };
  private leftDown = false;
  private rightDown = false;
  private upDown = false;
  private downDown = false;
  private jumpDown = false;
  private jumpHoldUntil = 0;
  private runDown = false;

  constructor(doc: Document, onHelp: () => void) {
    this.stage = this.requireElement(doc, 'game-stage');
    this.root = this.getElement(doc, 'touch-controls');
    this.layer = this.getElement(doc, 'touch-gesture-layer');
    this.stick = this.getElement(doc, 'touch-stick');
    this.actionButton = this.getElement(doc, 'touch-action');
    this.helpButton = this.getElement(doc, 'touch-help');
    this.onHelp = onHelp;
    this.bind();
  }

  snapshot(): TouchInputSnapshot {
    const now = performance.now();
    const state = {
      leftDown: this.leftDown,
      rightDown: this.rightDown,
      upDown: this.upDown,
      downDown: this.downDown,
      jumpDown: this.jumpDown || now < this.jumpHoldUntil,
      jumpPressed: this.queued.jump,
      downPressed: this.queued.down,
      runDown: this.runDown,
      runPressed: this.queued.run,
      attackPressed: this.queued.attack
    };

    this.queued.jump = false;
    this.queued.down = false;
    this.queued.run = false;
    this.queued.attack = false;

    return state;
  }

  reset(): void {
    this.gestures.clear();
    this.actionPointers.clear();
    this.queued.jump = false;
    this.queued.down = false;
    this.queued.run = false;
    this.queued.attack = false;
    this.jumpHoldUntil = 0;
    this.runDown = false;
    this.actionButton?.classList.remove('is-pressed');
    this.refreshGestureState();
  }

  destroy(): void {
    this.layer?.removeEventListener('pointerdown', this.handleLayerPointerDown);
    this.layer?.removeEventListener('pointermove', this.handlePointerMove);
    this.layer?.removeEventListener('pointerup', this.handlePointerEnd);
    this.layer?.removeEventListener('pointercancel', this.handlePointerEnd);
    this.stick?.removeEventListener('pointerdown', this.handleStickPointerDown);
    this.stick?.removeEventListener('pointermove', this.handlePointerMove);
    this.stick?.removeEventListener('pointerup', this.handlePointerEnd);
    this.stick?.removeEventListener('pointercancel', this.handlePointerEnd);
    this.actionButton?.removeEventListener('pointerdown', this.handleActionPointerDown);
    this.actionButton?.removeEventListener('pointerup', this.handleActionPointerEnd);
    this.actionButton?.removeEventListener('pointercancel', this.handleActionPointerEnd);
    this.actionButton?.removeEventListener('click', this.preventClick);
    this.helpButton?.removeEventListener('click', this.handleHelpClick);
    this.helpButton?.removeEventListener('pointerdown', this.preventPointerDefault);
    this.root?.removeEventListener('contextmenu', this.preventContextMenu);
    this.reset();
  }

  private bind(): void {
    this.layer?.addEventListener('pointerdown', this.handleLayerPointerDown);
    this.layer?.addEventListener('pointermove', this.handlePointerMove);
    this.layer?.addEventListener('pointerup', this.handlePointerEnd);
    this.layer?.addEventListener('pointercancel', this.handlePointerEnd);
    this.stick?.addEventListener('pointerdown', this.handleStickPointerDown);
    this.stick?.addEventListener('pointermove', this.handlePointerMove);
    this.stick?.addEventListener('pointerup', this.handlePointerEnd);
    this.stick?.addEventListener('pointercancel', this.handlePointerEnd);
    this.actionButton?.addEventListener('pointerdown', this.handleActionPointerDown);
    this.actionButton?.addEventListener('pointerup', this.handleActionPointerEnd);
    this.actionButton?.addEventListener('pointercancel', this.handleActionPointerEnd);
    this.actionButton?.addEventListener('click', this.preventClick);
    this.helpButton?.addEventListener('click', this.handleHelpClick);
    this.helpButton?.addEventListener('pointerdown', this.preventPointerDefault);
    this.root?.addEventListener('contextmenu', this.preventContextMenu);
  }

  private readonly handleLayerPointerDown = (event: PointerEvent): void => {
    this.beginGesture(event, false);
  };

  private readonly handleStickPointerDown = (event: PointerEvent): void => {
    event.stopPropagation();
    this.beginGesture(event, true);
  };

  private beginGesture(event: PointerEvent, startedOnPad: boolean): void {
    if (event.pointerType === 'mouse') {
      return;
    }

    event.preventDefault();
    const target = event.currentTarget;
    if (target instanceof HTMLElement) {
      target.setPointerCapture?.(event.pointerId);
    }

    const stageRect = this.stage.getBoundingClientRect();
    const pointer: GesturePointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startedAt: performance.now(),
      startedOnPad,
      startedOnLeftSide: event.clientX < stageRect.left + stageRect.width * 0.52,
      left: false,
      right: false,
      up: false,
      down: false,
      jumpHold: false,
      queuedJump: false,
      queuedDown: false
    };

    this.gestures.set(event.pointerId, pointer);
    this.updateGesture(pointer, event);

    if (!startedOnPad && !pointer.startedOnLeftSide) {
      this.queueJump(pointer, performance.now() + RIGHT_JUMP_HOLD_MS);
    }

    this.refreshGestureState();
  }

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const pointer = this.gestures.get(event.pointerId);
    if (!pointer) {
      return;
    }

    event.preventDefault();
    this.updateGesture(pointer, event);
    this.refreshGestureState();
  };

  private readonly handlePointerEnd = (event: PointerEvent): void => {
    const pointer = this.gestures.get(event.pointerId);
    if (!pointer) {
      return;
    }

    event.preventDefault();
    const duration = performance.now() - pointer.startedAt;
    const travel = Math.hypot(pointer.currentX - pointer.startX, pointer.currentY - pointer.startY);

    if (!pointer.startedOnPad && !pointer.queuedJump && duration <= TAP_MAX_MS && travel <= TAP_MAX_DISTANCE) {
      this.queueJump(pointer, performance.now() + 90);
    }

    this.gestures.delete(event.pointerId);
    this.refreshGestureState();
  };

  private updateGesture(pointer: GesturePointer, event: PointerEvent): void {
    pointer.currentX = event.clientX;
    pointer.currentY = event.clientY;
    const dx = pointer.currentX - pointer.startX;
    const dy = pointer.currentY - pointer.startY;

    if (pointer.startedOnPad && this.stick) {
      const stickRect = this.stick.getBoundingClientRect();
      const centerX = stickRect.left + stickRect.width / 2;
      const centerY = stickRect.top + stickRect.height / 2;
      const padX = pointer.currentX - centerX;
      const padY = pointer.currentY - centerY;
      pointer.left = padX < -DEAD_ZONE_X || dx < -FIELD_DRAG_X;
      pointer.right = padX > DEAD_ZONE_X || dx > FIELD_DRAG_X;
      pointer.up = padY < -DEAD_ZONE_Y || dy < -FIELD_SWIPE_UP;
      pointer.down = padY > DEAD_ZONE_Y || dy > FIELD_SWIPE_DOWN;
    } else {
      pointer.left = pointer.startedOnLeftSide && dx < -FIELD_DRAG_X;
      pointer.right = pointer.startedOnLeftSide && dx > FIELD_DRAG_X;
      pointer.up = dy < -FIELD_SWIPE_UP && Math.abs(dy) > Math.abs(dx) * 0.58;
      pointer.down = dy > FIELD_SWIPE_DOWN && Math.abs(dy) > Math.abs(dx) * 0.78;
    }

    if (pointer.up) {
      this.queueJump(pointer, 0);
    }

    if (pointer.down && !pointer.queuedDown) {
      pointer.queuedDown = true;
      this.queued.down = true;
    }
  }

  private queueJump(pointer: GesturePointer, holdUntil: number): void {
    if (!pointer.queuedJump) {
      this.queued.jump = true;
      pointer.queuedJump = true;
    }

    pointer.jumpHold = true;
    this.jumpHoldUntil = Math.max(this.jumpHoldUntil, holdUntil);
  }

  private refreshGestureState(): void {
    let left = false;
    let right = false;
    let up = false;
    let down = false;
    let jump = false;

    for (const pointer of this.gestures.values()) {
      left ||= pointer.left;
      right ||= pointer.right;
      up ||= pointer.up;
      down ||= pointer.down;
      jump ||= pointer.jumpHold;
    }

    this.leftDown = left;
    this.rightDown = right;
    this.upDown = up;
    this.downDown = down;
    this.jumpDown = jump;
  }

  private readonly handleActionPointerDown = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.actionButton?.setPointerCapture?.(event.pointerId);
    this.actionPointers.add(event.pointerId);
    this.runDown = true;
    this.queued.run = true;
    this.queued.attack = true;
    this.actionButton?.classList.add('is-pressed');
  };

  private readonly handleActionPointerEnd = (event: PointerEvent): void => {
    if (!this.actionPointers.has(event.pointerId)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.actionPointers.delete(event.pointerId);
    this.runDown = this.actionPointers.size > 0;
    this.actionButton?.classList.toggle('is-pressed', this.runDown);
  };

  private readonly handleHelpClick = (event: MouseEvent): void => {
    event.preventDefault();
    this.onHelp();
  };

  private readonly preventPointerDefault = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') {
      event.preventDefault();
    }
  };

  private readonly preventClick = (event: MouseEvent): void => {
    event.preventDefault();
  };

  private readonly preventContextMenu = (event: Event): void => {
    event.preventDefault();
  };

  private getElement(doc: Document, id: string): HTMLElement | undefined {
    const element = doc.getElementById(id);
    return element instanceof HTMLElement ? element : undefined;
  }

  private requireElement(doc: Document, id: string): HTMLElement {
    const element = this.getElement(doc, id);
    if (!element) {
      throw new Error(`Missing #${id}`);
    }

    return element;
  }
}
