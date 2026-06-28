export interface HudSnapshot {
  score: number;
  coins: number;
  lives: number;
  time: number;
  world: string;
}

interface OverlayCopy {
  kicker: string;
  title: string;
  copy: string;
  button: string;
  variant?: 'default' | 'course';
  autoStartMs?: number;
}

export class HudController {
  private readonly scoreEl: HTMLElement;
  private readonly coinsEl: HTMLElement;
  private readonly timeEl: HTMLElement;
  private readonly worldEl: HTMLElement;
  private readonly overlayEl: HTMLElement;
  private readonly overlayKickerEl: HTMLElement;
  private readonly overlayTitleEl: HTMLElement;
  private readonly overlayCopyEl: HTMLElement;
  private readonly primaryButton: HTMLButtonElement;
  private readonly shortcutsOverlayEl: HTMLElement;
  private readonly shortcutsCloseButton: HTMLButtonElement;
  private readonly messageEl: HTMLElement;
  private shortcutsCloseHandler?: () => void;
  private messageTimer = 0;
  private overlayTimer = 0;
  private readonly handleShortcutsKeydown = (event: KeyboardEvent): void => {
    if (this.shortcutsOverlayEl.hidden || event.repeat) {
      return;
    }

    if (event.key !== 'Escape' && event.key !== '?' && !(event.key === '/' && event.shiftKey)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.shortcutsCloseHandler?.();
  };

  constructor(doc: Document) {
    this.scoreEl = this.requireElement(doc, 'hud-score');
    this.coinsEl = this.requireElement(doc, 'hud-coins');
    this.timeEl = this.requireElement(doc, 'hud-time');
    this.worldEl = this.requireElement(doc, 'hud-world');
    this.overlayEl = this.requireElement(doc, 'overlay');
    this.overlayKickerEl = this.requireElement(doc, 'overlay-kicker');
    this.overlayTitleEl = this.requireElement(doc, 'overlay-title');
    this.overlayCopyEl = this.requireElement(doc, 'overlay-copy');
    this.shortcutsOverlayEl = this.requireElement(doc, 'shortcuts-overlay');
    this.messageEl = this.requireElement(doc, 'message');

    const primaryButton = doc.getElementById('overlay-primary');
    if (!(primaryButton instanceof HTMLButtonElement)) {
      throw new Error('Missing overlay primary button');
    }
    this.primaryButton = primaryButton;

    const shortcutsCloseButton = doc.getElementById('shortcuts-close');
    if (!(shortcutsCloseButton instanceof HTMLButtonElement)) {
      throw new Error('Missing shortcuts close button');
    }
    this.shortcutsCloseButton = shortcutsCloseButton;

    doc.addEventListener('keydown', this.handleShortcutsKeydown, true);
  }

  setPrimaryAction(handler: () => void): void {
    this.primaryButton.onclick = handler;
  }

  setShortcutsCloseAction(handler: () => void): void {
    this.shortcutsCloseHandler = handler;
    this.shortcutsCloseButton.onclick = handler;
  }

  showTitle(world: string, lives: number, handler: () => void): void {
    this.showOverlay(
      {
        kicker: "Super Codex",
        title: `World ${world}`,
        copy: `Codex x ${lives}`,
        button: 'Start',
        variant: 'course'
      },
      handler
    );
  }

  showCourseIntro(world: string, lives: number, handler: () => void): void {
    this.showOverlay(
      {
        kicker: 'Get Ready',
        title: `World ${world}`,
        copy: `Codex x ${lives}`,
        button: 'Start',
        variant: 'course',
        autoStartMs: 1150
      },
      handler
    );
  }

  showCourseClear(currentWorld: string, nextWorld: string, handler: () => void): void {
    this.showOverlay(
      {
        kicker: `World ${currentWorld} Clear`,
        title: 'Course Clear',
        copy: `Next World ${nextWorld}`,
        button: 'Next Course',
        variant: 'course',
        autoStartMs: 1450
      },
      handler
    );
  }

  showAdventureClear(handler: () => void): void {
    this.showOverlay(
      {
        kicker: 'Adventure Clear',
        title: 'All Courses Clear',
        copy: 'Codex reached every flag and banked every final time bonus.',
        button: 'Run Again'
      },
      handler
    );
  }

  showGameOver(handler: () => void): void {
    this.showOverlay(
      {
        kicker: 'Try Again',
        title: 'Game Over',
        copy: 'Codex is ready at the start line for another attempt.',
        button: 'Restart'
      },
      handler
    );
  }

  showPaused(handler: () => void): void {
    this.showOverlay(
      {
        kicker: 'Paused',
        title: 'Pause',
        copy: 'Press Enter or P to resume the course.',
        button: 'Resume'
      },
      handler
    );
  }

  hideOverlay(): void {
    window.clearTimeout(this.overlayTimer);
    this.overlayEl.hidden = true;
  }

  showShortcuts(): void {
    this.shortcutsOverlayEl.hidden = false;
    window.setTimeout(() => this.shortcutsCloseButton.focus(), 0);
  }

  hideShortcuts(): void {
    this.shortcutsOverlayEl.hidden = true;
  }

  isShortcutsOpen(): boolean {
    return !this.shortcutsOverlayEl.hidden;
  }

  update(snapshot: HudSnapshot): void {
    this.scoreEl.textContent = snapshot.score.toString().padStart(6, '0');
    this.coinsEl.textContent = snapshot.coins.toString().padStart(2, '0');
    this.timeEl.textContent = snapshot.time.toString().padStart(3, '0');
    this.worldEl.textContent = snapshot.world;
  }

  setTimeWarning(active: boolean): void {
    this.timeEl.classList.toggle('is-warning', active);
  }

  flash(message: string): void {
    window.clearTimeout(this.messageTimer);
    this.messageEl.textContent = message;
    this.messageEl.classList.add('is-visible');
    this.messageTimer = window.setTimeout(() => {
      this.messageEl.classList.remove('is-visible');
    }, 1350);
  }

  private showOverlay(copy: OverlayCopy, handler: () => void): void {
    window.clearTimeout(this.overlayTimer);
    this.overlayEl.dataset.variant = copy.variant ?? 'default';
    this.overlayEl.dataset.autostart = copy.autoStartMs ? 'true' : 'false';
    this.overlayKickerEl.textContent = copy.kicker;
    this.overlayTitleEl.textContent = copy.title;
    this.overlayCopyEl.textContent = copy.copy;
    this.primaryButton.textContent = copy.button;
    this.primaryButton.hidden = Boolean(copy.autoStartMs);
    this.primaryButton.disabled = Boolean(copy.autoStartMs);
    this.setPrimaryAction(handler);
    this.overlayEl.hidden = false;
    if (copy.autoStartMs) {
      this.overlayTimer = window.setTimeout(() => {
        if (!this.overlayEl.hidden) {
          handler();
        }
      }, copy.autoStartMs);
    } else {
      window.setTimeout(() => this.primaryButton.focus(), 0);
    }
  }

  private requireElement(doc: Document, id: string): HTMLElement {
    const element = doc.getElementById(id);
    if (!element) {
      throw new Error(`Missing #${id}`);
    }
    return element;
  }
}
