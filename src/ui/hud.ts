export interface HudSnapshot {
  score: number;
  coins: number;
  lives: number;
  time: number;
  world: string;
}

export interface AdminWorldOption {
  index: number;
  world: string;
  theme: string;
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
  private readonly doc: Document;
  private readonly scoreEl: HTMLElement;
  private readonly coinsEl: HTMLElement;
  private readonly timeEl: HTMLElement;
  private readonly worldEl: HTMLElement;
  private readonly worldItemEl: HTMLElement;
  private readonly overlayEl: HTMLElement;
  private readonly overlayKickerEl: HTMLElement;
  private readonly overlayTitleEl: HTMLElement;
  private readonly overlayCopyEl: HTMLElement;
  private readonly primaryButton: HTMLButtonElement;
  private readonly shortcutsOverlayEl: HTMLElement;
  private readonly shortcutsCloseButton: HTMLButtonElement;
  private readonly adminOverlayEl: HTMLElement;
  private readonly adminWorldListEl: HTMLElement;
  private readonly adminCloseButton: HTMLButtonElement;
  private readonly messageEl: HTMLElement;
  private shortcutsCloseHandler?: () => void;
  private adminCloseHandler?: () => void;
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

  private readonly handleAdminKeydown = (event: KeyboardEvent): void => {
    if (this.adminOverlayEl.hidden || event.repeat) {
      return;
    }

    if (event.key !== 'Escape' && event.code !== 'Backquote') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.adminCloseHandler?.();
  };

  constructor(doc: Document) {
    this.doc = doc;
    this.scoreEl = this.requireElement(doc, 'hud-score');
    this.coinsEl = this.requireElement(doc, 'hud-coins');
    this.timeEl = this.requireElement(doc, 'hud-time');
    this.worldEl = this.requireElement(doc, 'hud-world');
    this.worldItemEl = this.requireElement(doc, 'hud-world-entry');
    this.overlayEl = this.requireElement(doc, 'overlay');
    this.overlayKickerEl = this.requireElement(doc, 'overlay-kicker');
    this.overlayTitleEl = this.requireElement(doc, 'overlay-title');
    this.overlayCopyEl = this.requireElement(doc, 'overlay-copy');
    this.shortcutsOverlayEl = this.requireElement(doc, 'shortcuts-overlay');
    this.adminOverlayEl = this.requireElement(doc, 'admin-overlay');
    this.adminWorldListEl = this.requireElement(doc, 'admin-world-list');
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

    const adminCloseButton = doc.getElementById('admin-close');
    if (!(adminCloseButton instanceof HTMLButtonElement)) {
      throw new Error('Missing admin close button');
    }
    this.adminCloseButton = adminCloseButton;

    doc.addEventListener('keydown', this.handleShortcutsKeydown, true);
    doc.addEventListener('keydown', this.handleAdminKeydown, true);
  }

  setPrimaryAction(handler: () => void): void {
    this.primaryButton.onclick = handler;
  }

  setShortcutsCloseAction(handler: () => void): void {
    this.shortcutsCloseHandler = handler;
    this.shortcutsCloseButton.onclick = handler;
  }

  setAdminAction(handler: () => void): void {
    this.worldItemEl.onclick = handler;
    this.worldItemEl.onkeydown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      handler();
    };
  }

  showTitle(handler: () => void): void {
    this.showOverlay(
      {
        kicker: 'Retro Platformer',
        title: 'Super Codex',
        copy: 'Run, jump, collect coins, stomp enemies, and reach the banner.',
        button: 'Start'
      },
      handler
    );
  }

  activatePrimaryAction(): void {
    if (!this.primaryButton.hidden && !this.primaryButton.disabled) {
      this.primaryButton.click();
    }
  }

  showCourseIntro(world: string, lives: number, handler: () => void): void {
    this.showOverlay(
      {
        kicker: 'Super Codex',
        title: `World ${world}`,
        copy: `Codex  x  ${lives}`,
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
        kicker: `World ${currentWorld}`,
        title: 'Course Clear!',
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

  showAdminWorldSelect(
    worlds: AdminWorldOption[],
    currentIndex: number,
    selectHandler: (levelIndex: number) => void,
    closeHandler: () => void
  ): void {
    this.adminCloseHandler = closeHandler;
    this.adminCloseButton.onclick = closeHandler;
    this.adminWorldListEl.replaceChildren();

    for (const world of worlds) {
      const button = this.doc.createElement('button');
      const label = this.doc.createElement('span');
      const meta = this.doc.createElement('span');

      button.type = 'button';
      button.className = 'admin-worlds__button';
      button.dataset.active = world.index === currentIndex ? 'true' : 'false';
      button.onclick = () => selectHandler(world.index);

      label.textContent = `World ${world.world}`;
      meta.textContent = `${world.index + 1}  /  ${this.formatThemeName(world.theme)}`;
      button.append(label, meta);
      this.adminWorldListEl.append(button);
    }

    this.adminOverlayEl.hidden = false;
    const activeButton =
      this.adminWorldListEl.querySelector<HTMLButtonElement>('[data-active="true"]') ??
      this.adminWorldListEl.querySelector<HTMLButtonElement>('button');
    window.setTimeout(() => activeButton?.focus(), 0);
  }

  hideAdminWorldSelect(): void {
    this.adminOverlayEl.hidden = true;
  }

  isAdminWorldSelectOpen(): boolean {
    return !this.adminOverlayEl.hidden;
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

  private formatThemeName(theme: string): string {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
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
