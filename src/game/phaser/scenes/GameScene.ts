import Phaser from 'phaser';
import { LEVELS, TILE_SIZE, type BalanceLift, type CannonLauncher, type ConduitLink, type EnemyKind, type FallingLift, type Firebar, type LavaBubble, type LevelDefinition, type LevelTheme, type MovingPlatform, type Point, type SolidKind, type ThemeRegion, type VineBlock } from '../../content/level';
import { createPlatformerControls, type PlatformerControls } from '../../input/bindings';
import { TouchControls } from '../../input/touch';
import { ensureGeneratedTextures } from '../view/textures';
import { HudController } from '../../../ui/hud';

interface RunState {
  score: number;
  coins: number;
  lives: number;
  time: number;
  world: string;
}

interface RunCarryState {
  score: number;
  coins: number;
  lives: number;
  powered?: boolean;
  sparked?: boolean;
}

interface SceneInitData {
  autoStart?: boolean;
  levelIndex?: number;
  carry?: RunCarryState;
  respawnAtCheckpoint?: boolean;
}

type SolidSprite = Phaser.Physics.Arcade.Image & {
  body: Phaser.Physics.Arcade.StaticBody;
};

type MovingPlatformSprite = Phaser.Physics.Arcade.Image & {
  body: Phaser.Physics.Arcade.Body;
};

type BalanceLiftSprite = Phaser.Physics.Arcade.Image & {
  body: Phaser.Physics.Arcade.Body;
};

type FallingLiftSprite = Phaser.Physics.Arcade.Image & {
  body: Phaser.Physics.Arcade.Body;
};

interface BalanceLiftPair {
  left: BalanceLiftSprite;
  right: BalanceLiftSprite;
  leftHomeY: number;
  rightHomeY: number;
  leftMinY: number;
  leftMaxY: number;
  rightMinY: number;
  rightMaxY: number;
  speed: number;
  rope: Phaser.GameObjects.Graphics;
}

type FirebarSprite = Phaser.Physics.Arcade.Image & {
  body: Phaser.Physics.Arcade.Body;
};

type VineSprite = Phaser.Physics.Arcade.Image & {
  body: Phaser.Physics.Arcade.StaticBody;
};

type GuardianFireballSprite = Phaser.Physics.Arcade.Image & {
  body: Phaser.Physics.Arcade.Body;
};

type LavaBubbleSprite = Phaser.Physics.Arcade.Image & {
  body: Phaser.Physics.Arcade.Body;
};

type CannonLauncherSprite = Phaser.Physics.Arcade.Image & {
  body: Phaser.Physics.Arcade.StaticBody;
};

type CannonShotSprite = Phaser.Physics.Arcade.Image & {
  body: Phaser.Physics.Arcade.Body;
};

type EnemyProjectileSprite = Phaser.Physics.Arcade.Sprite & {
  body: Phaser.Physics.Arcade.Body;
};

type SpringboardSprite = Phaser.Physics.Arcade.Image & {
  body: Phaser.Physics.Arcade.StaticBody;
};

type PowerupKind = 'growth' | 'spark' | 'star' | 'life';
type EnemyMode = 'walking' | 'shell' | 'sliding';
type PipePlantState = 'hidden' | 'emerging' | 'shown' | 'retreating';
type ComboReward = number | '1up';

const PET_FRAME_WIDTH = 192;
const PET_FRAME_HEIGHT = 208;
const PET_SHEET_TEXTURE = 'codex-pet';
const PET_JUMP_FRAME = 34;
const PET_CROUCH_FRAME = 0;
const BONUS_BLOCK_FRAMES = ['tile-bonus', 'tile-bonus-bright', 'tile-bonus', 'tile-bonus-shadow'];
const COIN_FRAMES = ['coin', 'coin-mid', 'coin-side', 'coin-mid'];
const COURSE_MUSIC_NOTES = [523.25, 659.25, 783.99, 0, 698.46, 783.99, 880, 0, 659.25, 587.33, 523.25, 0, 587.33, 659.25, 523.25, 0];
const COURSE_MUSIC_BASS = [130.81, 0, 196, 0, 174.61, 0, 196, 0];
const COURSE_MUSIC_STEP_MS = 132;
const COURSE_MUSIC_HURRY_STEP_MS = 96;
const STAR_MUSIC_NOTES = [783.99, 987.77, 1174.66, 1318.51, 1174.66, 987.77, 880, 1046.5, 1318.51, 1567.98, 1318.51, 1046.5];
const STAR_MUSIC_BASS = [196, 0, 246.94, 0, 220, 0, 261.63, 0];
const STAR_MUSIC_STEP_MS = 82;
const BONUS_BLOCK_ANIM_FRAME_MS = 140;
const COIN_ANIM_FRAME_MS = 90;
const ENEMY_WALK_ANIM_FRAME_MS = 180;
const BLOCK_BUMP_PIXELS = 8;
const BRICK_DEBRIS_LIFETIME = 620;
const BRICK_DEBRIS_GRAVITY_Y = 880;
const POWER_TRANSITION_DURATION = 430;
const POWER_TRANSITION_STEP_MS = 62;
const INVULNERABLE_FLICKER_FRAME_MS = 78;
const INVULNERABLE_FLICKER_ALPHA = 0.42;
const POWERUP_EMERGE_DURATION = 320;
const PET_SCALE = 0.28;
const POWERED_PET_SCALE = 0.38;
const CROUCH_PET_SCALE_X = POWERED_PET_SCALE * 1.08;
const CROUCH_PET_SCALE_Y = POWERED_PET_SCALE * 0.72;
const PLAYER_BODY_WIDTH = 82;
const PLAYER_BODY_OFFSET_X = 55;
const PLAYER_SMALL_BODY_HEIGHT = 118;
const PLAYER_SMALL_BODY_OFFSET_Y = 70;
const PLAYER_POWERED_BODY_HEIGHT = 140;
const PLAYER_POWERED_BODY_OFFSET_Y = 48;
const PLAYER_CROUCH_BODY_HEIGHT = 96;
const PLAYER_CROUCH_BODY_OFFSET_Y = PLAYER_POWERED_BODY_OFFSET_Y + PLAYER_POWERED_BODY_HEIGHT - PLAYER_CROUCH_BODY_HEIGHT;
const WALK_SPEED = 198;
const RUN_SPEED = 326;
const WALK_JUMP_VELOCITY = -530;
const RUN_JUMP_VELOCITY = -625;
const JUMP_CUT_VELOCITY = -185;
const PLAYER_SHORT_HOP_EXTRA_GRAVITY_Y = 260;
const PLAYER_FALL_EXTRA_GRAVITY_Y = 520;
const PLAYER_MAX_FALL_SPEED = 860;
const STOMP_BOUNCE_VELOCITY = -330;
const STOMP_HELD_BOUNCE_VELOCITY = -420;
const STOMP_CROSSING_TOLERANCE = 6;
const STOMP_FEET_MAX_DEPTH = 14;
const STOMP_HORIZONTAL_INSET = 8;
const STOMP_MIN_DROP_PIXELS = 0.8;
const STOMP_MIN_DESCENT_VELOCITY = 24;
const STOMP_SIDE_CONTACT_MAX_DEPTH = 8;
const SPRINGBOARD_BOUNCE_VELOCITY = -820;
const SPRINGBOARD_HELD_BOUNCE_VELOCITY = -900;
const VINE_CLIMB_SPEED = 118;
const VINE_CENTERING_SPEED = 100;
const SKID_DUST_SPEED = 145;
const SKID_DUST_INTERVAL = 115;
const LANDING_DUST_MIN_VELOCITY = 280;
const GROUND_ACCELERATION = 760;
const AIR_ACCELERATION = 390;
const GROUND_FRICTION = 560;
const AIR_FRICTION = 82;
const SKID_DECELERATION = 1460;
const WALKING_ENEMY_SPEED = 55;
const ENEMY_ACTIVATION_MARGIN = 112;
const SHELL_SLIDE_SPEED = 330;
const WING_SHELLBACK_HOP_VELOCITY = -330;
const WING_SHELLBACK_HOP_INTERVAL = 880;
const MOVING_LIFT_WIDTH = 96;
const MOVING_LIFT_HEIGHT = 18;
const BALANCE_LIFT_WIDTH = 72;
const BALANCE_LIFT_HEIGHT = 16;
const BALANCE_LIFT_DEFAULT_SPEED = 68;
const BALANCE_LIFT_PULLEY_OFFSET = 58;
const FALLING_LIFT_WIDTH = 96;
const FALLING_LIFT_HEIGHT = 18;
const FALLING_LIFT_DEFAULT_DELAY = 420;
const FALLING_LIFT_DEFAULT_SPEED = 255;
const FIREBAR_SEGMENT_SPACING = 21;
const PIPE_PLANT_MOVE_DURATION = 520;
const PIPE_PLANT_SHOWN_DURATION = 980;
const PIPE_PLANT_HIDDEN_DURATION = 1120;
const PIPE_PLANT_PLAYER_SAFE_RADIUS = 74;
const PROJECTILE_SPEED = 390;
const PROJECTILE_BOUNCE_Y = -245;
const PROJECTILE_MAX_GROUND_BOUNCES = 4;
const PROJECTILE_BOUNCE_COOLDOWN = 90;
const PROJECTILE_COOLDOWN = 320;
const PROJECTILE_TTL = 3200;
const MAX_PROJECTILES = 2;
const STAR_POWER_DURATION = 10000;
const CONDUIT_TRAVEL_PIXELS = 28;
const FLAG_SLIDE_DURATION = 700;
const FLAG_POLE_GRAB_OFFSET_X = 10;
const FLAG_PLAYER_BASE_OFFSET_Y = 8;
const FLAG_DISMOUNT_OFFSET_X = 34;
const FLAG_DISMOUNT_HOP_HEIGHT = 24;
const FLAG_DISMOUNT_HOP_DURATION = 150;
const FLAG_DISMOUNT_SETTLE_DURATION = 130;
const FINISH_RUN_MIN_DURATION = 520;
const FINISH_RUN_MAX_DURATION = 980;
const TIME_BONUS_SCORE = 50;
const TIME_BONUS_STEP = 5;
const TIME_BONUS_STEP_DELAY = 16;
const COURSE_TIMER_TICK_MS = 420;
const TIME_WARNING_THRESHOLD = 100;
const FLAG_FIREWORK_SCORE = 500;
const FLAG_FIREWORK_DELAY = 360;
const DAMAGE_HITSTOP_DURATION = 260;
const DAMAGE_INVULNERABLE_DURATION = 1750;
const LIFE_LOSS_HOP_HEIGHT = 72;
const LIFE_LOSS_FALL_DISTANCE = 230;
const LIFE_LOSS_HOP_DURATION = 260;
const LIFE_LOSS_FALL_DURATION = 620;
const CAMERA_LEAD_X = 260;
const SKY_ROUTE_CAMERA_PLAYER_SCREEN_Y = 160;
const SKY_ROUTE_CAMERA_RETURN_SCREEN_Y = 280;
const SKY_ROUTE_CAMERA_LERP = 0.18;
const PLAYER_SCREEN_LEFT_PADDING = 18;
const GUARDIAN_FIREBALL_SPEED = 185;
const GUARDIAN_FIREBALL_COOLDOWN = 1450;
const CANNON_SHOT_SPEED = 238;
const CANNON_ACTIVE_RANGE = 720;
const CANNON_SAFE_RADIUS = 84;
const HAMMER_THROW_SPEED_X = 145;
const HAMMER_THROW_SPEED_Y = -430;
const HAMMER_THROW_COOLDOWN = 1350;
const HAMMER_THROW_ACTIVE_RANGE = 660;
const HAMMER_THROWER_HOP_VELOCITY = -255;
const HAMMER_THROWER_HOP_INTERVAL = 1850;
const LAVA_BUBBLE_DEFAULT_INTERVAL = 1950;
const LAVA_BUBBLE_DEFAULT_VELOCITY = -560;
const MULTI_COIN_BLOCK_LIMIT = 8;
const MULTI_COIN_BLOCK_WINDOW = 6500;
const BLOCK_BUMP_SCORE = 100;
const STOMP_SCORE_TABLE = [100, 200, 400, 800, 1000, 2000, 4000, 8000];
const STOMPED_ENEMY_HOLD_MS = 220;
const STOMPED_ENEMY_FADE_MS = 150;
const SHELL_SCORE_TABLE = [200, 400, 800, 1000, 2000, 4000, 8000];
const STAR_SCORE_TABLE = [200, 400, 800, 1000, 2000, 4000, 8000];
const SHELL_SOLID_HIT_COOLDOWN = 140;
const SHELL_WAKE_WARNING_DELAY = 3600;
const SHELL_WAKE_DELAY = 5200;
const SHELL_WAKE_FLASH_MS = 130;

const moveTowards = (current: number, target: number, maxDelta: number): number => {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }

  return current + Math.sign(target - current) * maxDelta;
};

export class GameScene extends Phaser.Scene {
  private readonly hud: HudController;
  private level!: LevelDefinition;
  private levelIndex = 0;
  private carryState?: RunCarryState;
  private controls!: PlatformerControls;
  private touchControls?: TouchControls;
  private player!: Phaser.Physics.Arcade.Sprite;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatforms!: Phaser.Physics.Arcade.Group;
  private balanceLifts!: Phaser.Physics.Arcade.Group;
  private fallingLifts!: Phaser.Physics.Arcade.Group;
  private firebars!: Phaser.Physics.Arcade.Group;
  private vines!: Phaser.Physics.Arcade.StaticGroup;
  private cannonLaunchers!: Phaser.Physics.Arcade.StaticGroup;
  private cannonShots!: Phaser.Physics.Arcade.Group;
  private springboards!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.StaticGroup;
  private powerups!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private guardianFireballs!: Phaser.Physics.Arcade.Group;
  private enemyProjectiles!: Phaser.Physics.Arcade.Group;
  private lavaBubbles!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  private goalZone!: Phaser.GameObjects.Zone;
  private flag!: Phaser.GameObjects.Image;
  private goalHouseX = 0;
  private goalDoorX = 0;
  private fortressSwitch?: Phaser.GameObjects.Image;
  private fortressBridgePieces: Phaser.GameObjects.Image[] = [];
  private balanceLiftPairs: BalanceLiftPair[] = [];
  private solidTiles = new Set<string>();
  private runState!: RunState;
  private autoStart = false;
  private respawnAtCheckpoint = false;
  private isStarted = false;
  private isFinished = false;
  private isPaused = false;
  private isConduitTransitioning = false;
  private isDamageRecovering = false;
  private isPowerTransitioning = false;
  private isLifeLossAnimating = false;
  private checkpointReached = false;
  private isCrouching = false;
  private isClimbingVine = false;
  private isPowered = false;
  private hasSpark = false;
  private coyoteUntil = 0;
  private jumpBufferedUntil = 0;
  private invulnerableUntil = 0;
  private starPowerUntil = 0;
  private nextProjectileAt = 0;
  private nextSkidDustAt = 0;
  private runStartedAt = 0;
  private pausedAt = 0;
  private didTimeWarning = false;
  private stompChain = 0;
  private starChain = 0;
  private wasOnGround = false;
  private previousPlayerVelocityY = 0;
  private forwardCameraScrollX = 0;
  private skyRouteCameraActive = false;
  private bonusBlockFrame = -1;
  private coinFrame = -1;
  private audioContext?: AudioContext;
  private courseMusicEvent?: Phaser.Time.TimerEvent;
  private courseMusicStep = 0;
  private starMusicEvent?: Phaser.Time.TimerEvent;
  private starMusicStep = 0;

  constructor(hud: HudController) {
    super('game');
    this.hud = hud;
  }

  preload(): void {
    this.load.image('generated-backdrop', '/assets/generated/pip-star-sprint-backdrop.png');
    this.load.spritesheet(PET_SHEET_TEXTURE, '/assets/generated/codex-spritesheet-v4.webp', {
      frameWidth: PET_FRAME_WIDTH,
      frameHeight: PET_FRAME_HEIGHT
    });
  }

  init(data: SceneInitData): void {
    this.autoStart = Boolean(data.autoStart);
    this.respawnAtCheckpoint = Boolean(data.respawnAtCheckpoint);
    this.levelIndex = Phaser.Math.Clamp(data.levelIndex ?? 0, 0, LEVELS.length - 1);
    this.level = LEVELS[this.levelIndex];
    this.carryState = data.carry;
  }

  create(): void {
    const carry = this.carryState;
    this.runState = {
      score: carry?.score ?? 0,
      coins: carry?.coins ?? 0,
      lives: carry?.lives ?? 3,
      time: this.level.timeLimit,
      world: this.level.world
    };
    this.isStarted = false;
    this.isFinished = false;
    this.isPaused = false;
    this.isConduitTransitioning = false;
    this.isDamageRecovering = false;
    this.isPowerTransitioning = false;
    this.isLifeLossAnimating = false;
    this.checkpointReached = Boolean(this.respawnAtCheckpoint && this.level.checkpoint);
    this.isCrouching = false;
    this.isClimbingVine = false;
    this.isPowered = carry?.powered ?? false;
    this.hasSpark = carry?.sparked ?? false;
    if (this.hasSpark) {
      this.isPowered = true;
    }
    this.coyoteUntil = 0;
    this.jumpBufferedUntil = 0;
    this.invulnerableUntil = 0;
    this.starPowerUntil = 0;
    this.nextProjectileAt = 0;
    this.nextSkidDustAt = 0;
    this.pausedAt = 0;
    this.didTimeWarning = false;
    this.wasOnGround = false;
    this.previousPlayerVelocityY = 0;
    this.stompChain = 0;
    this.starChain = 0;
    this.forwardCameraScrollX = 0;
    this.skyRouteCameraActive = false;
    this.fortressBridgePieces = [];
    this.fortressSwitch = undefined;
    this.balanceLiftPairs = [];
    this.solidTiles.clear();

    ensureGeneratedTextures(this);
    this.createPlayerAnimations();
    this.controls = createPlatformerControls(this);
    this.touchControls?.destroy();
    this.touchControls = new TouchControls(document, () => this.openShortcuts());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.touchControls?.destroy();
      this.touchControls = undefined;
    });
    this.physics.world.setBounds(0, 0, this.level.width * TILE_SIZE, this.level.height * TILE_SIZE + 260);
    this.cameras.main.setBounds(0, 0, this.level.width * TILE_SIZE, this.level.height * TILE_SIZE);
    this.cameras.main.setBackgroundColor(0x8bd7ff);

    this.createBackground();
    this.createLevel();
    this.createPlayer();
    this.createEnemies();
    this.createGoal();
    this.createCollisions();
    this.updateHud();
    this.hud.setTimeWarning(false);

    this.hud.setPrimaryAction(() => this.startRun());
    this.hud.setShortcutsCloseAction(() => this.closeShortcuts());
    this.registerKeyboardShortcuts();

    if (this.autoStart) {
      this.startRun();
    } else if (this.carryState) {
      this.physics.pause();
      this.hud.showCourseIntro(this.level.world, this.runState.lives, () => this.startRun());
    } else {
      this.physics.pause();
      this.hud.showTitle(() => this.showFirstCourseIntro());
    }
  }

  update(time: number, delta: number): void {
    if (this.hud.isShortcutsOpen()) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.controls.restart)) {
      this.restartRun();
      return;
    }

    if (!this.isStarted || this.isFinished) {
      return;
    }

    if (this.isDamageRecovering || this.isPowerTransitioning || this.isLifeLossAnimating) {
      this.updateHud();
      return;
    }

    if (this.isPaused) {
      this.updateHud();
      return;
    }

    this.updateTimer(time);
    this.updatePlayerInput(time, delta);
    this.updateCheckpoint();
    this.updateMovingPlatforms();
    this.carryPlayerOnMovingPlatforms();
    this.updateBalanceLifts(delta);
    this.updateFallingLifts(time);
    this.updateFirebars(time);
    this.updateCannons(time);
    this.updateEnemies();
    this.updateClassicTileAnimations(time);
    this.updatePowerups(time);
    this.updateMultiCoinBlocks(time);
    this.updateProjectiles(time);
    this.updateGuardianFireballs();
    this.updateCannonShots(time);
    this.updateEnemyProjectiles(time);
    this.updateLavaBubbles(time);
    this.updateStarPower(time);
    this.updateSideScrollingCamera();

    if (this.player.y > this.level.height * TILE_SIZE + 80) {
      this.hurtPlayer('Mind the gap');
    }

    this.updateHud();
  }

  private registerKeyboardShortcuts(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.addEventListener('keydown', this.handleGlobalKeydown, true);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      document.removeEventListener('keydown', this.handleGlobalKeydown, true);
    });
  }

  private readonly handleGlobalKeydown = (event: KeyboardEvent): void => {
    if (event.repeat) {
      return;
    }

    const key = event.key.toLowerCase();

    if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
      event.preventDefault();
      this.toggleShortcuts();
      return;
    }

    if (event.key === 'Escape' && this.hud.isShortcutsOpen()) {
      event.preventDefault();
      this.closeShortcuts();
      return;
    }

    if (this.hud.isShortcutsOpen()) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      if (!this.isStarted) {
        this.hud.activatePrimaryAction();
      } else {
        this.togglePause();
      }
      return;
    }

    if (key === 'p') {
      event.preventDefault();
      this.togglePause();
    }
  };

  private toggleShortcuts(): void {
    if (this.hud.isShortcutsOpen()) {
      this.closeShortcuts();
    } else {
      this.openShortcuts();
    }
  }

  private openShortcuts(): void {
    this.touchControls?.reset();
    this.hud.showShortcuts();

    if (this.canPauseRun() && !this.isPaused) {
      this.beginPauseClock();
      this.pauseWorld();
    }
  }

  private closeShortcuts(): void {
    this.hud.hideShortcuts();

    if (this.canPauseRun() && !this.isPaused && this.pausedAt > 0) {
      this.endPauseClock();
      this.resumeWorld();
    }
  }

  private togglePause(): void {
    if (!this.canPauseRun()) {
      return;
    }

    if (this.isPaused) {
      this.resumePausedRun();
    } else {
      this.pauseRun();
    }
  }

  private pauseRun(): void {
    if (this.isPaused) {
      return;
    }

    this.touchControls?.reset();
    this.isPaused = true;
    this.beginPauseClock();
    this.pauseWorld();
    this.hud.showPaused(() => this.resumePausedRun());
    this.playTone(392, 0.05);
  }

  private resumePausedRun(): void {
    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;
    this.endPauseClock();
    this.hud.hideOverlay();
    this.resumeWorld();
    this.playTone(523.25, 0.05);
  }

  private canPauseRun(): boolean {
    return (
      this.isStarted &&
      !this.isFinished &&
      !this.isConduitTransitioning &&
      !this.isDamageRecovering &&
      !this.isPowerTransitioning &&
      !this.isLifeLossAnimating
    );
  }

  private beginPauseClock(): void {
    if (this.pausedAt === 0) {
      this.pausedAt = this.time.now;
    }
  }

  private endPauseClock(): void {
    if (this.pausedAt === 0) {
      return;
    }

    this.runStartedAt += this.time.now - this.pausedAt;
    this.pausedAt = 0;
  }

  private pauseWorld(): void {
    this.stopGameplayMusic(false);
    this.physics.pause();
    this.tweens.pauseAll();
    this.anims.pauseAll();
  }

  private resumeWorld(): void {
    this.physics.resume();
    this.tweens.resumeAll();
    this.anims.resumeAll();
    this.startGameplayMusic();
  }

  private createBackground(): void {
    const width = this.level.width * TILE_SIZE;
    const height = this.level.height * TILE_SIZE;

    if (this.level.theme === 'underground') {
      this.createUndergroundBackground(width, height);
    } else if (this.level.theme === 'athletic') {
      this.createAthleticBackground(width, height);
    } else if (this.level.theme === 'fortress') {
      this.createFortressBackground(width, height);
    } else {
      this.createOverworldBackground(width, height);
    }

    this.createThemeRegionBackdrops();
  }

  private createOverworldBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, 0x5c94fc).setDepth(-35);
    this.createOverworldCloudLayer(width, height);
    this.createOverworldHillLayer(width, height);
    this.createOverworldBushLayer(width, height);
    this.createOverworldStartCastle(height);
  }

  private createOverworldStartCastle(height: number): void {
    const groundTop = height - TILE_SIZE * 2;
    const spawnX = this.level.spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const x = Math.max(54, spawnX - 60);

    this.add.image(x, groundTop + 6, 'goal-house').setOrigin(0.5, 1).setScale(0.92).setDepth(-31);
  }

  private createOverworldCloudLayer(width: number, height: number): void {
    const clouds = this.add.graphics().setDepth(-34).setScrollFactor(0.24, 1);

    for (let x = -192; x < width + 384; x += 384) {
      const groupIndex = Math.floor((x + 192) / 384);
      const y = 70 + (Math.abs(groupIndex) % 3) * 26;
      this.drawBlockCloud(clouds, x + 96, y, 1);
      this.drawBlockCloud(clouds, x + 266, y + 38, 0.7);
    }

    if (height > 560) {
      this.drawBlockCloud(clouds, width * 0.45, 152, 0.84);
    }
  }

  private createOverworldHillLayer(width: number, height: number): void {
    const groundTop = height - TILE_SIZE * 2;
    const hills = this.add.graphics().setDepth(-33).setScrollFactor(0.5, 1);

    for (let x = -128; x < width + 320; x += 320) {
      const index = Math.floor((x + 128) / 320);
      const hillWidth = index % 2 === 0 ? 176 : 132;
      const hillHeight = index % 2 === 0 ? 112 : 78;
      this.drawSteppedHill(hills, x, groundTop, hillWidth, hillHeight);
    }
  }

  private createOverworldBushLayer(width: number, height: number): void {
    const groundTop = height - TILE_SIZE * 2;
    const bushes = this.add.graphics().setDepth(-32).setScrollFactor(0.74, 1);

    for (let x = -64; x < width + 192; x += 224) {
      const index = Math.floor((x + 64) / 224);
      this.drawBlockBush(bushes, x, groundTop - (index % 2 === 0 ? 18 : 10), index % 3 === 0 ? 1.16 : 0.94);
    }
  }

  private drawBlockCloud(graphics: Phaser.GameObjects.Graphics, x: number, y: number, scale: number): void {
    const unit = Math.round(12 * scale);
    const blocks: Array<[number, number, number, number]> = [
      [1, 1, 7, 2],
      [3, 0, 3, 1],
      [0, 2, 9, 2],
      [2, 4, 5, 1]
    ];

    graphics.fillStyle(0x84dff5, 1);
    this.fillBlockRects(graphics, blocks, x, y + unit, unit);
    graphics.fillStyle(0xffffff, 1);
    this.fillBlockRects(graphics, blocks, x, y, unit);
    graphics.fillStyle(0xd8f8ff, 1);
    this.fillBlockRects(graphics, [[1, 3, 7, 1]], x, y, unit);
    this.drawSceneryEyes(graphics, x, y, unit, 3.1, 5.45, 2.15, 0x26354d);
  }

  private drawSteppedHill(graphics: Phaser.GameObjects.Graphics, x: number, baseY: number, width: number, height: number): void {
    const step = 16;
    const columns = Math.ceil(width / step);
    const center = (columns - 1) / 2;

    for (let column = 0; column < columns; column += 1) {
      const distance = Math.abs(column - center);
      const normalized = 1 - distance / (center + 1);
      const columnHeight = Math.max(step, Math.ceil((height * normalized) / step) * step);
      const columnX = x + column * step;
      const columnY = baseY - columnHeight;

      graphics.fillStyle(0x2fa044, 1).fillRect(columnX, columnY, step, columnHeight);
      graphics.fillStyle(0x63d96b, 1).fillRect(columnX + 2, columnY + 2, step - 4, Math.min(step, columnHeight - 4));

      if (columnHeight > step * 2) {
        graphics.fillStyle(0x1f6f33, 1).fillRect(columnX + 3, baseY - step, step - 6, 4);
      }
    }

    const faceX = Math.round(x + width / 2);
    const faceY = Math.round(baseY - height * 0.42);
    graphics.fillStyle(0x174827, 1).fillRect(faceX - 19, faceY, 5, 12).fillRect(faceX + 14, faceY, 5, 12);
    graphics.fillStyle(0x9cff8b, 0.75).fillRect(faceX - 18, faceY + 1, 2, 3).fillRect(faceX + 15, faceY + 1, 2, 3);
  }

  private drawBlockBush(graphics: Phaser.GameObjects.Graphics, x: number, baseY: number, scale: number): void {
    const unit = Math.round(14 * scale);
    const blocks: Array<[number, number, number, number]> = [
      [0, 1, 6, 2],
      [1, 0, 2, 1],
      [4, 0, 2, 1],
      [2, 2, 4, 1]
    ];
    const topY = baseY - unit * 3;

    graphics.fillStyle(0x267a3b, 1);
    this.fillBlockRects(graphics, blocks, x + unit, baseY - unit * 2, unit);
    graphics.fillStyle(0x4fc35f, 1);
    this.fillBlockRects(graphics, blocks, x, topY, unit);
    graphics.fillStyle(0x8aef7f, 1);
    this.fillBlockRects(graphics, [[1, 1, 1, 1], [4, 1, 1, 1]], x, topY, unit);
    this.drawSceneryEyes(graphics, x, topY, unit, 2.15, 4.35, 1.15, 0x174827);
  }

  private fillBlockRects(
    graphics: Phaser.GameObjects.Graphics,
    blocks: Array<[number, number, number, number]>,
    x: number,
    y: number,
    unit: number
  ): void {
    for (const [blockX, blockY, blockWidth, blockHeight] of blocks) {
      graphics.fillRect(
        Math.round(x + blockX * unit),
        Math.round(y + blockY * unit),
        Math.round(blockWidth * unit),
        Math.round(blockHeight * unit)
      );
    }
  }

  private drawSceneryEyes(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    unit: number,
    leftColumn: number,
    rightColumn: number,
    row: number,
    color: number
  ): void {
    const eyeWidth = Math.max(2, Math.round(unit * 0.32));
    const eyeHeight = Math.max(4, Math.round(unit * 0.74));
    const eyeY = Math.round(y + row * unit);

    graphics.fillStyle(color, 1);
    for (const column of [leftColumn, rightColumn]) {
      const eyeX = Math.round(x + column * unit);
      graphics.fillRect(eyeX, eyeY, eyeWidth, eyeHeight);
      graphics.fillStyle(0xffffff, 0.54).fillRect(eyeX, eyeY, Math.max(1, Math.floor(eyeWidth / 2)), 1);
      graphics.fillStyle(color, 1);
    }
  }

  private createAthleticBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, 0x91dcff).setDepth(-35);
    this.addGeneratedBackdrop(width, height, 0.42, 0.72);

    const skyline = this.add.graphics().setDepth(-28).setScrollFactor(0.32, 1);
    for (let x = -80; x < width + 160; x += 260) {
      const trunkHeight = 122 + ((x / 20) % 3) * 18;
      skyline.fillStyle(0xb9774f, 0.75).fillRect(x + 52, height - trunkHeight, 22, trunkHeight);
      skyline.fillStyle(0x4abf73, 0.78).fillEllipse(x + 63, height - trunkHeight - 6, 132, 42);
      skyline.fillStyle(0x7be08f, 0.7).fillEllipse(x + 96, height - trunkHeight - 16, 74, 30);
    }

    const clouds = this.add.graphics().setDepth(-27).setScrollFactor(0.2, 0.85);
    for (let x = 110; x < width + 220; x += 360) {
      const y = 74 + (x % 4) * 22;
      clouds.fillStyle(0xffffff, 0.9).fillEllipse(x, y, 58, 22);
      clouds.fillEllipse(x + 34, y + 2, 48, 18);
      clouds.fillEllipse(x - 31, y + 4, 38, 15);
    }
  }

  private createUndergroundBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, 0x11162d).setDepth(-35);

    const wall = this.add.graphics().setDepth(-34).setScrollFactor(0.5, 1);
    for (let y = 0; y < height; y += 32) {
      for (let x = -32; x < width + 64; x += 64) {
        const offsetX = y % 64 === 0 ? x : x + 32;
        wall.fillStyle(0x1a2346, 1).fillRect(offsetX, y, 62, 30);
        wall.fillStyle(0x2d3d70, 0.55).fillRect(offsetX + 3, y + 3, 24, 4);
        wall.fillStyle(0x0b1024, 0.9).fillRect(offsetX, y + 29, 62, 3);
      }
    }

    const glow = this.add.graphics().setDepth(-33).setScrollFactor(0.62, 1);
    for (let x = 180; x < width; x += 520) {
      glow.fillStyle(0xf0b94d, 0.16).fillEllipse(x, height - 118, 190, 86);
      glow.fillStyle(0x6f82b4, 0.38).fillRect(x - 64, height - 92, 128, 6);
    }
  }

  private createThemeRegionBackdrops(): void {
    for (const region of this.level.themeRegions ?? []) {
      if (region.theme === 'underground') {
        this.createUndergroundRegionBackdrop(region);
      }
    }
  }

  private createUndergroundRegionBackdrop(region: ThemeRegion): void {
    const x = region.x * TILE_SIZE;
    const y = region.y * TILE_SIZE;
    const width = region.w * TILE_SIZE;
    const height = region.h * TILE_SIZE;
    const right = x + width;
    const bottom = y + height;
    const wall = this.add.graphics().setDepth(-31).setScrollFactor(1, 1);

    wall.fillStyle(0x11162d, 1).fillRect(x, y, width, height);
    for (let rowY = y; rowY < bottom; rowY += 32) {
      const row = Math.floor((rowY - y) / 32);
      const rowHeight = Math.min(30, bottom - rowY);
      for (let brickX = x - (row % 2) * 32; brickX < right; brickX += 64) {
        const drawX = Math.max(x, brickX);
        const drawRight = Math.min(right, brickX + 62);
        const drawWidth = drawRight - drawX;
        if (drawWidth <= 0 || rowHeight <= 0) {
          continue;
        }

        wall.fillStyle(0x1a2346, 1).fillRect(drawX, rowY, drawWidth, rowHeight);
        const highlightWidth = Math.max(0, Math.min(24, drawWidth - 6));
        if (highlightWidth > 0) {
          wall.fillStyle(0x2d3d70, 0.58).fillRect(drawX + 3, rowY + 3, highlightWidth, 4);
        }
        wall.fillStyle(0x0b1024, 0.9).fillRect(drawX, rowY + rowHeight - 1, drawWidth, 2);
      }
    }

    wall.fillStyle(0xf0b94d, 0.12).fillEllipse(x + width * 0.72, bottom - 74, 260, 92);
    wall.fillStyle(0x6f82b4, 0.35).fillRect(x + TILE_SIZE, bottom - 58, width - TILE_SIZE * 2, 5);
  }

  private createFortressBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, 0x181726).setDepth(-35);

    const wall = this.add.graphics().setDepth(-34).setScrollFactor(0.45, 1);
    for (let y = 0; y < height; y += 64) {
      for (let x = -48; x < width + 96; x += 96) {
        wall.fillStyle(0x24253a, 1).fillRect(x, y, 92, 60);
        wall.fillStyle(0x353754, 0.75).fillRect(x + 4, y + 4, 38, 6).fillRect(x + 48, y + 28, 34, 6);
        wall.fillStyle(0x0d1020, 0.9).fillRect(x, y + 58, 92, 3).fillRect(x + 90, y, 3, 60);
      }
    }

    const arches = this.add.graphics().setDepth(-33).setScrollFactor(0.62, 1);
    for (let x = 96; x < width + 160; x += 320) {
      arches.fillStyle(0x0d1020, 0.72).fillEllipse(x, height - 116, 118, 124).fillRect(x - 59, height - 116, 118, 116);
      arches.fillStyle(0xff6b3a, 0.18).fillEllipse(x, height - 58, 86, 28);
      arches.fillStyle(0xffd166, 0.28).fillRect(x - 38, height - 58, 76, 5);
    }
  }

  private addGeneratedBackdrop(width: number, height: number, scrollX: number, alpha: number): void {
    const backdrop = this.add.tileSprite(0, 0, width, height, 'generated-backdrop');
    const source = this.textures.get('generated-backdrop').getSourceImage() as HTMLImageElement;
    const scale = height / source.height;
    backdrop.setOrigin(0, 0);
    backdrop.setTileScale(scale, scale);
    backdrop.setAlpha(alpha);
    backdrop.setDepth(-30);
    backdrop.setScrollFactor(scrollX, 1);
  }

  private createLevel(): void {
    this.solids = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
    this.balanceLifts = this.physics.add.group({ allowGravity: false, immovable: true });
    this.fallingLifts = this.physics.add.group({ allowGravity: false, immovable: true });
    this.firebars = this.physics.add.group({ allowGravity: false, immovable: true });
    this.vines = this.physics.add.staticGroup();
    this.cannonLaunchers = this.physics.add.staticGroup();
    this.cannonShots = this.physics.add.group({ allowGravity: false });
    this.springboards = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.powerups = this.physics.add.group({ allowGravity: true });
    this.projectiles = this.physics.add.group({ allowGravity: true });
    this.guardianFireballs = this.physics.add.group({ allowGravity: false });
    this.enemyProjectiles = this.physics.add.group({ allowGravity: true });
    this.lavaBubbles = this.physics.add.group({ allowGravity: true });
    this.hazards = this.physics.add.staticGroup();

    for (const rect of this.level.solids) {
      for (let dx = 0; dx < rect.w; dx += 1) {
        for (let dy = 0; dy < rect.h; dy += 1) {
          this.createSolidTile(rect.x + dx, rect.y + dy, rect.kind, rect.kind !== 'ground' || dy === 0);
        }
      }
    }

    for (const block of this.level.hiddenBlocks) {
      this.createSolidTile(block.x, block.y, 'hiddenBonus');
    }

    for (const platform of this.level.movingPlatforms) {
      this.createMovingPlatform(platform);
    }

    for (const lift of this.level.balanceLifts) {
      this.createBalanceLift(lift);
    }

    for (const lift of this.level.fallingLifts) {
      this.createFallingLift(lift);
    }

    for (const coin of this.level.coins) {
      if (this.isCoinInsideConduitClearance(coin)) {
        continue;
      }

      const sprite = this.coins.create(coin.x * TILE_SIZE + TILE_SIZE / 2, coin.y * TILE_SIZE + TILE_SIZE / 2, 'coin');
      sprite.setData('baseY', sprite.y);
      sprite.refreshBody();
    }

    this.coins.getChildren().forEach((coin, index) => {
      this.tweens.add({
        targets: coin,
        y: '+=4',
        duration: 700,
        ease: 'Sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: index * 35
      });
    });

    if (this.level.theme === 'fortress') {
      for (const hazard of this.level.hazards) {
        for (let dx = 0; dx < hazard.w; dx += 1) {
          const lava = this.hazards.create(
            (hazard.x + dx) * TILE_SIZE + TILE_SIZE / 2,
            hazard.y * TILE_SIZE + TILE_SIZE / 2,
            'lava'
          );
          lava.refreshBody();
        }
      }
    }

    for (const firebar of this.level.firebars) {
      this.createFirebar(firebar);
    }

    for (const bubble of this.level.lavaBubbles) {
      this.createLavaBubble(bubble);
    }

    for (const cannon of this.level.cannons) {
      this.createCannonLauncher(cannon);
    }

    for (const springboard of this.level.springboards) {
      this.createSpringboard(springboard);
    }

    const warpLinks = this.level.conduitLinks.filter((link) => link.targetLevelIndex !== undefined);
    if (warpLinks.length > 0) {
      if (warpLinks.length > 1) {
        this.createWarpZoneTitle(warpLinks);
      }

      for (const link of warpLinks) {
        this.createWarpLabel(link);
      }
    }
  }

  private isCoinInsideConduitClearance(coin: Point): boolean {
    return this.level.solids.some(
      (rect) =>
        (rect.kind === 'conduitTop' || rect.kind === 'conduitBody') &&
        coin.x >= rect.x &&
        coin.x < rect.x + rect.w &&
        coin.y >= rect.y - 1 &&
        coin.y < rect.y + rect.h
    );
  }

  private createSpringboard(point: Point): void {
    const springboard = this.springboards.create(
      point.x * TILE_SIZE + TILE_SIZE / 2,
      point.y * TILE_SIZE + TILE_SIZE / 2 + 2,
      'springboard'
    ) as SpringboardSprite;
    const body = springboard.body;

    springboard.setDepth(2);
    springboard.setData('readyAt', 0);
    body.setSize(24, 22);
    body.setOffset(4, 5);
    springboard.refreshBody();
  }

  private createWarpLabel(link: ConduitLink): void {
    const destination = LEVELS[link.targetLevelIndex ?? this.levelIndex]?.world ?? '??';
    const x = (link.entry.x + 1) * TILE_SIZE;
    const y = link.entry.y * TILE_SIZE - 30;
    this.add
      .text(x, y, destination, {
        color: '#fff4a3',
        fontFamily: '"Arial Black", Impact, sans-serif',
        fontSize: '15px',
        stroke: '#111927',
        strokeThickness: 4
      })
      .setOrigin(0.5, 1)
      .setDepth(3);
  }

  private createWarpZoneTitle(links: ConduitLink[]): void {
    const left = Math.min(...links.map((link) => link.entry.x));
    const right = Math.max(...links.map((link) => link.entry.x + 2));
    const top = Math.min(...links.map((link) => link.entry.y));
    const x = ((left + right) / 2) * TILE_SIZE;
    const y = top * TILE_SIZE - 78;

    this.add
      .text(x, y, 'WELCOME TO WARP ZONE!', {
        color: '#ffffff',
        fontFamily: '"Arial Black", Impact, sans-serif',
        fontSize: '14px',
        stroke: '#111927',
        strokeThickness: 4
      })
      .setOrigin(0.5, 1)
      .setDepth(3);
  }

  private createCannonLauncher(config: CannonLauncher): void {
    const x = config.x * TILE_SIZE + TILE_SIZE / 2;
    const y = config.y * TILE_SIZE + TILE_SIZE / 2;
    const launcher = this.cannonLaunchers.create(x, y, 'cannon-launcher') as CannonLauncherSprite;
    const body = launcher.body;

    launcher.setDepth(2);
    launcher.setData('direction', config.direction ?? -1);
    launcher.setData('interval', config.interval ?? 1800);
    launcher.setData('nextShotAt', this.time.now + (config.offset ?? 350));
    body.setSize(28, 30);
    body.setOffset(2, 2);
    launcher.refreshBody();
  }

  private createMovingPlatform(config: MovingPlatform): void {
    const originX = config.x * TILE_SIZE + MOVING_LIFT_WIDTH / 2;
    const originY = config.y * TILE_SIZE + MOVING_LIFT_HEIGHT / 2;
    const travelX = config.axis === 'horizontal' ? config.distance * TILE_SIZE : 0;
    const travelY = config.axis === 'vertical' ? config.distance * TILE_SIZE : 0;
    const startsAtFarEnd = Boolean(config.phase);
    const x = originX + (startsAtFarEnd ? travelX : 0);
    const y = originY + (startsAtFarEnd ? travelY : 0);
    const platform = this.movingPlatforms.create(x, y, 'moving-lift') as MovingPlatformSprite;
    const body = platform.body;
    body.allowGravity = false;
    body.immovable = true;
    body.setSize(MOVING_LIFT_WIDTH, MOVING_LIFT_HEIGHT);
    body.setOffset(0, 0);
    platform.setDepth(1);
    platform.setData('axis', config.axis);
    platform.setData('minX', originX);
    platform.setData('maxX', originX + travelX);
    platform.setData('minY', originY);
    platform.setData('maxY', originY + travelY);
    platform.setData('speed', config.speed);
    platform.setData('direction', startsAtFarEnd ? -1 : 1);
    platform.setData('previousX', x);
    platform.setData('previousY', y);
    platform.setVelocity(
      config.axis === 'horizontal' ? config.speed * (config.phase ? -1 : 1) : 0,
      config.axis === 'vertical' ? config.speed * (config.phase ? -1 : 1) : 0
    );
  }

  private createBalanceLift(config: BalanceLift): void {
    const left = this.createBalanceLiftPlatform(config.left);
    const right = this.createBalanceLiftPlatform(config.right);
    const travel = Math.max(1, config.distance) * TILE_SIZE;
    const rope = this.add.graphics().setDepth(0);
    const pair: BalanceLiftPair = {
      left,
      right,
      leftHomeY: left.y,
      rightHomeY: right.y,
      leftMinY: left.y - travel,
      leftMaxY: left.y + travel,
      rightMinY: right.y - travel,
      rightMaxY: right.y + travel,
      speed: config.speed ?? BALANCE_LIFT_DEFAULT_SPEED,
      rope
    };

    this.balanceLiftPairs.push(pair);
    this.drawBalanceLiftRope(pair);
  }

  private createBalanceLiftPlatform(point: Point): BalanceLiftSprite {
    const x = point.x * TILE_SIZE + BALANCE_LIFT_WIDTH / 2;
    const y = point.y * TILE_SIZE + BALANCE_LIFT_HEIGHT / 2;
    const platform = this.balanceLifts.create(x, y, 'balance-lift') as BalanceLiftSprite;
    const body = platform.body;

    body.allowGravity = false;
    body.immovable = true;
    body.setSize(BALANCE_LIFT_WIDTH, BALANCE_LIFT_HEIGHT);
    body.setOffset(0, 0);
    platform.setDepth(1);
    platform.setData('previousX', x);
    platform.setData('previousY', y);

    return platform;
  }

  private createFallingLift(config: FallingLift): void {
    const x = config.x * TILE_SIZE + FALLING_LIFT_WIDTH / 2;
    const y = config.y * TILE_SIZE + FALLING_LIFT_HEIGHT / 2;
    const platform = this.fallingLifts.create(x, y, 'falling-lift') as FallingLiftSprite;
    const body = platform.body;

    body.allowGravity = false;
    body.immovable = true;
    body.setSize(FALLING_LIFT_WIDTH, FALLING_LIFT_HEIGHT);
    body.setOffset(0, 0);
    platform.setDepth(1);
    platform.setData('homeX', x);
    platform.setData('homeY', y);
    platform.setData('previousX', x);
    platform.setData('previousY', y);
    platform.setData('delay', config.delay ?? FALLING_LIFT_DEFAULT_DELAY);
    platform.setData('speed', config.speed ?? FALLING_LIFT_DEFAULT_SPEED);
    platform.setData('triggeredAt', 0);
    platform.setData('falling', false);
  }

  private createFirebar(config: Firebar): void {
    const centerX = config.x * TILE_SIZE + TILE_SIZE / 2;
    const centerY = config.y * TILE_SIZE + TILE_SIZE / 2;
    this.add.image(centerX, centerY, 'firebar-hub').setDepth(3);

    for (let index = 0; index < config.length; index += 1) {
      const flame = this.firebars.create(centerX, centerY, 'firebar-flame') as FirebarSprite;
      const body = flame.body;
      flame.setDepth(4);
      flame.setData('centerX', centerX);
      flame.setData('centerY', centerY);
      flame.setData('radius', (index + 1) * FIREBAR_SEGMENT_SPACING);
      flame.setData('speed', config.speed);
      flame.setData('phase', config.phase ?? 0);
      body.allowGravity = false;
      body.immovable = true;
      body.setCircle(7, 2, 2);
      this.positionFirebarSegment(flame, this.time.now);
    }
  }

  private createLavaBubble(config: LavaBubble): void {
    const x = config.x * TILE_SIZE + TILE_SIZE / 2;
    const sourceY = config.y * TILE_SIZE + TILE_SIZE / 2;
    const bubble = this.lavaBubbles.create(x, sourceY, 'lava-bubble') as LavaBubbleSprite;
    const body = bubble.body;

    bubble.setDepth(4);
    bubble.setAlpha(0);
    bubble.setData('sourceX', x);
    bubble.setData('sourceY', sourceY);
    bubble.setData('interval', config.interval ?? LAVA_BUBBLE_DEFAULT_INTERVAL);
    bubble.setData('velocity', config.velocity ?? LAVA_BUBBLE_DEFAULT_VELOCITY);
    bubble.setData('nextLaunchAt', this.time.now + (config.offset ?? 0));
    body.setCircle(10, 2, 4);
    bubble.disableBody(true, true);
  }

  private createSolidTile(x: number, y: number, kind: SolidKind, collidable = true): void {
    const theme = this.getTileTheme(x, y);
    const texture =
      kind === 'ground' && !collidable
        ? this.getThemedTexture('tile-ground-fill', theme)
        : this.getTileTexture(kind, theme, x, y);
    const tile = this.solids.create(x * TILE_SIZE, y * TILE_SIZE, texture) as SolidSprite;
    tile.setOrigin(0, 0);
    tile.setData('kind', kind);
    tile.setData('tileX', x);
    tile.setData('tileY', y);
    tile.setData('theme', theme);
    tile.setData('homeY', y * TILE_SIZE);
    if (kind === 'hiddenBonus') {
      tile.setAlpha(0);
    }
    tile.refreshBody();
    if (!collidable) {
      tile.setData('decorative', true);
      tile.body.enable = false;
    } else if (kind !== 'hiddenBonus') {
      this.solidTiles.add(`${x},${y}`);
    } else {
      tile.body.checkCollision.up = false;
      tile.body.checkCollision.left = false;
      tile.body.checkCollision.right = false;
    }
  }

  private getTileTexture(kind: SolidKind, theme = this.level.theme, x?: number, y?: number): string {
    if (kind === 'ground') {
      return this.getThemedTexture('tile-ground', theme);
    }

    if (kind === 'platform') {
      return this.getThemedTexture('tile-platform', theme);
    }

    if (kind === 'cloud') {
      return 'tile-cloud';
    }

    if (kind === 'brick') {
      return this.getThemedTexture('tile-brick', theme);
    }

    if (kind === 'bonus' || kind === 'hiddenBonus') {
      return BONUS_BLOCK_FRAMES[0];
    }

    return this.getConduitTileTexture(kind, x, y);
  }

  private getConduitTileTexture(kind: SolidKind, x?: number, y?: number): string {
    const fallback = kind === 'conduitTop' ? 'tile-conduit-top' : 'tile-conduit-body';
    if (x === undefined || y === undefined || (kind !== 'conduitTop' && kind !== 'conduitBody')) {
      return fallback;
    }

    const conduitRect = this.level.solids.find(
      (rect) => rect.kind === kind && x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h
    );
    if (!conduitRect || conduitRect.w <= 1) {
      return fallback;
    }

    if (x === conduitRect.x) {
      return kind === 'conduitTop' ? 'tile-conduit-top-left' : 'tile-conduit-body-left';
    }

    if (x === conduitRect.x + conduitRect.w - 1) {
      return kind === 'conduitTop' ? 'tile-conduit-top-right' : 'tile-conduit-body-right';
    }

    return fallback;
  }

  private getTileTheme(x: number, y: number): LevelTheme {
    const region = (this.level.themeRegions ?? []).find(
      (candidate) =>
        x >= candidate.x &&
        x < candidate.x + candidate.w &&
        y >= candidate.y &&
        y < candidate.y + candidate.h
    );

    return region?.theme ?? this.level.theme;
  }

  private getTileThemeForTile(tile: SolidSprite): LevelTheme {
    return (tile.getData('theme') as LevelTheme | undefined) ?? this.level.theme;
  }

  private getThemedTexture(base: string, theme: LevelTheme): string {
    if (theme === 'underground') {
      return `${base}-underground`;
    }

    const themedKey = `${base}-${theme}`;
    if (this.textures.exists(themedKey)) {
      return themedKey;
    }

    return base;
  }

  private createPlayer(): void {
    const spawn = this.getRespawnPoint();
    this.player = this.physics.add.sprite(
      spawn.x * TILE_SIZE + TILE_SIZE / 2,
      spawn.y * TILE_SIZE,
      PET_SHEET_TEXTURE,
      0
    );
    this.player.setCollideWorldBounds(false);
    this.player.setDragX(0);
    this.player.setMaxVelocity(RUN_SPEED + 24, PLAYER_MAX_FALL_SPEED);
    this.player.setScale(PET_SCALE);
    this.player.play('pet-idle');
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.applyPlayerPowerState(false, this.isPowered, false);
    this.snapCameraToPlayer();
  }

  private createPlayerAnimations(): void {
    const make = (key: string, start: number, end: number, frameRate: number): void => {
      if (this.anims.exists(key)) {
        return;
      }

      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(PET_SHEET_TEXTURE, { start, end }),
        frameRate,
        repeat: -1
      });
    };

    make('pet-idle', 0, 5, 5);
    make('pet-run-right', 8, 15, 10);
    make('pet-run-left', 16, 23, 10);
    make('pet-failed', 40, 47, 6);
  }

  private createEnemies(): void {
    this.enemies = this.physics.add.group({ allowGravity: true });

    for (const enemy of this.level.enemies) {
      const kind: EnemyKind = enemy.kind ?? 'wobbler';
      const texture =
        kind === 'pipePlant'
          ? 'enemy-pipe-plant'
          : kind === 'guardian'
            ? 'enemy-guardian'
            : kind === 'shellback'
              ? 'enemy-shellback'
              : kind === 'wingShellback'
                ? 'enemy-wing-shellback'
                : kind === 'hammerThrower'
                  ? 'enemy-hammer-thrower'
                  : 'enemy';
      const spriteX = kind === 'pipePlant' ? enemy.x * TILE_SIZE + TILE_SIZE : enemy.x * TILE_SIZE + 16;
      const spriteY = kind === 'pipePlant' ? enemy.y * TILE_SIZE + 42 : enemy.y * TILE_SIZE;
      const sprite = this.enemies.create(spriteX, spriteY, texture) as Phaser.Physics.Arcade.Sprite;
      const startsStationary = kind === 'guardian' || kind === 'hammerThrower';
      sprite.setVelocityX(startsStationary ? 0 : -WALKING_ENEMY_SPEED);
      sprite.setBounceX(startsStationary ? 0 : 1);
      sprite.setData('direction', kind === 'guardian' ? 0 : -1);
      sprite.setData('kind', kind);
      sprite.setData('mode', 'walking' satisfies EnemyMode);
      if (kind === 'wingShellback') {
        sprite.setData('nextHopAt', this.time.now + 280 + ((enemy.x * 137 + enemy.y * 71) % 520));
      }
      if (kind === 'hammerThrower') {
        sprite.setData('nextThrowAt', this.time.now + 520 + ((enemy.x * 151 + enemy.y * 61) % 700));
        sprite.setData('nextHopAt', this.time.now + 900 + ((enemy.x * 89 + enemy.y * 47) % 700));
        sprite.setDepth(2);
      }
      if (kind === 'guardian') {
        sprite.setData('nextShotAt', this.time.now + 900);
        sprite.setData('hp', 3);
        sprite.setDepth(3);
      }
      if (kind === 'pipePlant') {
        const pipeTopY = enemy.y * TILE_SIZE;
        sprite.setData('pipeTopY', pipeTopY);
        sprite.setData('hiddenY', pipeTopY + 42);
        sprite.setData('emergedY', pipeTopY - 12);
        sprite.setData('plantState', 'hidden' satisfies PipePlantState);
        sprite.setData('plantStateStartedAt', this.time.now);
        sprite.setData('plantNextAt', this.time.now + PIPE_PLANT_HIDDEN_DURATION + ((enemy.x * 193 + enemy.y * 97) % 900));
        sprite.setAlpha(0);
      }
      this.configureEnemyBody(sprite, 'walking');
      if (kind !== 'pipePlant' && this.shouldEnemyStartSleeping(sprite)) {
        this.sleepEnemyUntilCameraNear(sprite);
      }
    }
  }

  private configureEnemyBody(enemy: Phaser.Physics.Arcade.Sprite, mode: EnemyMode): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const kind = this.getEnemyKind(enemy);

    if (kind === 'pipePlant') {
      body.allowGravity = false;
      body.immovable = true;
      body.setSize(22, 30);
      body.setOffset(4, 5);
      enemy.setMaxVelocity(0, 0);
      this.setPipePlantDangerous(enemy, false);
      return;
    }

    if (kind === 'guardian') {
      body.allowGravity = true;
      body.immovable = true;
      body.setSize(42, 36);
      body.setOffset(7, 14);
      enemy.setMaxVelocity(0, 760);
      return;
    }

    if (kind === 'shellback' && mode !== 'walking') {
      body.setSize(26, 16);
      body.setOffset(2, 3);
      enemy.setMaxVelocity(SHELL_SLIDE_SPEED, 760);
      return;
    }

    if (kind === 'wingShellback') {
      body.setSize(27, 24);
      body.setOffset(6, 5);
      enemy.setMaxVelocity(100, 760);
      return;
    }

    if (kind === 'hammerThrower') {
      body.setSize(24, 27);
      body.setOffset(4, 6);
      enemy.setMaxVelocity(90, 760);
      return;
    }

    body.setSize(kind === 'shellback' ? 25 : 24, kind === 'shellback' ? 22 : 18);
    body.setOffset(kind === 'shellback' ? 2 : 2, kind === 'shellback' ? 5 : 6);
    enemy.setMaxVelocity(kind === 'shellback' ? 96 : 90, 760);
  }

  private shouldEnemyStartSleeping(enemy: Phaser.Physics.Arcade.Sprite): boolean {
    const camera = this.cameras.main;
    return enemy.x > camera.scrollX + camera.width + ENEMY_ACTIVATION_MARGIN;
  }

  private sleepEnemyUntilCameraNear(enemy: Phaser.Physics.Arcade.Sprite): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    enemy.setData('sleeping', true);
    enemy.setVisible(false);
    enemy.setVelocity(0, 0);
    body.enable = false;
  }

  private tryWakeSleepingEnemy(enemy: Phaser.Physics.Arcade.Sprite, kind: EnemyKind): boolean {
    if (!enemy.getData('sleeping')) {
      return true;
    }

    const camera = this.cameras.main;
    if (enemy.x > camera.scrollX + camera.width + ENEMY_ACTIVATION_MARGIN) {
      return false;
    }

    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const startsStationary = kind === 'guardian' || kind === 'hammerThrower';
    enemy.setData('sleeping', false);
    enemy.setVisible(true);
    body.enable = true;
    enemy.setVelocityX(startsStationary ? 0 : -WALKING_ENEMY_SPEED);
    enemy.setData('direction', startsStationary ? Number(enemy.getData('direction')) || 0 : -1);

    if (kind === 'wingShellback') {
      enemy.setData('nextHopAt', this.time.now + 280);
    } else if (kind === 'hammerThrower') {
      enemy.setData('nextThrowAt', this.time.now + 520);
      enemy.setData('nextHopAt', this.time.now + 900);
    } else if (kind === 'guardian') {
      enemy.setData('nextShotAt', this.time.now + 900);
    }

    return true;
  }

  private createGoal(): void {
    if (this.isFortressFinale()) {
      this.createFortressGoal();
      return;
    }

    if (this.isPipeExitLevel()) {
      this.createPipeExitGoal();
      return;
    }

    const poleX = this.level.goal.x * TILE_SIZE;
    const baseY = (this.level.height - 2) * TILE_SIZE;
    const flagY = this.level.goal.y * TILE_SIZE;
    const poleTopY = flagY - 10;
    const poleHeight = Math.max(TILE_SIZE, baseY - poleTopY);
    const poleCenterY = poleTopY + poleHeight / 2;
    const houseX = Math.min(this.level.width * TILE_SIZE - 84, poleX + 124);

    this.goalHouseX = houseX;
    this.goalDoorX = houseX;

    this.add.image(houseX, baseY + 6, 'goal-house').setOrigin(0.5, 1).setDepth(-2);
    this.add.rectangle(poleX, poleCenterY, 8, poleHeight, 0x111927).setOrigin(0.5, 0.5).setDepth(1);
    this.add.rectangle(poleX, poleCenterY, 4, poleHeight, 0xf8fbff).setOrigin(0.5, 0.5).setDepth(2);
    this.add.rectangle(poleX - 1, poleCenterY, 1, poleHeight, 0xcfd7e6).setOrigin(0.5, 0.5).setDepth(3);
    this.add.image(poleX, poleTopY, 'flagpole-cap').setDepth(4);
    this.flag = this.add.image(poleX + 18, flagY, 'flag').setOrigin(0, 0.15).setDepth(2);
    this.add.rectangle(poleX, baseY + 8, 58, 14, 0x111927).setOrigin(0.5, 0.5).setDepth(1);
    this.add.rectangle(poleX, baseY + 5, 50, 8, 0x6d4228).setOrigin(0.5, 0.5).setDepth(2);

    this.goalZone = this.add.zone(poleX - 20, poleTopY - 16, 76, poleHeight + 36).setOrigin(0, 0);
    this.physics.add.existing(this.goalZone, true);
  }

  private isPipeExitLevel(): boolean {
    return this.level.theme === 'underground';
  }

  private createPipeExitGoal(): void {
    const pipeX = this.level.goal.x * TILE_SIZE;
    const pipeTopY = this.level.goal.y * TILE_SIZE;
    const pipeCenterX = pipeX + TILE_SIZE;

    this.goalHouseX = pipeCenterX;
    this.goalDoorX = pipeCenterX;

    this.goalZone = this.add.zone(pipeX - 20, pipeTopY - 92, 104, 124).setOrigin(0, 0);
    this.physics.add.existing(this.goalZone, true);
  }

  private isFortressFinale(): boolean {
    return this.level.theme === 'fortress' && this.levelIndex === LEVELS.length - 1;
  }

  private createFortressGoal(): void {
    const switchX = this.level.goal.x * TILE_SIZE + TILE_SIZE / 2;
    const baseY = (this.level.height - 2) * TILE_SIZE;

    for (let index = 0; index < 7; index += 1) {
      const bridgePiece = this.add.image(switchX - 172 + index * 24, baseY + 2, 'fortress-bridge').setDepth(2);
      this.fortressBridgePieces.push(bridgePiece);
    }

    this.add.image(switchX + 82, baseY + 6, 'fortress-gate').setOrigin(0.5, 1).setDepth(-1);
    this.fortressSwitch = this.add.image(switchX, baseY - 8, 'gate-switch').setOrigin(0.5, 1).setDepth(3);
    this.goalHouseX = switchX + 82;
    this.goalDoorX = switchX + 82;

    this.goalZone = this.add.zone(switchX - 22, baseY - 48, 64, 62).setOrigin(0, 0);
    this.physics.add.existing(this.goalZone, true);
  }

  private createCollisions(): void {
    this.physics.add.collider(this.player, this.solids, (_player, tile) => {
      this.handleSolidCollision(tile as SolidSprite);
    });
    this.physics.add.collider(this.player, this.movingPlatforms);
    this.physics.add.collider(this.player, this.balanceLifts);
    this.physics.add.collider(this.player, this.fallingLifts);
    this.physics.add.collider(this.player, this.cannonLaunchers);
    this.physics.add.collider(this.player, this.springboards, (_player, springboard) => {
      this.handleSpringboardCollision(springboard as SpringboardSprite);
    });
    this.physics.add.collider(
      this.enemies,
      this.solids,
      (enemy, tile) => {
        this.handleEnemySolidCollision(enemy as Phaser.Physics.Arcade.Sprite, tile as SolidSprite);
      },
      (enemy) => this.getEnemyKind(enemy as Phaser.Physics.Arcade.Sprite) !== 'pipePlant'
    );
    this.physics.add.collider(this.enemies, this.movingPlatforms);
    this.physics.add.collider(this.enemies, this.balanceLifts);
    this.physics.add.collider(this.enemies, this.fallingLifts);
    this.physics.add.collider(this.enemies, this.cannonLaunchers);
    this.physics.add.collider(this.enemies, this.enemies, (enemyA, enemyB) => {
      this.handleEnemyEnemyCollision(enemyA as Phaser.Physics.Arcade.Sprite, enemyB as Phaser.Physics.Arcade.Sprite);
    });
    this.physics.add.collider(this.powerups, this.solids, (_powerup, tile) => {
      this.handlePowerupSolidCollision(_powerup as Phaser.Physics.Arcade.Sprite, tile as SolidSprite);
    });
    this.physics.add.collider(this.powerups, this.movingPlatforms);
    this.physics.add.collider(this.powerups, this.balanceLifts);
    this.physics.add.collider(this.powerups, this.fallingLifts);
    this.physics.add.collider(this.powerups, this.cannonLaunchers);
    this.physics.add.collider(this.projectiles, this.solids, (projectile, tile) => {
      this.handleProjectileSolidCollision(projectile as Phaser.Physics.Arcade.Sprite, tile as SolidSprite);
    });
    this.physics.add.collider(this.enemyProjectiles, this.solids, (projectile) => {
      this.destroyEnemyProjectile(projectile as EnemyProjectileSprite);
    });
    this.physics.add.collider(this.guardianFireballs, this.solids, (fireball) => {
      (fireball as Phaser.Physics.Arcade.Sprite).destroy();
    });
    this.physics.add.overlap(this.player, this.coins, (_player, coin) => this.collectCoin(coin as Phaser.Physics.Arcade.Image));
    this.physics.add.overlap(this.player, this.powerups, (_player, powerup) => {
      this.collectPowerup(powerup as Phaser.Physics.Arcade.Sprite);
    });
    this.physics.add.overlap(this.projectiles, this.enemies, (projectile, enemy) => {
      this.hitEnemyWithProjectile(projectile as Phaser.Physics.Arcade.Sprite, enemy as Phaser.Physics.Arcade.Sprite);
    });
    this.physics.add.overlap(this.projectiles, this.cannonShots, (projectile, shot) => {
      this.hitCannonShotWithProjectile(projectile as Phaser.Physics.Arcade.Sprite, shot as CannonShotSprite);
    });
    this.physics.add.overlap(this.projectiles, this.enemyProjectiles, (projectile, enemyProjectile) => {
      this.hitEnemyProjectileWithSpark(
        projectile as Phaser.Physics.Arcade.Sprite,
        enemyProjectile as EnemyProjectileSprite
      );
    });
    this.physics.add.overlap(this.player, this.hazards, () => this.hurtPlayer('Ouch'));
    this.physics.add.overlap(this.player, this.firebars, () => this.hurtPlayer('Flame'));
    this.physics.add.overlap(this.player, this.lavaBubbles, (_player, bubble) => {
      this.handleLavaBubbleCollision(bubble as LavaBubbleSprite);
    });
    this.physics.add.overlap(this.player, this.guardianFireballs, (_player, fireball) => {
      (fireball as Phaser.Physics.Arcade.Sprite).destroy();
      this.hurtPlayer('Fire');
    });
    this.physics.add.overlap(this.player, this.enemyProjectiles, (_player, projectile) => {
      this.handleEnemyProjectileCollision(projectile as EnemyProjectileSprite);
    });
    this.physics.add.collider(this.player, this.cannonShots, (_player, shot) => {
      this.handleCannonShotCollision(shot as CannonShotSprite);
    });
    this.physics.add.collider(this.player, this.enemies, (_player, enemy) => {
      this.handleEnemyCollision(enemy as Phaser.Physics.Arcade.Sprite);
    });
    this.physics.add.overlap(this.player, this.goalZone, () => this.finishLevel());
  }

  private showFirstCourseIntro(): void {
    this.hud.showCourseIntro(this.level.world, this.runState.lives, () => this.startRun());
  }

  private startRun(): void {
    if (this.isStarted) {
      return;
    }

    this.touchControls?.reset();
    this.ensureAudioContext();
    this.isStarted = true;
    this.isFinished = false;
    this.isPaused = false;
    this.runStartedAt = this.time.now;
    this.pausedAt = 0;
    this.resumeWorld();
    this.hud.hideOverlay();
    this.playTone(523.25, 0.05);
    this.playTone(659.25, 0.08, 0.07);
  }

  private restartRun(): void {
    this.scene.restart({ autoStart: true, levelIndex: 0 });
  }

  private updateTimer(time: number): void {
    const elapsedTicks = Math.floor((time - this.runStartedAt) / COURSE_TIMER_TICK_MS);
    this.runState.time = Math.max(0, this.level.timeLimit - elapsedTicks);

    if (!this.didTimeWarning && this.runState.time > 0 && this.runState.time <= TIME_WARNING_THRESHOLD) {
      this.triggerTimeWarning();
    }

    if (this.runState.time === 0) {
      this.hurtPlayer('Time');
    }
  }

  private updateCheckpoint(): void {
    const checkpoint = this.level.checkpoint;
    if (this.checkpointReached || !checkpoint) {
      return;
    }

    const checkpointX = checkpoint.x * TILE_SIZE + TILE_SIZE / 2;
    if (this.player.x < checkpointX) {
      return;
    }

    this.checkpointReached = true;
  }

  private getRespawnPoint(): Point {
    return this.checkpointReached && this.level.checkpoint ? this.level.checkpoint : this.level.spawn;
  }

  private triggerTimeWarning(): void {
    this.didTimeWarning = true;
    this.hud.setTimeWarning(true);
    this.hud.flash('Hurry!');
    this.cameras.main.flash(120, 255, 248, 180);
    this.stopGameplayMusic(false);
    this.playTone(987.77, 0.075);
    this.playTone(659.25, 0.075, 0.08);
    this.playTone(987.77, 0.095, 0.16);
    this.time.delayedCall(300, () => this.startGameplayMusic());
  }

  private updatePlayerInput(time: number, delta: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.isConduitTransitioning || this.isDamageRecovering) {
      this.releaseVine(body);
      this.player.setVelocity(0, 0);
      body.setGravityY(0);
      return;
    }

    const touch = this.touchControls?.snapshot();
    const leftDown = this.controls.cursors.left.isDown || this.controls.left.isDown || Boolean(touch?.leftDown);
    const rightDown = this.controls.cursors.right.isDown || this.controls.right.isDown || Boolean(touch?.rightDown);
    const upDown = this.controls.cursors.up.isDown || this.controls.jump.isDown || Boolean(touch?.upDown);
    const spaceDown = this.controls.jumpAlt.isDown || Boolean(touch?.jumpDown);
    const jumpDown = upDown || spaceDown;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.controls.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.controls.jump) ||
      Phaser.Input.Keyboard.JustDown(this.controls.jumpAlt) ||
      Boolean(touch?.jumpPressed);
    const spacePressed = Phaser.Input.Keyboard.JustDown(this.controls.jumpAlt) || Boolean(touch?.jumpPressed);
    const downDown = this.controls.cursors.down.isDown || this.controls.down.isDown || Boolean(touch?.downDown);
    const downPressed =
      Phaser.Input.Keyboard.JustDown(this.controls.cursors.down) ||
      Phaser.Input.Keyboard.JustDown(this.controls.down) ||
      Boolean(touch?.downPressed);
    const runPressed =
      Phaser.Input.Keyboard.JustDown(this.controls.run) ||
      (this.controls.cursors.shift ? Phaser.Input.Keyboard.JustDown(this.controls.cursors.shift) : false) ||
      Boolean(touch?.runPressed);
    const attackPressed =
      Phaser.Input.Keyboard.JustDown(this.controls.attack) ||
      Phaser.Input.Keyboard.JustDown(this.controls.attackAlt) ||
      Boolean(touch?.attackPressed) ||
      runPressed;
    const runDown = this.controls.run.isDown || Boolean(this.controls.cursors.shift?.isDown) || Boolean(touch?.runDown);
    const direction = Number(rightDown) - Number(leftDown);
    const onGround = body.blocked.down || body.touching.down;
    const velocityXBeforeMove = body.velocity.x;
    const dt = delta / 1000;

    if (onGround && !this.wasOnGround && this.previousPlayerVelocityY > LANDING_DUST_MIN_VELOCITY) {
      this.spawnLandingDust();
    }

    if (downPressed && onGround && this.tryEnterConduit(body)) {
      return;
    }

    if (this.tryUpdateVineClimb(body, upDown, downDown, spacePressed, direction, delta)) {
      return;
    }

    this.releaseVine(body);

    const crouching = this.updatePlayerCrouch(downDown && onGround && this.isPowered, onGround, body);
    const effectiveDirection = crouching ? 0 : direction;
    const targetSpeed = effectiveDirection * (runDown ? RUN_SPEED : WALK_SPEED);

    if (effectiveDirection !== 0) {
      const currentDirection = Math.sign(velocityXBeforeMove);
      const reversing = currentDirection !== 0 && currentDirection !== effectiveDirection;
      if (onGround && reversing && Math.abs(velocityXBeforeMove) >= SKID_DUST_SPEED && time >= this.nextSkidDustAt) {
        this.spawnSkidDust(currentDirection);
        this.nextSkidDustAt = time + SKID_DUST_INTERVAL;
        this.playTone(146.83, 0.025);
      }
      const acceleration = onGround ? (reversing ? SKID_DECELERATION : GROUND_ACCELERATION) : AIR_ACCELERATION;
      body.velocity.x = moveTowards(body.velocity.x, targetSpeed, acceleration * dt);
      this.player.setData('facing', effectiveDirection);
    } else {
      const friction = onGround ? (crouching ? GROUND_FRICTION * 1.25 : GROUND_FRICTION) : AIR_FRICTION;
      body.velocity.x = moveTowards(body.velocity.x, 0, friction * dt);
    }

    if (onGround) {
      this.coyoteUntil = time + 95;
      this.stompChain = 0;
    }

    if (jumpPressed) {
      this.jumpBufferedUntil = time + 125;
    }

    if (!crouching && this.jumpBufferedUntil > time && this.coyoteUntil > time) {
      this.player.setVelocityY(this.getJumpVelocity(runDown, body.velocity.x));
      this.jumpBufferedUntil = 0;
      this.coyoteUntil = 0;
      this.playTone(392, 0.08);
    }

    if (!jumpDown && body.velocity.y < JUMP_CUT_VELOCITY) {
      this.player.setVelocityY(JUMP_CUT_VELOCITY);
    }

    this.updatePlayerJumpGravity(body, jumpDown, onGround);

    if (attackPressed) {
      this.tryShoot(time);
    }

    this.player.setAlpha(1);
    this.updatePlayerAnimation(effectiveDirection, body);
    this.wasOnGround = onGround;
    this.previousPlayerVelocityY = body.velocity.y;
  }

  private getJumpVelocity(runDown: boolean, horizontalVelocity: number): number {
    const runRange = RUN_SPEED - WALK_SPEED * 0.65;
    const carriedSpeed = Phaser.Math.Clamp((Math.abs(horizontalVelocity) - WALK_SPEED * 0.65) / runRange, 0, 1);
    const runButtonBonus = runDown ? 0.35 : 0;
    const jumpPower = Phaser.Math.Clamp(Math.max(carriedSpeed, runButtonBonus), 0, 1);
    return Phaser.Math.Linear(WALK_JUMP_VELOCITY, RUN_JUMP_VELOCITY, jumpPower);
  }

  private updatePlayerJumpGravity(body: Phaser.Physics.Arcade.Body, jumpDown: boolean, onGround: boolean): void {
    if (!body.allowGravity || onGround) {
      body.setGravityY(0);
      return;
    }

    if (body.velocity.y > 0) {
      body.setGravityY(PLAYER_FALL_EXTRA_GRAVITY_Y);
    } else if (!jumpDown) {
      body.setGravityY(PLAYER_SHORT_HOP_EXTRA_GRAVITY_Y);
    } else {
      body.setGravityY(0);
    }
  }

  private tryUpdateVineClimb(
    body: Phaser.Physics.Arcade.Body,
    upDown: boolean,
    downDown: boolean,
    jumpOffPressed: boolean,
    direction: number,
    delta: number
  ): boolean {
    const vine = this.getOverlappingVine(body);
    if (!vine) {
      this.releaseVine(body);
      return false;
    }

    if (!this.isClimbingVine && !upDown && !downDown) {
      return false;
    }

    if (this.isClimbingVine && jumpOffPressed) {
      this.releaseVine(body);
      const jumpDirection = direction || Number(this.player.getData('facing')) || 1;
      this.player.setVelocity(jumpDirection * WALK_SPEED * 0.75, WALK_JUMP_VELOCITY * 0.76);
      this.playTone(392, 0.07);
      this.jumpBufferedUntil = 0;
      this.coyoteUntil = 0;
      return true;
    }

    this.isClimbingVine = true;
    this.skyRouteCameraActive = true;
    this.isCrouching = false;
    body.allowGravity = false;
    body.setGravityY(0);

    const dt = delta / 1000;
    const vineX = vine.x;
    const centerDelta = Phaser.Math.Clamp(vineX - this.player.x, -VINE_CENTERING_SPEED * dt, VINE_CENTERING_SPEED * dt);
    this.player.x += centerDelta;
    body.position.x += centerDelta;

    const verticalDirection = Number(downDown) - Number(upDown);
    this.player.setVelocityX(direction * WALK_SPEED * 0.35);
    this.player.setVelocityY(verticalDirection * VINE_CLIMB_SPEED);
    this.player.setData('facing', direction || Number(this.player.getData('facing')) || 1);
    this.player.setAlpha(1);
    this.player.setFlipX(false);
    this.player.play(verticalDirection === 0 ? 'pet-idle' : 'pet-run-right', true);

    this.jumpBufferedUntil = 0;
    this.coyoteUntil = 0;
    this.wasOnGround = false;
    this.previousPlayerVelocityY = 0;
    return true;
  }

  private getOverlappingVine(body: Phaser.Physics.Arcade.Body): VineSprite | undefined {
    for (const child of this.vines.getChildren()) {
      const vine = child as VineSprite;
      if (!vine.active || this.time.now < (Number(vine.getData('readyAt')) || 0)) {
        continue;
      }

      const vineBody = vine.body;
      const horizontalOverlap = body.right > vineBody.left + 3 && body.left < vineBody.right - 3;
      const verticalOverlap = body.bottom > vineBody.top + 2 && body.top < vineBody.bottom - 2;
      if (horizontalOverlap && verticalOverlap) {
        return vine;
      }
    }

    return undefined;
  }

  private releaseVine(body: Phaser.Physics.Arcade.Body): void {
    if (!this.isClimbingVine) {
      body.allowGravity = true;
      return;
    }

    this.isClimbingVine = false;
    body.allowGravity = true;
  }

  private spawnSkidDust(travelDirection: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const footY = body.bottom - 5;
    const baseX = this.player.x - travelDirection * 21;
    this.spawnDustPuff(baseX, footY, -travelDirection, 1.05, 0);
  }

  private spawnLandingDust(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const footY = body.bottom - 4;
    this.spawnDustPuff(this.player.x - 14, footY, -1, 0.9, 0);
    this.spawnDustPuff(this.player.x + 14, footY, 1, 0.9, 20);
  }

  private spawnDustPuff(x: number, y: number, direction: number, scale: number, delay: number): void {
    const puff = this.add.image(x, y, 'dust-puff').setDepth(4).setScale(scale);
    puff.setAlpha(0.82);
    this.tweens.add({
      targets: puff,
      x: x + direction * Phaser.Math.Between(12, 22),
      y: y - Phaser.Math.Between(2, 8),
      alpha: 0,
      scale: scale * 1.55,
      duration: 260,
      delay,
      ease: 'Quad.out',
      onComplete: () => puff.destroy()
    });
  }

  private updatePlayerAnimation(direction: number, body: Phaser.Physics.Arcade.Body): void {
    const storedFacing = Number(this.player.getData('facing')) || 1;
    const movementDirection = direction || Math.sign(body.velocity.x) || storedFacing;

    if (this.isCrouching) {
      this.setPlayerCrouchPose();
      return;
    }

    if (!body.blocked.down && !body.touching.down) {
      this.setPlayerJumpPose(movementDirection);
      return;
    }

    this.player.setFlipX(false);

    if (movementDirection > 0 && Math.abs(body.velocity.x) > 8) {
      this.player.play('pet-run-right', true);
    } else if (movementDirection < 0 && Math.abs(body.velocity.x) > 8) {
      this.player.play('pet-run-left', true);
    } else {
      this.player.play('pet-idle', true);
    }
  }

  private setPlayerJumpPose(direction = Number(this.player.getData('facing')) || 1): void {
    this.player.anims.stop();
    this.player.setFlipX(direction < 0);

    if (this.player.texture.key !== PET_SHEET_TEXTURE) {
      this.player.setTexture(PET_SHEET_TEXTURE);
    }

    if (String(this.player.frame.name) !== String(PET_JUMP_FRAME)) {
      this.player.setFrame(PET_JUMP_FRAME);
    }
  }

  private setPlayerCrouchPose(): void {
    this.player.anims.stop();
    this.player.setFlipX(false);

    if (this.player.texture.key !== PET_SHEET_TEXTURE) {
      this.player.setTexture(PET_SHEET_TEXTURE);
    }

    if (String(this.player.frame.name) !== String(PET_CROUCH_FRAME)) {
      this.player.setFrame(PET_CROUCH_FRAME);
    }
  }

  private updatePlayerCrouch(wantsCrouch: boolean, onGround: boolean, body: Phaser.Physics.Arcade.Body): boolean {
    const heldLowByCeiling = this.isCrouching && !this.canStandFromCrouch(body);
    const shouldCrouch = this.isPowered && onGround && (wantsCrouch || heldLowByCeiling);

    if (shouldCrouch !== this.isCrouching) {
      this.isCrouching = shouldCrouch;
      this.applyPlayerPowerState(false);
    }

    return this.isCrouching;
  }

  private canStandFromCrouch(body: Phaser.Physics.Arcade.Body): boolean {
    const standingTop = body.bottom - PLAYER_POWERED_BODY_HEIGHT;
    const leftTile = Math.floor((body.left + 6) / TILE_SIZE);
    const rightTile = Math.floor((body.right - 6) / TILE_SIZE);
    const topTile = Math.floor((standingTop + 2) / TILE_SIZE);
    const bottomTile = Math.floor((body.top - 2) / TILE_SIZE);

    for (let tileY = topTile; tileY <= bottomTile; tileY += 1) {
      for (let tileX = leftTile; tileX <= rightTile; tileX += 1) {
        if (this.solidTiles.has(`${tileX},${tileY}`)) {
          return false;
        }
      }
    }

    return true;
  }

  private tryEnterConduit(body: Phaser.Physics.Arcade.Body): boolean {
    const link = this.getStandingConduitLink(body);
    if (!link) {
      return false;
    }

    this.startConduitTransition(link);
    return true;
  }

  private getStandingConduitLink(body: Phaser.Physics.Arcade.Body): ConduitLink | undefined {
    return this.level.conduitLinks.find((link) => {
      const topY = link.entry.y * TILE_SIZE;
      const leftX = link.entry.x * TILE_SIZE;
      const rightX = (link.entry.x + 2) * TILE_SIZE;
      const centeredOnConduit = this.player.x >= leftX + 8 && this.player.x <= rightX - 8;
      const standingOnTop = Math.abs(body.bottom - topY) <= 12 && body.velocity.y >= 0;
      return centeredOnConduit && standingOnTop;
    });
  }

  private startConduitTransition(link: ConduitLink): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const targetLevelIndex = link.targetLevelIndex;
    this.stopGameplayMusic(false);
    this.isConduitTransitioning = true;
    this.isCrouching = false;
    this.releaseVine(body);
    this.applyPlayerPowerState(false);
    this.player.setVelocity(0, 0);
    body.enable = false;
    this.cameras.main.fadeOut(170, 0, 0, 0);
    this.playTone(246.94, 0.08);

    this.tweens.add({
      targets: this.player,
      y: this.player.y + CONDUIT_TRAVEL_PIXELS,
      alpha: 0,
      duration: 180,
      ease: 'Sine.in',
      onComplete: () => {
        if (targetLevelIndex !== undefined && targetLevelIndex !== this.levelIndex) {
          this.scene.restart({
            autoStart: false,
            levelIndex: Phaser.Math.Clamp(targetLevelIndex, 0, LEVELS.length - 1),
            carry: this.snapshotCarryState()
          });
          return;
        }

        const targetX = link.target.x * TILE_SIZE + TILE_SIZE / 2;
        const targetY = link.target.y * TILE_SIZE;
        this.player.setPosition(targetX, targetY + CONDUIT_TRAVEL_PIXELS);
        this.player.setVelocity(0, 0);
        this.player.setAlpha(1);
        this.snapCameraToPlayer();
        this.cameras.main.fadeIn(170, 0, 0, 0);
        this.tweens.add({
          targets: this.player,
          y: targetY,
          duration: 190,
          ease: 'Sine.out',
          onComplete: () => {
            body.enable = true;
            body.reset(this.player.x, this.player.y);
            this.isConduitTransitioning = false;
            this.startGameplayMusic();
          }
        });
      }
    });
  }

  private snapCameraToPlayer(): void {
    const camera = this.cameras.main;
    const maxScrollX = Math.max(0, this.level.width * TILE_SIZE - camera.width);
    camera.setScroll(
      Phaser.Math.Clamp(this.player.x - camera.width / 2, 0, maxScrollX),
      this.getClassicCameraScrollY(camera)
    );
    this.forwardCameraScrollX = camera.scrollX;
  }

  private getClassicCameraScrollY(camera: Phaser.Cameras.Scene2D.Camera): number {
    return Math.max(0, this.level.height * TILE_SIZE - camera.height);
  }

  private getTargetCameraScrollY(camera: Phaser.Cameras.Scene2D.Camera): number {
    const baseScrollY = this.getClassicCameraScrollY(camera);
    if (baseScrollY <= 0) {
      this.skyRouteCameraActive = false;
      return 0;
    }

    if (
      this.skyRouteCameraActive &&
      !this.isClimbingVine &&
      this.player.y > baseScrollY + SKY_ROUTE_CAMERA_RETURN_SCREEN_Y
    ) {
      this.skyRouteCameraActive = false;
    }

    if (!this.skyRouteCameraActive) {
      return baseScrollY;
    }

    return Phaser.Math.Clamp(this.player.y - SKY_ROUTE_CAMERA_PLAYER_SCREEN_Y, 0, baseScrollY);
  }

  private updateSideScrollingCamera(): void {
    if (this.isConduitTransitioning) {
      return;
    }

    const camera = this.cameras.main;
    const maxScrollX = Math.max(0, this.level.width * TILE_SIZE - camera.width);
    const desiredScrollX = Phaser.Math.Clamp(this.player.x - CAMERA_LEAD_X, 0, maxScrollX);
    const targetScrollY = this.getTargetCameraScrollY(camera);
    const nextScrollY =
      Math.abs(camera.scrollY - targetScrollY) <= 0.5
        ? targetScrollY
        : Phaser.Math.Linear(camera.scrollY, targetScrollY, SKY_ROUTE_CAMERA_LERP);

    this.forwardCameraScrollX = Math.max(this.forwardCameraScrollX, desiredScrollX);
    camera.setScroll(this.forwardCameraScrollX, nextScrollY);
    this.clampPlayerToCameraLeft();
  }

  private clampPlayerToCameraLeft(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body.enable) {
      return;
    }

    const minLeft = this.cameras.main.scrollX + PLAYER_SCREEN_LEFT_PADDING;
    if (body.left >= minLeft) {
      return;
    }

    const deltaX = minLeft - body.left;
    this.player.x += deltaX;
    body.position.x += deltaX;
    if (body.velocity.x < 0) {
      body.velocity.x = 0;
    }
  }

  private updateMovingPlatforms(): void {
    for (const child of this.movingPlatforms.getChildren()) {
      const platform = child as MovingPlatformSprite;
      const body = platform.body;
      const axis = platform.getData('axis') as MovingPlatform['axis'];
      const speed = Number(platform.getData('speed')) || 0;
      let direction = Number(platform.getData('direction')) || 1;

      body.allowGravity = false;
      body.immovable = true;

      if (axis === 'horizontal') {
        const minX = Number(platform.getData('minX'));
        const maxX = Number(platform.getData('maxX'));
        if (platform.x >= maxX && direction > 0) {
          platform.setX(maxX);
          direction = -1;
        } else if (platform.x <= minX && direction < 0) {
          platform.setX(minX);
          direction = 1;
        }

        platform.setData('direction', direction);
        platform.setVelocity(direction * speed, 0);
      } else {
        const minY = Number(platform.getData('minY'));
        const maxY = Number(platform.getData('maxY'));
        if (platform.y >= maxY && direction > 0) {
          platform.setY(maxY);
          direction = -1;
        } else if (platform.y <= minY && direction < 0) {
          platform.setY(minY);
          direction = 1;
        }

        platform.setData('direction', direction);
        platform.setVelocity(0, direction * speed);
      }
    }
  }

  private carryPlayerOnMovingPlatforms(): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    for (const child of this.movingPlatforms.getChildren()) {
      const platform = child as MovingPlatformSprite;
      const platformBody = platform.body;
      const previousX = Number(platform.getData('previousX')) || platform.x;
      const previousY = Number(platform.getData('previousY')) || platform.y;
      const deltaX = platform.x - previousX;
      const deltaY = platform.y - previousY;
      const standingOnPlatform =
        playerBody.bottom <= platformBody.top + 12 &&
        playerBody.bottom >= platformBody.top - 10 &&
        playerBody.right > platformBody.left + 8 &&
        playerBody.left < platformBody.right - 8 &&
        playerBody.velocity.y >= 0;

      if (standingOnPlatform && (deltaX !== 0 || deltaY !== 0)) {
        this.player.x += deltaX;
        this.player.y += deltaY;
        playerBody.position.x += deltaX;
        playerBody.position.y += deltaY;
      }

      platform.setData('previousX', platform.x);
      platform.setData('previousY', platform.y);
    }
  }

  private updateBalanceLifts(delta: number): void {
    const deltaSeconds = delta / 1000;
    for (const pair of this.balanceLiftPairs) {
      const leftOccupied = this.isPlayerStandingOnLift(pair.left);
      const rightOccupied = this.isPlayerStandingOnLift(pair.right);
      let leftTargetY = pair.leftHomeY;
      let rightTargetY = pair.rightHomeY;

      if (leftOccupied && !rightOccupied) {
        leftTargetY = pair.leftMaxY;
        rightTargetY = pair.rightMinY;
      } else if (rightOccupied && !leftOccupied) {
        leftTargetY = pair.leftMinY;
        rightTargetY = pair.rightMaxY;
      }

      const maxDelta = deltaSeconds * pair.speed;
      this.moveBalanceLiftPlatform(pair.left, leftTargetY, maxDelta, deltaSeconds, leftOccupied);
      this.moveBalanceLiftPlatform(pair.right, rightTargetY, maxDelta, deltaSeconds, rightOccupied);
      this.drawBalanceLiftRope(pair);
    }
  }

  private moveBalanceLiftPlatform(
    platform: BalanceLiftSprite,
    targetY: number,
    maxDelta: number,
    deltaSeconds: number,
    carryPlayer: boolean
  ): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const previousY = platform.y;
    const y = moveTowards(platform.y, targetY, maxDelta);
    const deltaY = y - previousY;

    platform.setY(y);
    platform.body.reset(platform.x, y);
    platform.setVelocity(0, deltaY === 0 ? 0 : deltaY / Math.max(deltaSeconds, 0.001));

    if (carryPlayer && deltaY !== 0) {
      this.player.y += deltaY;
      playerBody.position.y += deltaY;
    }
  }

  private isPlayerStandingOnLift(platform: BalanceLiftSprite): boolean {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const platformBody = platform.body;

    return (
      playerBody.bottom <= platformBody.top + 12 &&
      playerBody.bottom >= platformBody.top - 10 &&
      playerBody.right > platformBody.left + 8 &&
      playerBody.left < platformBody.right - 8 &&
      playerBody.velocity.y >= -8
    );
  }

  private drawBalanceLiftRope(pair: BalanceLiftPair): void {
    const pulleyY = Math.min(pair.leftHomeY, pair.rightHomeY) - BALANCE_LIFT_PULLEY_OFFSET;
    const leftDeckY = pair.left.y - BALANCE_LIFT_HEIGHT / 2 + 2;
    const rightDeckY = pair.right.y - BALANCE_LIFT_HEIGHT / 2 + 2;

    pair.rope.clear();
    pair.rope.lineStyle(3, 0x6d5a46, 1);
    pair.rope.beginPath();
    pair.rope.moveTo(pair.left.x, pulleyY);
    pair.rope.lineTo(pair.right.x, pulleyY);
    pair.rope.moveTo(pair.left.x, pulleyY);
    pair.rope.lineTo(pair.left.x, leftDeckY);
    pair.rope.moveTo(pair.right.x, pulleyY);
    pair.rope.lineTo(pair.right.x, rightDeckY);
    pair.rope.strokePath();
    pair.rope.fillStyle(0xffd166, 1);
    pair.rope.fillCircle(pair.left.x, pulleyY, 7);
    pair.rope.fillCircle(pair.right.x, pulleyY, 7);
    pair.rope.fillStyle(0x111927, 1);
    pair.rope.fillCircle(pair.left.x, pulleyY, 3);
    pair.rope.fillCircle(pair.right.x, pulleyY, 3);
  }

  private updateFallingLifts(time: number): void {
    for (const child of this.fallingLifts.getChildren()) {
      const lift = child as FallingLiftSprite;
      const body = lift.body;
      const previousX = Number(lift.getData('previousX')) || lift.x;
      const previousY = Number(lift.getData('previousY')) || lift.y;
      const deltaX = lift.x - previousX;
      const deltaY = lift.y - previousY;
      const isFalling = Boolean(lift.getData('falling'));
      const triggeredAt = Number(lift.getData('triggeredAt')) || 0;
      const standingOnLift = this.isPlayerStandingOnDynamicLift(lift);

      if (standingOnLift && (deltaX !== 0 || deltaY !== 0)) {
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        this.player.x += deltaX;
        this.player.y += deltaY;
        playerBody.position.x += deltaX;
        playerBody.position.y += deltaY;
      }

      if (!isFalling && standingOnLift && triggeredAt === 0) {
        lift.setData('triggeredAt', time);
        this.playTone(180, 0.035);
      }

      const nextTriggeredAt = Number(lift.getData('triggeredAt')) || 0;
      if (!isFalling && nextTriggeredAt > 0) {
        const elapsed = time - nextTriggeredAt;
        const delay = Number(lift.getData('delay')) || FALLING_LIFT_DEFAULT_DELAY;
        const homeX = Number(lift.getData('homeX')) || lift.x;
        const shakeX = Math.sin(time * 0.055) * 2.4;
        lift.setX(homeX + shakeX);
        body.reset(lift.x, lift.y);

        if (elapsed >= delay) {
          lift.setData('falling', true);
          lift.setVelocity(0, Number(lift.getData('speed')) || FALLING_LIFT_DEFAULT_SPEED);
          this.spawnDustPuff(lift.x - 18, lift.y + FALLING_LIFT_HEIGHT / 2 + 2, -1, 0.72, 0);
          this.spawnDustPuff(lift.x + 18, lift.y + FALLING_LIFT_HEIGHT / 2 + 2, 1, 0.72, 20);
        }
      } else if (!isFalling) {
        const homeX = Number(lift.getData('homeX')) || lift.x;
        if (lift.x !== homeX) {
          lift.setX(homeX);
          body.reset(lift.x, lift.y);
        }
        lift.setVelocity(0, 0);
      }

      if (lift.y > this.level.height * TILE_SIZE + 180) {
        lift.disableBody(true, true);
      }

      lift.setData('previousX', lift.x);
      lift.setData('previousY', lift.y);
    }
  }

  private isPlayerStandingOnDynamicLift(platform: FallingLiftSprite | MovingPlatformSprite): boolean {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const platformBody = platform.body;

    return (
      playerBody.bottom <= platformBody.top + 12 &&
      playerBody.bottom >= platformBody.top - 10 &&
      playerBody.right > platformBody.left + 8 &&
      playerBody.left < platformBody.right - 8 &&
      playerBody.velocity.y >= -8
    );
  }

  private updateFirebars(time: number): void {
    for (const child of this.firebars.getChildren()) {
      this.positionFirebarSegment(child as FirebarSprite, time);
    }
  }

  private positionFirebarSegment(flame: FirebarSprite, time: number): void {
    const centerX = Number(flame.getData('centerX'));
    const centerY = Number(flame.getData('centerY'));
    const radius = Number(flame.getData('radius'));
    const speed = Number(flame.getData('speed'));
    const phase = Number(flame.getData('phase')) || 0;
    const angle = phase + (time / 1000) * speed;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    flame.setPosition(x, y);
    flame.setAngle((angle * 180) / Math.PI);
    flame.body.reset(x, y);
  }

  private updateCannons(time: number): void {
    for (const child of this.cannonLaunchers.getChildren()) {
      const launcher = child as CannonLauncherSprite;
      const nextShotAt = Number(launcher.getData('nextShotAt')) || time;
      if (time < nextShotAt || !this.isCannonActive(launcher)) {
        continue;
      }

      const interval = Number(launcher.getData('interval')) || 1800;
      launcher.setData('nextShotAt', time + interval);
      this.spawnCannonShot(launcher);
    }
  }

  private isCannonActive(launcher: CannonLauncherSprite): boolean {
    const distanceToPlayer = Math.abs(this.player.x - launcher.x);
    if (distanceToPlayer > CANNON_ACTIVE_RANGE || distanceToPlayer < CANNON_SAFE_RADIUS) {
      return false;
    }

    const camera = this.cameras.main;
    return launcher.x > camera.scrollX - 96 && launcher.x < camera.scrollX + camera.width + 128;
  }

  private spawnCannonShot(launcher: CannonLauncherSprite): void {
    const direction = Number(launcher.getData('direction')) || (this.player.x < launcher.x ? -1 : 1);
    const shot = this.cannonShots.create(launcher.x + direction * 24, launcher.y - 2, 'cannon-shot') as CannonShotSprite;
    const body = shot.body;

    shot.setDepth(4);
    shot.setData('bornAt', this.time.now);
    shot.setVelocityX(direction * CANNON_SHOT_SPEED);
    shot.setFlipX(direction > 0);
    body.allowGravity = false;
    body.setSize(22, 15);
    body.setOffset(2, 3);
    this.spawnSparkBurst(launcher.x + direction * 16, launcher.y);
    this.playTone(110, 0.035);
  }

  private updateCannonShots(time: number): void {
    for (const child of this.cannonShots.getChildren()) {
      const shot = child as CannonShotSprite;
      if (!shot.active) {
        continue;
      }

      const body = shot.body;
      const bornAt = Number(shot.getData('bornAt')) || time;
      const outOfBounds =
        shot.x < this.cameras.main.scrollX - 128 ||
        shot.x > this.cameras.main.scrollX + this.cameras.main.width + 128 ||
        shot.y < -64 ||
        shot.y > this.level.height * TILE_SIZE + 96;

      shot.angle += Math.sign(body.velocity.x || 1) * 6;
      if (outOfBounds || time - bornAt > 5200) {
        shot.destroy();
      }
    }
  }

  private updateEnemies(): void {
    for (const child of this.enemies.getChildren()) {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      if (!enemy.active) {
        continue;
      }

      const kind = this.getEnemyKind(enemy);
      if (!this.tryWakeSleepingEnemy(enemy, kind)) {
        continue;
      }

      if (kind === 'pipePlant') {
        if (!body.enable) {
          continue;
        }
        this.updatePipePlant(enemy);
        continue;
      }

      if (!body.enable) {
        continue;
      }

      if (kind === 'guardian') {
        this.updateGuardian(enemy);
        continue;
      }

      if (kind === 'hammerThrower') {
        this.updateHammerThrower(enemy);
        continue;
      }

      const mode = this.getEnemyMode(enemy);
      const direction = Math.sign(body.velocity.x) || Number(enemy.getData('direction')) || -1;

      if (mode === 'shell') {
        enemy.setVelocityX(0);
        enemy.setFlipX(false);
        this.updateIdleShell(enemy);
      } else if (mode === 'sliding') {
        if (body.blocked.left || body.touching.left) {
          enemy.setVelocityX(SHELL_SLIDE_SPEED);
          enemy.setData('direction', 1);
        } else if (body.blocked.right || body.touching.right) {
          enemy.setVelocityX(-SHELL_SLIDE_SPEED);
          enemy.setData('direction', -1);
        } else {
          enemy.setVelocityX(direction * SHELL_SLIDE_SPEED);
          enemy.setData('direction', direction);
        }
        enemy.angle += Math.sign(body.velocity.x || direction || 1) * 18;
        enemy.setFlipX(false);
      } else {
        if (body.blocked.left || body.touching.left) {
          enemy.setVelocityX(WALKING_ENEMY_SPEED);
        } else if (body.blocked.right || body.touching.right) {
          enemy.setVelocityX(-WALKING_ENEMY_SPEED);
        }

        const walkingDirection = Math.sign(body.velocity.x) || direction;
        enemy.setData('direction', walkingDirection);
        enemy.setFlipX(walkingDirection > 0);
        this.updateWalkingEnemyAnimation(enemy, kind);

        if (kind === 'wingShellback') {
          this.updateWingShellbackHop(enemy);
        }
      }

      if (enemy.y > this.level.height * TILE_SIZE + 80) {
        enemy.destroy();
      }
    }
  }

  private updateWalkingEnemyAnimation(enemy: Phaser.Physics.Arcade.Sprite, kind: EnemyKind): void {
    const frame = Math.floor(this.time.now / ENEMY_WALK_ANIM_FRAME_MS) % 2;

    if (kind === 'wobbler') {
      enemy.setTexture(frame === 0 ? 'enemy' : 'enemy-step');
    } else if (kind === 'shellback') {
      enemy.setTexture(frame === 0 ? 'enemy-shellback' : 'enemy-shellback-step');
    } else if (kind === 'wingShellback') {
      enemy.setTexture(frame === 0 ? 'enemy-wing-shellback' : 'enemy-wing-shellback-step');
    }
  }

  private updateIdleShell(enemy: Phaser.Physics.Arcade.Sprite): void {
    const now = this.time.now;
    let shellEnteredAt = Number(enemy.getData('shellEnteredAt')) || 0;
    if (shellEnteredAt <= 0) {
      shellEnteredAt = now;
      enemy.setData('shellEnteredAt', shellEnteredAt);
    }

    const elapsed = now - shellEnteredAt;
    if (elapsed >= SHELL_WAKE_DELAY) {
      this.wakeShellback(enemy);
      return;
    }

    if (elapsed >= SHELL_WAKE_WARNING_DELAY) {
      const frame = Math.floor(now / SHELL_WAKE_FLASH_MS) % 2;
      enemy.setTexture(frame === 0 ? 'enemy-shell' : 'enemy-shell-wake');
      enemy.setAngle(frame === 0 ? -4 : 4);
    } else {
      enemy.setTexture('enemy-shell');
      enemy.setAngle(0);
    }
  }

  private updateGuardian(enemy: Phaser.Physics.Arcade.Sprite): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const now = this.time.now;
    const facingLeft = this.player.x < enemy.x;

    body.immovable = true;
    enemy.setVelocityX(0);
    enemy.setFlipX(!facingLeft);

    if (now < Number(enemy.getData('nextShotAt'))) {
      return;
    }

    enemy.setData('nextShotAt', now + GUARDIAN_FIREBALL_COOLDOWN);
    this.spawnGuardianFireball(enemy, facingLeft ? -1 : 1);
  }

  private updateWingShellbackHop(enemy: Phaser.Physics.Arcade.Sprite): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const now = this.time.now;

    if (!body.blocked.down || now < Number(enemy.getData('nextHopAt'))) {
      return;
    }

    enemy.setVelocityY(WING_SHELLBACK_HOP_VELOCITY);
    enemy.setData('nextHopAt', now + WING_SHELLBACK_HOP_INTERVAL);
  }

  private updateHammerThrower(enemy: Phaser.Physics.Arcade.Sprite): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const now = this.time.now;
    const facingDirection = this.player.x < enemy.x ? -1 : 1;

    enemy.setVelocityX(0);
    enemy.setData('direction', facingDirection);
    enemy.setFlipX(facingDirection > 0);

    if (body.blocked.down && now >= Number(enemy.getData('nextHopAt'))) {
      enemy.setVelocityY(HAMMER_THROWER_HOP_VELOCITY);
      enemy.setData('nextHopAt', now + HAMMER_THROWER_HOP_INTERVAL + Phaser.Math.Between(-220, 260));
    }

    if (now < Number(enemy.getData('nextThrowAt')) || Math.abs(this.player.x - enemy.x) > HAMMER_THROW_ACTIVE_RANGE) {
      return;
    }

    enemy.setData('nextThrowAt', now + HAMMER_THROW_COOLDOWN + Phaser.Math.Between(-180, 240));
    this.spawnEnemyHammer(enemy, facingDirection);
  }

  private spawnEnemyHammer(enemy: Phaser.Physics.Arcade.Sprite, direction: number): void {
    const hammer = this.enemyProjectiles.create(
      enemy.x + direction * 17,
      enemy.y - 18,
      'enemy-hammer'
    ) as EnemyProjectileSprite;
    const body = hammer.body;

    hammer.setDepth(4);
    hammer.setData('bornAt', this.time.now);
    hammer.setVelocity(direction * HAMMER_THROW_SPEED_X, HAMMER_THROW_SPEED_Y);
    hammer.setAngularVelocity(direction * 720);
    body.setSize(14, 14);
    body.setOffset(2, 2);
    this.playTone(293.66, 0.035);
  }

  private spawnGuardianFireball(enemy: Phaser.Physics.Arcade.Sprite, direction: number): void {
    const fireball = this.guardianFireballs.create(
      enemy.x + direction * 26,
      enemy.y - 14,
      'guardian-fireball'
    ) as GuardianFireballSprite;
    const body = fireball.body;
    const verticalVelocity = Phaser.Math.Clamp((this.player.y - enemy.y) * 0.42, -70, 70);

    fireball.setDepth(4);
    fireball.setData('bornAt', this.time.now);
    fireball.setVelocity(direction * GUARDIAN_FIREBALL_SPEED, verticalVelocity);
    body.allowGravity = false;
    body.setCircle(8, 2, 2);
    this.playTone(164.81, 0.04);
  }

  private updateGuardianFireballs(): void {
    for (const child of this.guardianFireballs.getChildren()) {
      const fireball = child as GuardianFireballSprite;
      const bornAt = Number(fireball.getData('bornAt')) || this.time.now;
      const outOfBounds =
        fireball.x < this.cameras.main.scrollX - 96 ||
        fireball.x > this.cameras.main.scrollX + this.cameras.main.width + 96 ||
        fireball.y < -64 ||
        fireball.y > this.level.height * TILE_SIZE + 96;

      fireball.angle += Math.sign(fireball.body.velocity.x || 1) * 16;
      if (outOfBounds || this.time.now - bornAt > 3600) {
        fireball.destroy();
      }
    }
  }

  private updateEnemyProjectiles(time: number): void {
    for (const child of this.enemyProjectiles.getChildren()) {
      const projectile = child as EnemyProjectileSprite;
      if (!projectile.active) {
        continue;
      }

      const bornAt = Number(projectile.getData('bornAt')) || time;
      const outOfBounds =
        projectile.x < this.cameras.main.scrollX - 128 ||
        projectile.x > this.cameras.main.scrollX + this.cameras.main.width + 128 ||
        projectile.y < -96 ||
        projectile.y > this.level.height * TILE_SIZE + 128;

      if (outOfBounds || time - bornAt > 4200) {
        projectile.destroy();
      }
    }
  }

  private updateLavaBubbles(time: number): void {
    for (const child of this.lavaBubbles.getChildren()) {
      const bubble = child as LavaBubbleSprite;
      const body = bubble.body;
      const sourceX = Number(bubble.getData('sourceX'));
      const sourceY = Number(bubble.getData('sourceY'));
      const nextLaunchAt = Number(bubble.getData('nextLaunchAt')) || time;

      if (!body.enable) {
        if (time >= nextLaunchAt) {
          bubble.enableBody(true, sourceX, sourceY, true, true);
          bubble.setAlpha(1);
          bubble.setVelocity(
            Phaser.Math.Between(-18, 18),
            Number(bubble.getData('velocity')) || LAVA_BUBBLE_DEFAULT_VELOCITY
          );
          bubble.setAngularVelocity(Phaser.Math.Between(-240, 240));
          this.playTone(220, 0.025);
        }
        continue;
      }

      bubble.angle += Math.sign(body.velocity.x || 1) * 5;

      if (bubble.y >= sourceY + 10 && body.velocity.y > 0) {
        bubble.disableBody(true, true);
        bubble.setVelocity(0, 0);
        bubble.setAngularVelocity(0);
        bubble.setPosition(sourceX, sourceY);
        bubble.setData('nextLaunchAt', time + (Number(bubble.getData('interval')) || LAVA_BUBBLE_DEFAULT_INTERVAL));
      }
    }
  }

  private updatePipePlant(enemy: Phaser.Physics.Arcade.Sprite): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const now = this.time.now;
    const state = (enemy.getData('plantState') as PipePlantState | undefined) ?? 'hidden';
    const hiddenY = Number(enemy.getData('hiddenY'));
    const emergedY = Number(enemy.getData('emergedY'));
    const nextAt = Number(enemy.getData('plantNextAt')) || now;
    const stateStartedAt = Number(enemy.getData('plantStateStartedAt')) || now;

    body.allowGravity = false;
    enemy.setVelocity(0, 0);

    if (state === 'hidden') {
      enemy.setY(hiddenY);
      enemy.setAlpha(0);
      this.setPipePlantDangerous(enemy, false);

      if (now >= nextAt && !this.isPlayerNearPipePlant(enemy)) {
        this.setPipePlantState(enemy, 'emerging');
      }
      return;
    }

    if (state === 'emerging') {
      const progress = Phaser.Math.Clamp((now - stateStartedAt) / PIPE_PLANT_MOVE_DURATION, 0, 1);
      enemy.setY(Phaser.Math.Linear(hiddenY, emergedY, progress));
      enemy.setAlpha(progress);
      this.setPipePlantDangerous(enemy, progress > 0.25);

      if (progress >= 1) {
        this.setPipePlantState(enemy, 'shown');
      }
      return;
    }

    if (state === 'shown') {
      enemy.setY(emergedY);
      enemy.setAlpha(1);
      this.setPipePlantDangerous(enemy, true);

      if (now >= nextAt) {
        this.setPipePlantState(enemy, 'retreating');
      }
      return;
    }

    const progress = Phaser.Math.Clamp((now - stateStartedAt) / PIPE_PLANT_MOVE_DURATION, 0, 1);
    enemy.setY(Phaser.Math.Linear(emergedY, hiddenY, progress));
    enemy.setAlpha(1 - progress);
    this.setPipePlantDangerous(enemy, progress < 0.78);

    if (progress >= 1) {
      this.setPipePlantState(enemy, 'hidden');
    }
  }

  private setPipePlantState(enemy: Phaser.Physics.Arcade.Sprite, state: PipePlantState): void {
    const now = this.time.now;
    enemy.setData('plantState', state);
    enemy.setData('plantStateStartedAt', now);

    if (state === 'shown') {
      enemy.setData('plantNextAt', now + PIPE_PLANT_SHOWN_DURATION);
    } else if (state === 'hidden') {
      enemy.setData('plantNextAt', now + PIPE_PLANT_HIDDEN_DURATION);
    }
  }

  private isPlayerNearPipePlant(enemy: Phaser.Physics.Arcade.Sprite): boolean {
    const pipeTopY = Number(enemy.getData('pipeTopY')) || enemy.y;
    return Math.abs(this.player.x - enemy.x) < PIPE_PLANT_PLAYER_SAFE_RADIUS && this.player.y > pipeTopY - 96;
  }

  private isPipePlantDangerous(enemy: Phaser.Physics.Arcade.Sprite): boolean {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    return body.enable && !body.checkCollision.none;
  }

  private setPipePlantDangerous(enemy: Phaser.Physics.Arcade.Sprite, dangerous: boolean): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    body.checkCollision.none = !dangerous;
    body.checkCollision.up = dangerous;
    body.checkCollision.down = dangerous;
    body.checkCollision.left = dangerous;
    body.checkCollision.right = dangerous;
  }

  private updateClassicTileAnimations(time: number): void {
    const nextBonusFrame = Math.floor(time / BONUS_BLOCK_ANIM_FRAME_MS) % BONUS_BLOCK_FRAMES.length;
    if (nextBonusFrame !== this.bonusBlockFrame) {
      this.bonusBlockFrame = nextBonusFrame;
      const texture = BONUS_BLOCK_FRAMES[nextBonusFrame];
      for (const child of this.solids.getChildren()) {
        const tile = child as SolidSprite;
        if (tile.active && tile.visible && tile.getData('kind') === 'bonus') {
          tile.setTexture(texture);
        }
      }
    }

    const nextCoinFrame = Math.floor(time / COIN_ANIM_FRAME_MS) % COIN_FRAMES.length;
    if (nextCoinFrame !== this.coinFrame) {
      this.coinFrame = nextCoinFrame;
      const texture = COIN_FRAMES[nextCoinFrame];
      for (const child of this.coins.getChildren()) {
        const coin = child as Phaser.Physics.Arcade.Image;
        if (coin.active && coin.visible) {
          coin.setTexture(texture);
        }
      }
    }
  }

  private updatePowerups(time: number): void {
    for (const child of this.powerups.getChildren()) {
      const powerup = child as Phaser.Physics.Arcade.Sprite;
      const body = powerup.body as Phaser.Physics.Arcade.Body;
      if (!powerup.active) {
        continue;
      }

      const kind = this.getPowerupKind(powerup);
      if (kind === 'spark') {
        powerup.setVelocity(0, 0);
        powerup.setAngle(Math.sin(time * 0.013) * 4);
      } else if (body.blocked.left || body.touching.left) {
        powerup.setVelocityX(this.getPowerupSpeed(powerup));
      } else if (body.blocked.right || body.touching.right) {
        powerup.setVelocityX(-this.getPowerupSpeed(powerup));
      }

      if (kind === 'star') {
        powerup.angle += Math.sign(body.velocity.x || 1) * 12;
      }

      if (powerup.y > this.level.height * TILE_SIZE + 80) {
        powerup.destroy();
      }
    }
  }

  private updateProjectiles(time: number): void {
    for (const child of this.projectiles.getChildren()) {
      const projectile = child as Phaser.Physics.Arcade.Sprite;
      if (!projectile.active) {
        continue;
      }

      const body = projectile.body as Phaser.Physics.Arcade.Body;
      projectile.angle += Math.sign(body.velocity.x || 1) * 16;

      const createdAt = Number(projectile.getData('createdAt')) || time;
      const outOfBounds =
        projectile.y > this.level.height * TILE_SIZE + 96 ||
        projectile.x < -96 ||
        projectile.x > this.level.width * TILE_SIZE + 96;
      if (time - createdAt > PROJECTILE_TTL || outOfBounds) {
        projectile.destroy();
      }
    }
  }

  private updateStarPower(time: number): void {
    if (this.hasStarPower(time)) {
      if (!this.starMusicEvent) {
        this.stopCourseMusic(false);
        this.startStarMusic();
      }
    } else {
      if (this.starPowerUntil > 0) {
        this.starPowerUntil = 0;
        this.starChain = 0;
      }

      if (this.starMusicEvent) {
        this.stopStarMusic(true);
        this.startCourseMusic();
      }
    }

    this.refreshPlayerTint(time);
  }

  private hasStarPower(time = this.time.now): boolean {
    return time < this.starPowerUntil;
  }

  private refreshPlayerTint(time = this.time.now): void {
    this.player.setAlpha(1);

    if (this.hasStarPower(time)) {
      const colors = [0xfff08a, 0xa8fff2, 0xff7b54, 0xf8fbff];
      this.player.setTint(colors[Math.floor(time / 95) % colors.length]);
      return;
    }

    if (time < this.invulnerableUntil) {
      const flickerFrame = Math.floor(time / INVULNERABLE_FLICKER_FRAME_MS);
      this.player.setAlpha(flickerFrame % 2 === 0 ? INVULNERABLE_FLICKER_ALPHA : 1);
      this.player.setTint(0xdff7ff);
      return;
    }

    if (this.hasSpark) {
      this.player.setTint(0xb8fff2);
    } else {
      this.player.clearTint();
    }
  }

  private startStarPower(): void {
    this.starChain = 0;
    this.starPowerUntil = this.time.now + STAR_POWER_DURATION;
    this.stopCourseMusic(false);
    this.stopStarMusic(true);
    this.refreshPlayerTint();
    this.hud.flash('Prism power');
    this.playTone(1046.5, 0.07);
    this.playTone(1318.51, 0.08, 0.07);
    this.playTone(1567.98, 0.1, 0.14);
    this.startStarMusic();
  }

  private tryShoot(time: number): void {
    if (!this.hasSpark || time < this.nextProjectileAt || this.projectiles.countActive(true) >= MAX_PROJECTILES) {
      return;
    }

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const facing = Number(this.player.getData('facing')) || Math.sign(playerBody.velocity.x) || 1;
    const projectile = this.projectiles.create(
      this.player.x + facing * 30,
      this.player.y - 8,
      'spark-shot'
    ) as Phaser.Physics.Arcade.Sprite;
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    projectile.setDepth(4);
    projectile.setVelocity(facing * PROJECTILE_SPEED, -130);
    projectile.setBounce(0.9, 0.55);
    projectile.setMaxVelocity(PROJECTILE_SPEED, 760);
    projectile.setData('createdAt', time);
    projectile.setData('direction', facing);
    projectile.setData('groundBounces', 0);
    projectile.setData('lastBounceAt', 0);
    body.setSize(12, 12);
    body.setOffset(1, 1);

    this.nextProjectileAt = time + PROJECTILE_COOLDOWN;
    this.playTone(1174.66, 0.04);
  }

  private handleEnemySolidCollision(enemy: Phaser.Physics.Arcade.Sprite, tile: SolidSprite): void {
    if (this.getEnemyKind(enemy) !== 'shellback' || this.getEnemyMode(enemy) !== 'sliding') {
      return;
    }

    const now = this.time.now;
    const lastSolidHitAt = Number(enemy.getData('solidHitAt')) || 0;
    if (lastSolidHitAt + SHELL_SOLID_HIT_COOLDOWN > now) {
      return;
    }

    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const hitLeft = body.blocked.left || body.touching.left;
    const hitRight = body.blocked.right || body.touching.right;
    if (!hitLeft && !hitRight) {
      return;
    }

    const reboundDirection = hitLeft ? 1 : -1;
    enemy.setData('solidHitAt', now);
    enemy.setData('direction', reboundDirection);
    enemy.setVelocityX(reboundDirection * SHELL_SLIDE_SPEED);
    this.spawnShellRicochet(enemy, reboundDirection);
    this.playTone(196, 0.035);

    const kind = tile.getData('kind') as SolidKind | 'used';
    if (kind === 'brick') {
      this.breakBrick(tile);
      this.awardScore(50, tile.x + TILE_SIZE / 2, tile.y);
    } else if (kind === 'bonus') {
      tile.setData('hitAt', now);
      this.handleBonusBlock(tile);
    }
  }

  private spawnShellRicochet(enemy: Phaser.Physics.Arcade.Sprite, reboundDirection: number): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const x = reboundDirection > 0 ? body.left - 2 : body.right + 2;
    const y = body.center.y;
    this.spawnDustPuff(x, y, reboundDirection, 0.7, 0);
    this.spawnSparkBurst(x, y);
  }

  private getEnemyKind(enemy: Phaser.Physics.Arcade.Sprite): EnemyKind {
    return (enemy.getData('kind') as EnemyKind | undefined) ?? 'wobbler';
  }

  private getEnemyMode(enemy: Phaser.Physics.Arcade.Sprite): EnemyMode {
    return (enemy.getData('mode') as EnemyMode | undefined) ?? 'walking';
  }

  private handleSpringboardCollision(springboard: SpringboardSprite): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const springBody = springboard.body;
    const now = this.time.now;
    const readyAt = Number(springboard.getData('readyAt')) || 0;
    const hitFromAbove =
      body.velocity.y >= 0 &&
      body.bottom <= springBody.top + 20 &&
      body.prev.y + body.height <= springBody.top + 18;

    if (!hitFromAbove || now < readyAt) {
      return;
    }

    const holdingJump = this.controls.cursors.up.isDown || this.controls.jump.isDown || this.controls.jumpAlt.isDown;
    springboard.setData('readyAt', now + 260);
    this.isCrouching = false;
    this.releaseVine(body);
    this.player.setVelocityY(holdingJump ? SPRINGBOARD_HELD_BOUNCE_VELOCITY : SPRINGBOARD_BOUNCE_VELOCITY);
    this.jumpBufferedUntil = 0;
    this.coyoteUntil = 0;
    this.wasOnGround = false;
    this.previousPlayerVelocityY = 0;
    this.spawnDustPuff(springboard.x - 10, springBody.top + 18, -1, 0.76, 0);
    this.spawnDustPuff(springboard.x + 10, springBody.top + 18, 1, 0.76, 20);
    this.playTone(523.25, 0.06);
    this.playTone(783.99, 0.07, 0.05);

    this.tweens.killTweensOf(springboard);
    springboard.setScale(1, 1);
    this.tweens.add({
      targets: springboard,
      scaleY: 0.58,
      y: springboard.y + 7,
      duration: 70,
      yoyo: true,
      ease: 'Quad.out',
      onComplete: () => {
        springboard.setScale(1, 1);
        springboard.refreshBody();
      }
    });
  }

  private handleSolidCollision(tile: SolidSprite): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const kind = tile.getData('kind') as SolidKind | 'used';
    const hitFromBelow = (body.blocked.up || body.touching.up) && this.player.y > tile.y + TILE_SIZE * 0.65;

    if (!hitFromBelow || tile.getData('hitAt') + 120 > this.time.now) {
      return;
    }

    tile.setData('hitAt', this.time.now);

    if (kind === 'bonus' || kind === 'hiddenBonus') {
      if (kind === 'hiddenBonus') {
        this.revealHiddenBlock(tile);
      }

      this.handleBonusBlock(tile);
    } else if (kind === 'brick') {
      if (this.isMultiCoinBlock(tile) || this.isCoinBlock(tile)) {
        this.handleCoinBrick(tile);
      } else if (this.isPowered) {
        this.bumpEnemiesAboveTile(tile);
        this.breakBrick(tile);
        this.runState.score += 50;
        this.playTone(196, 0.05);
      } else {
        this.bumpTile(tile);
        this.playTone(220, 0.045);
      }
    } else if (kind === 'used') {
      this.bumpTile(tile);
      this.playTone(164.81, 0.04);
    }
  }

  private handleCoinBrick(tile: SolidSprite): void {
    this.bumpTile(tile);

    if (this.isMultiCoinBlock(tile)) {
      this.handleMultiCoinBlock(tile);
    } else {
      this.useUpBlock(tile);
      this.spawnBlockCoin(tile.x + TILE_SIZE / 2, tile.y);
      this.awardCoin(200, tile.x + TILE_SIZE / 2, tile.y - 8);
    }

    this.cameras.main.shake(45, 0.001);
    this.playTone(880, 0.07);
  }

  private revealHiddenBlock(tile: SolidSprite): void {
    const tileX = Number(tile.getData('tileX'));
    const tileY = Number(tile.getData('tileY'));
    tile.setData('kind', 'bonus' satisfies SolidKind);
    tile.setTexture(this.getTileTexture('bonus', this.getTileThemeForTile(tile)));
    tile.setAlpha(1);
    tile.body.checkCollision.up = true;
    tile.body.checkCollision.left = true;
    tile.body.checkCollision.right = true;
    this.solidTiles.add(`${tileX},${tileY}`);
  }

  private handleBonusBlock(tile: SolidSprite): void {
    this.bumpTile(tile);

    if (this.isMultiCoinBlock(tile)) {
      this.handleMultiCoinBlock(tile);
    } else {
      this.useUpBlock(tile);

      const vineBlock = this.getVineBlock(tile);
      if (vineBlock) {
        this.spawnVine(tile, vineBlock);
        this.runState.score += 100;
      } else if (this.isLifeBlock(tile)) {
        this.spawnPowerup(tile.x + TILE_SIZE / 2, tile.y, 'life');
        this.runState.score += 100;
      } else if (this.isStarBlock(tile)) {
        this.spawnPowerup(tile.x + TILE_SIZE / 2, tile.y, 'star');
        this.runState.score += 100;
      } else if (this.isPowerupBlock(tile)) {
        this.spawnPowerup(tile.x + TILE_SIZE / 2, tile.y, this.isPowered ? 'spark' : 'growth');
        this.runState.score += 100;
      } else {
        this.spawnBlockCoin(tile.x + TILE_SIZE / 2, tile.y);
        this.awardCoin(200, tile.x + TILE_SIZE / 2, tile.y - 8);
      }
    }

    this.cameras.main.shake(45, 0.001);
    this.playTone(880, 0.07);
  }

  private isPowerupBlock(tile: SolidSprite): boolean {
    const tileX = Number(tile.getData('tileX'));
    const tileY = Number(tile.getData('tileY'));
    return this.level.powerupBlocks.some((point) => point.x === tileX && point.y === tileY);
  }

  private isStarBlock(tile: SolidSprite): boolean {
    const tileX = Number(tile.getData('tileX'));
    const tileY = Number(tile.getData('tileY'));
    return this.level.starBlocks.some((point) => point.x === tileX && point.y === tileY);
  }

  private isMultiCoinBlock(tile: SolidSprite): boolean {
    const tileX = Number(tile.getData('tileX'));
    const tileY = Number(tile.getData('tileY'));
    return this.level.multiCoinBlocks.some((point) => point.x === tileX && point.y === tileY);
  }

  private isCoinBlock(tile: SolidSprite): boolean {
    const tileX = Number(tile.getData('tileX'));
    const tileY = Number(tile.getData('tileY'));
    return this.level.coinBlocks.some((point) => point.x === tileX && point.y === tileY);
  }

  private isLifeBlock(tile: SolidSprite): boolean {
    const tileX = Number(tile.getData('tileX'));
    const tileY = Number(tile.getData('tileY'));
    return this.level.lifeBlocks.some((point) => point.x === tileX && point.y === tileY);
  }

  private getVineBlock(tile: SolidSprite): VineBlock | undefined {
    const tileX = Number(tile.getData('tileX'));
    const tileY = Number(tile.getData('tileY'));
    return this.level.vineBlocks.find((point) => point.x === tileX && point.y === tileY);
  }

  private spawnVine(tile: SolidSprite, vineBlock: VineBlock): void {
    if (tile.getData('vineSpawned')) {
      return;
    }

    tile.setData('vineSpawned', true);
    const tileX = Number(tile.getData('tileX'));
    const tileY = Number(tile.getData('tileY'));
    const topY = Phaser.Math.Clamp(vineBlock.topY, 0, tileY - 1);
    const bottomY = tileY - 1;
    const x = tileX * TILE_SIZE + TILE_SIZE / 2;
    const startY = tile.y + TILE_SIZE / 2;

    for (let segmentY = bottomY; segmentY >= topY; segmentY -= 1) {
      const delay = (bottomY - segmentY) * 70;
      const targetY = segmentY * TILE_SIZE + TILE_SIZE / 2;
      const vine = this.vines.create(x, startY, 'vine') as VineSprite;
      vine.setDepth(1);
      vine.setAlpha(0);
      vine.setData('readyAt', this.time.now + delay + 120);
      vine.refreshBody();

      this.tweens.add({
        targets: vine,
        y: targetY,
        alpha: 1,
        duration: 190,
        delay,
        ease: 'Quad.out',
        onUpdate: () => vine.refreshBody(),
        onComplete: () => vine.refreshBody()
      });
    }

    this.hud.flash('Vine');
    this.playTone(523.25, 0.08);
    this.playTone(659.25, 0.1, 0.08);
  }

  private handleMultiCoinBlock(tile: SolidSprite): void {
    const now = this.time.now;
    const activeUntil = Number(tile.getData('multiCoinUntil')) || now + MULTI_COIN_BLOCK_WINDOW;
    const hits = Number(tile.getData('multiCoinHits')) || 0;

    if (now > activeUntil || hits >= MULTI_COIN_BLOCK_LIMIT) {
      this.useUpBlock(tile);
      return;
    }

    const nextHits = hits + 1;
    tile.setData('multiCoinUntil', activeUntil);
    tile.setData('multiCoinHits', nextHits);
    this.spawnBlockCoin(tile.x + TILE_SIZE / 2, tile.y);
    this.awardCoin(200, tile.x + TILE_SIZE / 2, tile.y - 8);

    if (nextHits >= MULTI_COIN_BLOCK_LIMIT) {
      this.useUpBlock(tile);
    }
  }

  private updateMultiCoinBlocks(time: number): void {
    for (const child of this.solids.getChildren()) {
      const tile = child as SolidSprite;
      const kind = tile.getData('kind') as SolidKind | 'used';
      const activeUntil = Number(tile.getData('multiCoinUntil')) || 0;

      if ((kind === 'bonus' || kind === 'brick') && activeUntil > 0 && time > activeUntil) {
        this.useUpBlock(tile);
      }
    }
  }

  private useUpBlock(tile: SolidSprite): void {
    if (tile.getData('kind') === 'used') {
      return;
    }

    tile.setData('kind', 'used');
    tile.setTexture(this.getThemedTexture('tile-used', this.getTileThemeForTile(tile)));
    tile.setAlpha(1);
  }

  private bumpTile(tile: SolidSprite): void {
    const homeY = Number(tile.getData('homeY')) || tile.y;
    this.bumpEnemiesAboveTile(tile);
    this.tweens.killTweensOf(tile);
    tile.y = homeY;
    tile.refreshBody();
    this.tweens.add({
      targets: tile,
      y: homeY - BLOCK_BUMP_PIXELS,
      duration: 54,
      yoyo: true,
      hold: 18,
      ease: 'Quad.out',
      onUpdate: () => tile.refreshBody(),
      onComplete: () => {
        tile.y = homeY;
        tile.refreshBody();
      }
    });
  }

  private bumpEnemiesAboveTile(tile: SolidSprite): void {
    const tileLeft = tile.x;
    const tileRight = tile.x + TILE_SIZE;
    const tileTop = tile.y;

    for (const child of this.enemies.getChildren()) {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      if (!enemy.active || !body.enable) {
        continue;
      }

      const overlapsTile = body.right > tileLeft + 2 && body.left < tileRight - 2;
      const standingOnTile = body.bottom >= tileTop - 8 && body.bottom <= tileTop + 10 && body.top < tileTop;
      if (overlapsTile && standingOnTile) {
        this.defeatEnemyFromBlock(enemy);
      }
    }
  }

  private defeatEnemyFromBlock(enemy: Phaser.Physics.Arcade.Sprite): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    if (!enemy.active || !body.enable) {
      return;
    }

    body.enable = false;
    enemy.setVelocity(0, 0);
    enemy.setTint(0xfff08a);
    this.spawnSparkBurst(enemy.x, enemy.y);
    this.awardScore(BLOCK_BUMP_SCORE, enemy.x, enemy.y - 18);
    this.tweens.add({
      targets: enemy,
      y: enemy.y - 28,
      angle: enemy.angle + 180,
      alpha: 0,
      duration: 260,
      ease: 'Quad.out',
      onComplete: () => enemy.disableBody(true, true)
    });
    this.playTone(196, 0.06);
  }

  private breakBrick(tile: SolidSprite): void {
    const tileX = Number(tile.getData('tileX'));
    const tileY = Number(tile.getData('tileY'));
    const homeY = Number(tile.getData('homeY')) || tile.y;
    this.tweens.killTweensOf(tile);
    tile.y = homeY;
    tile.refreshBody();
    this.solidTiles.delete(`${tileX},${tileY}`);
    this.cameras.main.shake(70, 0.0014);
    this.spawnBrickDebris(tile.x, homeY, this.getTileThemeForTile(tile));
    tile.disableBody(true, true);
  }

  private spawnBrickDebris(x: number, y: number, theme: LevelTheme): void {
    const texture = this.getThemedTexture('brick-fragment', theme);
    const pieces = [
      { offsetX: 8, offsetY: 7, velocityX: -145, velocityY: -405, spin: -520 },
      { offsetX: 24, offsetY: 7, velocityX: 145, velocityY: -405, spin: 520 },
      { offsetX: 8, offsetY: 23, velocityX: -105, velocityY: -285, spin: -390 },
      { offsetX: 24, offsetY: 23, velocityX: 105, velocityY: -285, spin: 390 }
    ];

    for (const piece of pieces) {
      const shard = this.physics.add.image(x + piece.offsetX, y + piece.offsetY, texture);
      shard.setDepth(6);
      shard.setVelocity(piece.velocityX, piece.velocityY);
      shard.setGravityY(BRICK_DEBRIS_GRAVITY_Y);
      shard.setAngularVelocity(piece.spin);
      shard.setCollideWorldBounds(false);
      this.tweens.add({
        targets: shard,
        alpha: 0,
        duration: BRICK_DEBRIS_LIFETIME,
        ease: 'Quad.in',
        onComplete: () => shard.destroy()
      });
    }
  }

  private spawnBlockCoin(x: number, y: number): void {
    const coin = this.add.image(x, y, COIN_FRAMES[0]);
    this.tweens.add({
      targets: coin,
      y: y - 42,
      alpha: 0,
      duration: 520,
      ease: 'Quad.out',
      onUpdate: () => {
        const frame = Math.floor(this.time.now / COIN_ANIM_FRAME_MS) % COIN_FRAMES.length;
        coin.setTexture(COIN_FRAMES[frame]);
      },
      onComplete: () => coin.destroy()
    });
  }

  private spawnPowerup(x: number, y: number, kind: PowerupKind): void {
    const textureByKind: Record<PowerupKind, string> = {
      growth: 'powerup',
      spark: 'powerup-spark',
      star: 'powerup-star',
      life: 'powerup-life'
    };
    const texture = textureByKind[kind];
    const powerup = this.powerups.create(x, y + TILE_SIZE / 2, texture) as Phaser.Physics.Arcade.Sprite;
    powerup.setData('kind', kind);
    powerup.setDepth(-1);
    powerup.setVelocity(0, 0);
    powerup.setBounce(kind === 'spark' ? 0 : 1, kind === 'star' ? 0.86 : 0);
    powerup.setMaxVelocity(kind === 'spark' ? 0 : kind === 'star' ? 145 : 110, kind === 'spark' ? 0 : 760);
    const body = powerup.body as Phaser.Physics.Arcade.Body;
    body.setSize(kind === 'star' ? 22 : 24, kind === 'star' ? 22 : 24);
    body.setOffset(kind === 'star' ? 3 : 2, kind === 'star' ? 3 : 2);
    body.allowGravity = kind !== 'spark';
    body.enable = false;
    this.spawnPowerupEmergenceEffect(x, y, kind);
    this.tweens.add({
      targets: powerup,
      y: y - 14,
      duration: POWERUP_EMERGE_DURATION,
      ease: 'Sine.out',
      onComplete: () => {
        powerup.setDepth(2);
        body.enable = true;
        if (kind === 'spark') {
          powerup.setVelocity(0, 0);
        } else {
          powerup.setVelocityX(this.getPowerupSpeed(powerup));
        }
        if (kind === 'star') {
          powerup.setVelocityY(-250);
        }
      }
    });
  }

  private spawnPowerupEmergenceEffect(x: number, y: number, kind: PowerupKind): void {
    const colorByKind: Record<PowerupKind, number> = {
      growth: 0xa8ffe2,
      spark: 0xffe66d,
      star: 0xfff08a,
      life: 0xe9fff1
    };
    const color = colorByKind[kind];
    const flash = this.add.rectangle(x, y - 1, TILE_SIZE * 0.7, 4, color, 0.72).setDepth(4);

    this.tweens.add({
      targets: flash,
      y: y - 14,
      alpha: 0,
      scaleX: 0.65,
      duration: POWERUP_EMERGE_DURATION,
      ease: 'Quad.out',
      onComplete: () => flash.destroy()
    });

    for (let index = 0; index < 3; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const spark = this.add.image(x + side * Phaser.Math.Between(3, 9), y - 4, 'spark').setDepth(5);
      spark.setTint(color);
      spark.setScale(0.95);
      this.tweens.add({
        targets: spark,
        x: spark.x + side * Phaser.Math.Between(7, 14),
        y: y - Phaser.Math.Between(15, 25),
        alpha: 0,
        scale: 0.35,
        duration: 280,
        delay: index * 45,
        ease: 'Quad.out',
        onComplete: () => spark.destroy()
      });
    }
  }

  private getPowerupSpeed(powerup: Phaser.Physics.Arcade.Sprite): number {
    const kind = this.getPowerupKind(powerup);
    if (kind === 'spark') {
      return 0;
    }

    return kind === 'star' ? 125 : 75;
  }

  private getPowerupKind(powerup: Phaser.Physics.Arcade.Sprite): PowerupKind {
    return (powerup.getData('kind') as PowerupKind | undefined) ?? 'growth';
  }

  private collectCoin(coin: Phaser.Physics.Arcade.Image): void {
    const x = coin.x;
    const y = coin.y;
    coin.disableBody(true, true);
    this.spawnCoinCollectBurst(x, y);
    const awardedExtraLife = this.awardCoin(100, x, y - 18);
    if (!awardedExtraLife) {
      this.playTone(1046.5, 0.045);
    }
  }

  private spawnCoinCollectBurst(x: number, y: number): void {
    const pop = this.add.image(x, y, COIN_FRAMES[this.coinFrame >= 0 ? this.coinFrame : 0]).setDepth(5);
    this.tweens.add({
      targets: pop,
      y: y - 20,
      alpha: 0,
      scale: 0.56,
      duration: 260,
      ease: 'Quad.out',
      onUpdate: () => {
        const frame = Math.floor(this.time.now / COIN_ANIM_FRAME_MS) % COIN_FRAMES.length;
        pop.setTexture(COIN_FRAMES[frame]);
      },
      onComplete: () => pop.destroy()
    });

    for (const side of [-1, 1]) {
      const spark = this.add.image(x + side * 8, y - 2, 'spark').setDepth(5).setScale(0.82);
      spark.setTint(0xfff08a);
      this.tweens.add({
        targets: spark,
        x: x + side * 18,
        y: y - 14,
        alpha: 0,
        scale: 0.3,
        duration: 220,
        ease: 'Quad.out',
        onComplete: () => spark.destroy()
      });
    }
  }

  private awardCoin(score: number, x = this.player.x, y = this.player.y - 40): boolean {
    this.runState.coins += 1;
    this.runState.score += score;

    if (this.runState.coins >= 100) {
      this.runState.coins -= 100;
      this.awardExtraLife(x, y);
      return true;
    }

    return false;
  }

  private handleEnemyCollision(enemy: Phaser.Physics.Arcade.Sprite): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
    const kind = this.getEnemyKind(enemy);
    const mode = this.getEnemyMode(enemy);

    if (kind === 'pipePlant' && !this.isPipePlantDangerous(enemy)) {
      return;
    }

    if (this.hasStarPower()) {
      this.defeatEnemyWithStar(enemy);
      return;
    }

    if (kind === 'guardian') {
      if (this.isStompCollision(body, enemyBody)) {
        this.bouncePlayerFromStomp(false);
      }
      this.hurtPlayer('Guardian');
      return;
    }

    if (kind === 'pipePlant') {
      this.hurtPlayer('Snap');
      return;
    }

    if (this.isStompCollision(body, enemyBody)) {
      this.stompEnemy(enemy);
      return;
    }

    if (kind === 'shellback' && mode === 'shell') {
      const direction = this.player.x < enemy.x ? 1 : -1;
      this.kickShell(enemy, direction);
      this.player.setVelocityX(-direction * 150);
      return;
    }

    this.hurtPlayer('Hit');
  }

  private handleCannonShotCollision(shot: CannonShotSprite): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const shotBody = shot.body;

    if (!shot.active || !shotBody.enable) {
      return;
    }

    if (this.hasStarPower()) {
      this.spawnSparkBurst(shot.x, shot.y);
      this.defeatCannonShot(shot, this.nextStarReward(), 0xfff08a);
      return;
    }

    if (this.isStompCollision(body, shotBody)) {
      this.defeatCannonShot(shot, this.nextStompReward(), 0xd8c1ff);
      this.cameras.main.shake(45, 0.0012);
      this.bouncePlayerFromStomp();
      return;
    }

    this.spawnSparkBurst(shot.x, shot.y);
    shot.destroy();
    this.hurtPlayer('Blast');
  }

  private isStompCollision(body: Phaser.Physics.Arcade.Body, enemyBody: Phaser.Physics.Arcade.Body): boolean {
    const previousBottom = body.prev.y + body.height;
    const verticalDrop = body.bottom - previousBottom;
    const crossedEnemyTop = previousBottom <= enemyBody.top + STOMP_CROSSING_TOLERANCE;
    const feetStillOnTop = body.bottom <= enemyBody.top + STOMP_FEET_MAX_DEPTH;
    const playerCenterX = (body.left + body.right) / 2;
    const horizontalInset = Math.min(STOMP_HORIZONTAL_INSET, Math.max(2, enemyBody.width * 0.3));
    const playerCenteredOverEnemy =
      playerCenterX > enemyBody.left + horizontalInset && playerCenterX < enemyBody.right - horizontalInset;
    const horizontalOverlap = body.right > enemyBody.left + horizontalInset && body.left < enemyBody.right - horizontalInset;
    const hasDownwardMomentum =
      verticalDrop >= STOMP_MIN_DROP_PIXELS ||
      body.velocity.y >= STOMP_MIN_DESCENT_VELOCITY ||
      this.previousPlayerVelocityY >= STOMP_MIN_DESCENT_VELOCITY;
    const sideContactTooDeep =
      (body.touching.left || body.touching.right || body.blocked.left || body.blocked.right) &&
      body.bottom > enemyBody.top + STOMP_SIDE_CONTACT_MAX_DEPTH;

    return (
      hasDownwardMomentum &&
      !sideContactTooDeep &&
      crossedEnemyTop &&
      feetStillOnTop &&
      horizontalOverlap &&
      playerCenteredOverEnemy
    );
  }

  private stompEnemy(enemy: Phaser.Physics.Arcade.Sprite): void {
    const kind = this.getEnemyKind(enemy);
    const mode = this.getEnemyMode(enemy);
    const stompReward = this.nextStompReward();

    if (kind === 'wingShellback') {
      this.stripWingShellback(enemy, stompReward);
      this.cameras.main.shake(55, 0.0015);
      this.bouncePlayerFromStomp();
      return;
    }

    if (kind === 'shellback') {
      if (mode === 'walking') {
        this.tuckEnemyIntoShell(enemy, stompReward);
      } else if (mode === 'sliding') {
        this.stopShell(enemy, stompReward);
      } else {
        const direction = this.player.x < enemy.x ? 1 : -1;
        this.kickShell(enemy, direction, stompReward);
      }

      this.cameras.main.shake(55, 0.0015);
      this.bouncePlayerFromStomp();
      return;
    }

    this.defeatEnemy(enemy, stompReward, 0xd8c1ff, kind === 'wobbler');
    this.cameras.main.shake(55, 0.0015);
    this.bouncePlayerFromStomp();
  }

  private bouncePlayerFromStomp(allowHeldBoost = true): void {
    const holdingJump = this.controls.cursors.up.isDown || this.controls.jump.isDown || this.controls.jumpAlt.isDown;
    this.player.setVelocityY(allowHeldBoost && holdingJump ? STOMP_HELD_BOUNCE_VELOCITY : STOMP_BOUNCE_VELOCITY);
    this.jumpBufferedUntil = 0;
    this.coyoteUntil = 0;
    this.wasOnGround = false;
    this.previousPlayerVelocityY = 0;
  }

  private stripWingShellback(enemy: Phaser.Physics.Arcade.Sprite, reward: ComboReward): void {
    const direction = Number(enemy.getData('direction')) || (this.player.x < enemy.x ? -1 : 1);

    enemy.setData('kind', 'shellback' satisfies EnemyKind);
    enemy.setData('mode', 'walking' satisfies EnemyMode);
    enemy.setTexture('enemy-shellback');
    enemy.setVelocityX(direction * WALKING_ENEMY_SPEED);
    enemy.setVelocityY(-120);
    enemy.setAngle(0);
    enemy.setTint(0xffffff);
    this.configureEnemyBody(enemy, 'walking');
    this.spawnSparkBurst(enemy.x, enemy.y - 12);
    this.awardComboReward(reward, enemy.x, enemy.y - 20);
    if (reward !== '1up') {
      this.hud.flash('Wings clipped');
    }
    this.playTone(392, 0.07);
  }

  private nextStompReward(): ComboReward {
    const score = this.stompChain >= STOMP_SCORE_TABLE.length ? '1up' : STOMP_SCORE_TABLE[this.stompChain];
    this.stompChain += 1;
    return score;
  }

  private nextStarReward(): ComboReward {
    const score = this.starChain >= STAR_SCORE_TABLE.length ? '1up' : STAR_SCORE_TABLE[this.starChain];
    this.starChain += 1;
    return score;
  }

  private defeatEnemyWithStar(enemy: Phaser.Physics.Arcade.Sprite): void {
    const launchDirection = enemy.x < this.player.x ? -1 : 1;

    this.spawnSparkBurst(enemy.x, enemy.y);
    this.launchStarDefeatedEnemy(enemy, launchDirection);
    this.cameras.main.shake(45, 0.0012);
    this.playTone(1567.98, 0.045);
  }

  private launchStarDefeatedEnemy(enemy: Phaser.Physics.Arcade.Sprite, direction: number): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    if (!enemy.active || !body.enable) {
      return;
    }

    const reward = this.nextStarReward();
    body.enable = false;
    enemy.setVelocity(0, 0);
    enemy.setTint(0xfff08a);
    enemy.setDepth(6);
    this.awardComboReward(reward, enemy.x, enemy.y - 18);

    const startX = enemy.x;
    const startY = enemy.y;
    this.tweens.add({
      targets: enemy,
      x: startX + direction * 24,
      y: startY - 42,
      angle: enemy.angle + direction * 170,
      duration: 150,
      ease: 'Quad.out',
      onComplete: () => {
        this.tweens.add({
          targets: enemy,
          x: startX + direction * 64,
          y: startY + 78,
          angle: enemy.angle + direction * 260,
          alpha: 0,
          duration: 280,
          ease: 'Quad.in',
          onComplete: () => enemy.disableBody(true, true)
        });
      }
    });
  }

  private tuckEnemyIntoShell(enemy: Phaser.Physics.Arcade.Sprite, reward: ComboReward = 100): void {
    enemy.setData('mode', 'shell' satisfies EnemyMode);
    enemy.setTexture('enemy-shell');
    enemy.setVelocityX(0);
    enemy.setAngle(0);
    enemy.setTint(0xffffff);
    enemy.setData('shellHits', 0);
    enemy.setData('shellEnteredAt', this.time.now);
    this.configureEnemyBody(enemy, 'shell');
    this.awardComboReward(reward, enemy.x, enemy.y - 18);
    if (reward !== '1up') {
      this.hud.flash('Shell');
    }
    this.playTone(246.94, 0.08);
  }

  private kickShell(enemy: Phaser.Physics.Arcade.Sprite, direction: number, reward: ComboReward = 100): void {
    const shellDirection = direction || 1;
    enemy.setData('mode', 'sliding' satisfies EnemyMode);
    enemy.setData('direction', shellDirection);
    enemy.setData('shellHits', 0);
    enemy.setData('shellEnteredAt', 0);
    enemy.setTexture('enemy-shell');
    enemy.setVelocityX(shellDirection * SHELL_SLIDE_SPEED);
    enemy.setAngle(0);
    enemy.setTint(0xffffff);
    this.configureEnemyBody(enemy, 'sliding');
    this.awardComboReward(reward, enemy.x, enemy.y - 18);
    if (reward !== '1up') {
      this.hud.flash('Kick');
    }
    this.playTone(329.63, 0.07);
  }

  private stopShell(enemy: Phaser.Physics.Arcade.Sprite, reward: ComboReward = 100): void {
    enemy.setData('mode', 'shell' satisfies EnemyMode);
    enemy.setData('shellHits', 0);
    enemy.setData('shellEnteredAt', this.time.now);
    enemy.setTexture('enemy-shell');
    enemy.setVelocityX(0);
    enemy.setAngle(0);
    this.configureEnemyBody(enemy, 'shell');
    this.awardComboReward(reward, enemy.x, enemy.y - 18);
    if (reward !== '1up') {
      this.hud.flash('Stopped');
    }
    this.playTone(220, 0.06);
  }

  private wakeShellback(enemy: Phaser.Physics.Arcade.Sprite): void {
    const direction = Number(enemy.getData('direction')) || (this.player.x < enemy.x ? -1 : 1);
    enemy.setData('mode', 'walking' satisfies EnemyMode);
    enemy.setData('shellEnteredAt', 0);
    enemy.setData('shellHits', 0);
    enemy.setTexture('enemy-shellback');
    enemy.setVelocityX(direction * WALKING_ENEMY_SPEED);
    enemy.setVelocityY(-95);
    enemy.setAngle(0);
    enemy.setTint(0xffffff);
    enemy.setFlipX(direction > 0);
    this.configureEnemyBody(enemy, 'walking');
    this.spawnDustPuff(enemy.x, enemy.y + 11, -direction, 0.72, 0);
    this.playTone(293.66, 0.055);
  }

  private defeatEnemy(
    enemy: Phaser.Physics.Arcade.Sprite,
    reward: ComboReward,
    tint: number,
    crushed = false
  ): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    if (!enemy.active || !body.enable) {
      return;
    }

    body.enable = false;
    enemy.setVelocity(0, 0);
    if (crushed) {
      enemy.setTexture('enemy-crushed');
      enemy.setOrigin(0.5, 1);
      enemy.y += 12;
      this.spawnDustPuff(enemy.x - 10, enemy.y + 3, -1, 0.58, 0);
      this.spawnDustPuff(enemy.x + 10, enemy.y + 3, 1, 0.58, 24);
    }
    enemy.setTint(tint);
    this.tweens.add({
      targets: enemy,
      scaleY: crushed ? 1 : 0.35,
      alpha: 0,
      y: enemy.y + (crushed ? 5 : 8),
      delay: crushed ? STOMPED_ENEMY_HOLD_MS : 0,
      duration: crushed ? STOMPED_ENEMY_FADE_MS : 150,
      ease: 'Quad.out',
      onComplete: () => {
        enemy.setOrigin(0.5, 0.5);
        enemy.disableBody(true, true);
      }
    });
    this.awardComboReward(reward, enemy.x, enemy.y - 18);
    this.playTone(246.94, 0.08);
  }

  private handleEnemyEnemyCollision(enemyA: Phaser.Physics.Arcade.Sprite, enemyB: Phaser.Physics.Arcade.Sprite): void {
    if (enemyA === enemyB || !enemyA.active || !enemyB.active) {
      return;
    }

    const bodyA = enemyA.body as Phaser.Physics.Arcade.Body;
    const bodyB = enemyB.body as Phaser.Physics.Arcade.Body;
    if (!bodyA.enable || !bodyB.enable) {
      return;
    }

    const aIsSlidingShell = this.getEnemyKind(enemyA) === 'shellback' && this.getEnemyMode(enemyA) === 'sliding';
    const bIsSlidingShell = this.getEnemyKind(enemyB) === 'shellback' && this.getEnemyMode(enemyB) === 'sliding';

    if (aIsSlidingShell && bIsSlidingShell) {
      const directionA = Math.sign(bodyA.velocity.x) || -1;
      const directionB = Math.sign(bodyB.velocity.x) || 1;
      enemyA.setVelocityX(-directionA * SHELL_SLIDE_SPEED);
      enemyA.setData('direction', -directionA);
      enemyB.setVelocityX(-directionB * SHELL_SLIDE_SPEED);
      enemyB.setData('direction', -directionB);
      return;
    }

    if (aIsSlidingShell) {
      this.defeatEnemyWithShell(enemyB, enemyA);
    } else if (bIsSlidingShell) {
      this.defeatEnemyWithShell(enemyA, enemyB);
    }
  }

  private defeatEnemyWithShell(target: Phaser.Physics.Arcade.Sprite, shell: Phaser.Physics.Arcade.Sprite): void {
    if (!target.active || target === shell) {
      return;
    }

    this.spawnSparkBurst(target.x, target.y);
    this.defeatEnemy(target, this.nextShellReward(shell), 0xffe66d);
    const shellBody = shell.body as Phaser.Physics.Arcade.Body;
    const direction = Math.sign(shellBody.velocity.x) || Number(shell.getData('direction')) || 1;
    shell.setVelocityX(direction * SHELL_SLIDE_SPEED);
    shell.setData('direction', direction);
    this.cameras.main.shake(50, 0.0014);
  }

  private nextShellReward(shell: Phaser.Physics.Arcade.Sprite): ComboReward {
    const shellHits = Number(shell.getData('shellHits')) || 0;
    const score = shellHits >= SHELL_SCORE_TABLE.length ? '1up' : SHELL_SCORE_TABLE[shellHits];
    shell.setData('shellHits', shellHits + 1);
    return score;
  }

  private handlePowerupSolidCollision(powerup: Phaser.Physics.Arcade.Sprite, tile: SolidSprite): void {
    const body = powerup.body as Phaser.Physics.Arcade.Body;
    const tileKind = tile.getData('kind') as SolidKind | 'used';
    if (this.getPowerupKind(powerup) === 'spark') {
      powerup.setVelocity(0, 0);
      return;
    }

    if ((body.blocked.left || body.touching.left) && tileKind !== 'ground') {
      powerup.setVelocityX(this.getPowerupSpeed(powerup));
    } else if ((body.blocked.right || body.touching.right) && tileKind !== 'ground') {
      powerup.setVelocityX(-this.getPowerupSpeed(powerup));
    }
  }

  private handleProjectileSolidCollision(projectile: Phaser.Physics.Arcade.Sprite, _tile: SolidSprite): void {
    if (!projectile.active) {
      return;
    }

    const body = projectile.body as Phaser.Physics.Arcade.Body;
    const now = this.time.now;
    if (body.blocked.left || body.blocked.right || body.touching.left || body.touching.right) {
      this.spawnSparkBurst(projectile.x, projectile.y);
      projectile.destroy();
      return;
    }

    if (body.blocked.down || body.touching.down) {
      const lastBounceAt = Number(projectile.getData('lastBounceAt')) || 0;
      if (now < lastBounceAt + PROJECTILE_BOUNCE_COOLDOWN) {
        return;
      }

      const bounces = Number(projectile.getData('groundBounces')) || 0;
      if (bounces >= PROJECTILE_MAX_GROUND_BOUNCES) {
        this.spawnSparkBurst(projectile.x, projectile.y);
        projectile.destroy();
        return;
      }

      const direction = Number(projectile.getData('direction')) || Math.sign(body.velocity.x) || 1;
      projectile.setData('groundBounces', bounces + 1);
      projectile.setData('lastBounceAt', now);
      projectile.setVelocityX(direction * PROJECTILE_SPEED);
      projectile.setVelocityY(PROJECTILE_BOUNCE_Y);
      this.spawnDustPuff(projectile.x, projectile.y + 7, -direction, 0.45, 0);
    } else if (body.blocked.up || body.touching.up) {
      projectile.setVelocityY(130);
    }
  }

  private hitEnemyWithProjectile(projectile: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite): void {
    if (!projectile.active || !enemy.active) {
      return;
    }

    if (this.getEnemyKind(enemy) === 'pipePlant' && !this.isPipePlantDangerous(enemy)) {
      return;
    }

    this.spawnSparkBurst(projectile.x, projectile.y);
    projectile.destroy();
    if (this.getEnemyKind(enemy) === 'guardian') {
      this.damageGuardian(enemy, 500);
      return;
    }

    this.defeatEnemy(enemy, 200, 0xffe66d);
    this.cameras.main.shake(45, 0.0012);
  }

  private hitCannonShotWithProjectile(projectile: Phaser.Physics.Arcade.Sprite, shot: CannonShotSprite): void {
    if (!projectile.active || !shot.active) {
      return;
    }

    this.spawnSparkBurst(projectile.x, projectile.y);
    projectile.destroy();
    this.defeatCannonShot(shot, 200, 0xffe66d);
  }

  private hitEnemyProjectileWithSpark(
    projectile: Phaser.Physics.Arcade.Sprite,
    enemyProjectile: EnemyProjectileSprite
  ): void {
    if (!projectile.active || !enemyProjectile.active) {
      return;
    }

    this.spawnSparkBurst(enemyProjectile.x, enemyProjectile.y);
    projectile.destroy();
    enemyProjectile.destroy();
    this.awardScore(100, enemyProjectile.x, enemyProjectile.y - 18);
    this.playTone(440, 0.04);
  }

  private handleEnemyProjectileCollision(projectile: EnemyProjectileSprite): void {
    if (!projectile.active) {
      return;
    }

    this.spawnSparkBurst(projectile.x, projectile.y);
    projectile.destroy();
    if (this.hasStarPower()) {
      this.awardScore(100, projectile.x, projectile.y - 18);
      return;
    }

    this.hurtPlayer('Hammer');
  }

  private handleLavaBubbleCollision(bubble: LavaBubbleSprite): void {
    if (!bubble.active || !bubble.body.enable) {
      return;
    }

    if (this.hasStarPower()) {
      this.spawnSparkBurst(bubble.x, bubble.y);
      bubble.disableBody(true, true);
      bubble.setData('nextLaunchAt', this.time.now + 900);
      this.awardScore(100, bubble.x, bubble.y - 18);
      return;
    }

    this.hurtPlayer('Lava bubble');
  }

  private destroyEnemyProjectile(projectile: EnemyProjectileSprite): void {
    if (!projectile.active) {
      return;
    }

    this.spawnSparkBurst(projectile.x, projectile.y);
    projectile.destroy();
  }

  private defeatCannonShot(shot: CannonShotSprite, reward: ComboReward, tint: number): void {
    const body = shot.body;
    if (!shot.active || !body.enable) {
      return;
    }

    body.enable = false;
    shot.setVelocity(0, 0);
    shot.setTint(tint);
    this.awardComboReward(reward, shot.x, shot.y - 18);
    this.playTone(246.94, 0.06);
    this.tweens.add({
      targets: shot,
      y: shot.y - 24,
      alpha: 0,
      angle: shot.angle + 180,
      duration: 220,
      ease: 'Quad.out',
      onComplete: () => shot.disableBody(true, true)
    });
  }

  private damageGuardian(enemy: Phaser.Physics.Arcade.Sprite, score: number): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    if (!enemy.active || !body.enable) {
      return;
    }

    const nextHp = Math.max(0, (Number(enemy.getData('hp')) || 1) - 1);
    enemy.setData('hp', nextHp);
    enemy.setTint(0xfff08a);
    this.time.delayedCall(100, () => {
      if (enemy.active) {
        enemy.clearTint();
      }
    });
    this.awardScore(score, enemy.x, enemy.y - 32);
    this.cameras.main.shake(70, 0.0016);
    this.playTone(196, 0.06);

    if (nextHp <= 0) {
      this.defeatEnemy(enemy, 1000, 0xffe66d);
    }
  }

  private spawnSparkBurst(x: number, y: number): void {
    for (let index = 0; index < 4; index += 1) {
      const spark = this.add.image(x, y, 'spark').setDepth(5);
      this.tweens.add({
        targets: spark,
        x: x + Phaser.Math.Between(-22, 22),
        y: y + Phaser.Math.Between(-24, 12),
        alpha: 0,
        duration: 220,
        ease: 'Quad.out',
        onComplete: () => spark.destroy()
      });
    }
  }

  private collectPowerup(powerup: Phaser.Physics.Arcade.Sprite): void {
    const x = powerup.x;
    const y = powerup.y;
    powerup.disableBody(true, true);
    const kind = (powerup.getData('kind') as PowerupKind | undefined) ?? 'growth';
    this.awardScore(1000, x, y - 18);
    if (kind === 'star') {
      this.startStarPower();
      return;
    }

    if (kind === 'life') {
      this.awardExtraLife(x, y - 22);
      return;
    }

    if (kind === 'spark' && this.hasSpark) {
      this.hud.flash('Spark bonus');
      this.playTone(987.77, 0.07);
      this.playTone(1318.51, 0.09, 0.07);
      return;
    }

    const wasPowered = this.isPowered;
    this.isPowered = true;
    if (kind === 'spark') {
      this.hasSpark = true;
    }
    this.startPowerUpTransition(kind, wasPowered);
  }

  private applyPlayerPowerState(animate: boolean, visualPowered = this.isPowered, preserveBottom = true): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const previousBottom = body.bottom;
    if (!this.isPowered) {
      this.isCrouching = false;
    }

    const crouching = visualPowered && this.isPowered && this.isCrouching;
    const scaleX = crouching ? CROUCH_PET_SCALE_X : visualPowered ? POWERED_PET_SCALE : PET_SCALE;
    const scaleY = crouching ? CROUCH_PET_SCALE_Y : visualPowered ? POWERED_PET_SCALE : PET_SCALE;
    const bodyHeight = visualPowered
      ? crouching
        ? PLAYER_CROUCH_BODY_HEIGHT
        : PLAYER_POWERED_BODY_HEIGHT
      : PLAYER_SMALL_BODY_HEIGHT;
    const bodyOffsetY = visualPowered
      ? crouching
        ? PLAYER_CROUCH_BODY_OFFSET_Y
        : PLAYER_POWERED_BODY_OFFSET_Y
      : PLAYER_SMALL_BODY_OFFSET_Y;

    if (animate) {
      this.tweens.add({
        targets: this.player,
        scaleX,
        scaleY,
        duration: 180,
        ease: 'Back.out'
      });
    } else {
      this.player.setScale(scaleX, scaleY);
    }

    body.setSize(PLAYER_BODY_WIDTH, bodyHeight);
    body.setOffset(PLAYER_BODY_OFFSET_X, bodyOffsetY);

    if (preserveBottom) {
      const bottomOffset = (bodyOffsetY + bodyHeight - PET_FRAME_HEIGHT * this.player.originY) * scaleY;
      this.player.y = previousBottom - bottomOffset;
      body.updateFromGameObject();
    }

    this.refreshPlayerTint();
  }

  private startPowerUpTransition(kind: PowerupKind, wasPowered: boolean): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const isGrowth = kind === 'growth' && !wasPowered;
    const message = kind === 'spark' ? 'Spark power' : 'Power up';
    this.stopGameplayMusic(false);
    this.releaseVine(body);
    this.isPowerTransitioning = true;
    this.isCrouching = false;
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.player.setAlpha(1);
    this.tweens.killTweensOf(this.player);
    this.physics.pause();
    this.hud.flash(message);
    this.playTone(659.25, 0.08);
    this.playTone(987.77, 0.1, 0.08);

    const steps = Math.ceil(POWER_TRANSITION_DURATION / POWER_TRANSITION_STEP_MS);
    for (let step = 0; step < steps; step += 1) {
      this.time.delayedCall(step * POWER_TRANSITION_STEP_MS, () => {
        if (this.isFinished || !this.isPowerTransitioning) {
          return;
        }

        if (isGrowth) {
          this.applyPlayerPowerState(false, step % 2 === 1);
        } else {
          this.applyPlayerPowerState(false, true);
          this.player.setTintFill(step % 2 === 0 ? 0xffffff : 0xa8fff2);
        }
      });
    }

    this.time.delayedCall(POWER_TRANSITION_DURATION, () => {
      if (this.isFinished) {
        return;
      }

      this.isPowerTransitioning = false;
      this.applyPlayerPowerState(false);
      this.player.setAlpha(1);
      this.refreshPlayerTint();
      this.physics.resume();
      this.startGameplayMusic();
    });
  }

  private hurtPlayer(reason: string): void {
    if (this.isFinished || this.isLifeLossAnimating || this.time.now < this.invulnerableUntil) {
      return;
    }

    if (this.hasStarPower() && reason !== 'Time' && reason !== 'Mind the gap') {
      return;
    }

    this.stompChain = 0;
    this.starChain = 0;

    if (this.hasSpark && reason !== 'Time' && reason !== 'Mind the gap') {
      this.hasSpark = false;
      this.startPowerDownRecovery('Spark lost');
      return;
    }

    if (this.isPowered && reason !== 'Time' && reason !== 'Mind the gap') {
      this.isPowered = false;
      this.startPowerDownRecovery('Power down');
      return;
    }

    this.runState.lives -= 1;
    this.stopGameplayMusic(true);
    this.playTone(130.81, 0.14);
    this.startLifeLossSequence(reason, this.runState.lives <= 0);
  }

  private startLifeLossSequence(reason: string, willGameOver: boolean): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.releaseVine(body);
    this.isLifeLossAnimating = true;
    this.isCrouching = false;
    this.isPowered = false;
    this.hasSpark = false;
    this.starPowerUntil = 0;
    this.starChain = 0;
    this.invulnerableUntil = this.time.now + LIFE_LOSS_HOP_DURATION + LIFE_LOSS_FALL_DURATION + 500;
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.player.setAlpha(1);
    this.player.clearTint();
    this.player.setFlipX(false);
    this.player.play('pet-failed', true);
    this.tweens.killTweensOf(this.player);
    this.physics.pause();
    this.hud.flash(reason === 'Time' ? 'Time up' : reason);
    this.updateHud();
    this.cameras.main.shake(120, 0.0018);

    const startY = this.player.y;
    this.tweens.add({
      targets: this.player,
      y: startY - LIFE_LOSS_HOP_HEIGHT,
      duration: LIFE_LOSS_HOP_DURATION,
      ease: 'Quad.out',
      onComplete: () => {
        this.tweens.add({
          targets: this.player,
          y: startY + LIFE_LOSS_FALL_DISTANCE,
          alpha: 0.35,
          duration: LIFE_LOSS_FALL_DURATION,
          ease: 'Quad.in',
          onComplete: () => {
            this.isLifeLossAnimating = false;
            this.player.setAlpha(1);
            if (willGameOver) {
              this.runState.lives = Math.max(0, this.runState.lives);
              this.gameOver();
              return;
            }

            this.restartCourseAfterLifeLoss();
          }
        });
      }
    });
  }

  private restartCourseAfterLifeLoss(): void {
    this.scene.restart({
      autoStart: false,
      levelIndex: this.levelIndex,
      respawnAtCheckpoint: this.checkpointReached,
      carry: {
        score: this.runState.score,
        coins: this.runState.coins,
        lives: Math.max(0, this.runState.lives),
        powered: false,
        sparked: false
      }
    });
  }

  private startPowerDownRecovery(message: string): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.stopGameplayMusic(false);
    this.releaseVine(body);
    this.isDamageRecovering = true;
    this.isCrouching = false;
    this.invulnerableUntil = this.time.now + DAMAGE_INVULNERABLE_DURATION;
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.player.setAlpha(1);
    this.physics.pause();
    this.applyPlayerPowerState(true);
    this.cameras.main.shake(130, 0.0025);
    this.hud.flash(message);
    this.playTone(196, 0.08);
    this.playTone(146.83, 0.1, 0.08);

    this.player.setTintFill(0xffffff);
    this.time.delayedCall(70, () => {
      if (!this.isFinished && this.isDamageRecovering) {
        this.refreshPlayerTint();
      }
    });

    this.time.delayedCall(DAMAGE_HITSTOP_DURATION, () => {
      if (this.isFinished) {
        return;
      }

      this.isDamageRecovering = false;
      this.physics.resume();
      this.player.setAlpha(1);
      this.player.setVelocityY(-190);
      this.refreshPlayerTint();
      this.startGameplayMusic();
    });
  }

  private finishLevel(): void {
    if (this.isFinished || !this.isStarted) {
      return;
    }

    if (this.isFortressFinale()) {
      this.finishFortressLevel();
      return;
    }

    if (this.isPipeExitLevel()) {
      this.finishPipeExitLevel();
      return;
    }

    this.isFinished = true;
    this.stopGameplayMusic(true);
    this.stompChain = 0;
    this.starChain = 0;
    this.hud.setTimeWarning(false);
    const flagBonus = this.calculateFlagBonus();
    const flagFireworkCount = this.getFlagFireworkCount(this.runState.time);
    this.runState.score += flagBonus;
    this.showScorePopup(flagBonus, this.level.goal.x * TILE_SIZE + 18, this.player.y - 24);
    this.spawnFlagScoreBurst(this.level.goal.x * TILE_SIZE + 18, this.player.y - 24);
    this.hud.flash(`${flagBonus}`);
    this.cannonShots.clear(true, true);
    this.enemyProjectiles.clear(true, true);
    this.guardianFireballs.clear(true, true);
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.player.setFlipX(false);
    this.player.setAlpha(1);
    this.player.clearTint();
    this.setPlayerJumpPose(1);
    this.slideFlagToBase(() => {
      this.runPlayerToGoalHouse(() => {
        this.launchFlagFireworks(flagFireworkCount, () => {
          this.convertTimeBonusToScore(() => this.showClearOverlay());
        });
      });
    });
    this.physics.pause();
    this.updateHud();
    this.playTone(523.25, 0.08);
    this.playTone(783.99, 0.1, 0.09);
  }

  private finishPipeExitLevel(): void {
    this.isFinished = true;
    this.stopGameplayMusic(true);
    this.stompChain = 0;
    this.starChain = 0;
    this.hud.setTimeWarning(false);
    this.cannonShots.clear(true, true);
    this.enemyProjectiles.clear(true, true);
    this.guardianFireballs.clear(true, true);
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.player.setFlipX(false);
    this.player.setAlpha(1);
    this.player.clearTint();
    this.physics.pause();
    this.hud.flash('Exit pipe');
    this.updateHud();
    this.playTone(523.25, 0.08);
    this.playTone(659.25, 0.08, 0.08);
    this.runPlayerIntoExitPipe(() => {
      this.convertTimeBonusToScore(() => this.showClearOverlay());
    });
  }

  private finishFortressLevel(): void {
    this.isFinished = true;
    this.stopGameplayMusic(true);
    this.stompChain = 0;
    this.starChain = 0;
    this.hud.setTimeWarning(false);
    this.guardianFireballs.clear(true, true);
    this.cannonShots.clear(true, true);
    this.enemyProjectiles.clear(true, true);
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.player.setFlipX(false);
    this.player.setAlpha(1);
    this.player.clearTint();
    this.player.play('pet-idle', true);
    this.physics.pause();
    this.activateFortressSwitch();
    this.defeatFortressGuardians();
    this.updateHud();
    this.hud.flash('Gate switch');
    this.playTone(523.25, 0.08);
    this.playTone(659.25, 0.08, 0.08);
    this.playTone(783.99, 0.1, 0.16);

    this.time.delayedCall(760, () => {
      this.convertTimeBonusToScore(() => this.showClearOverlay());
    });
  }

  private activateFortressSwitch(): void {
    if (this.fortressSwitch) {
      this.fortressSwitch.setTexture('gate-switch-down');
      this.tweens.add({
        targets: this.fortressSwitch,
        y: this.fortressSwitch.y + 5,
        duration: 90,
        ease: 'Quad.out'
      });
    }

    this.fortressBridgePieces.forEach((piece, index) => {
      this.tweens.add({
        targets: piece,
        y: piece.y + 80,
        alpha: 0,
        angle: Phaser.Math.Between(-30, 30),
        duration: 360,
        delay: index * 35,
        ease: 'Quad.in',
        onComplete: () => piece.destroy()
      });
    });
  }

  private defeatFortressGuardians(): void {
    for (const child of this.enemies.getChildren()) {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (this.getEnemyKind(enemy) === 'guardian' && enemy.active) {
        this.spawnSparkBurst(enemy.x, enemy.y);
        this.defeatEnemy(enemy, 2000, 0xffe66d);
      }
    }
  }

  private calculateFlagBonus(): number {
    const poleTop = this.level.goal.y * TILE_SIZE;
    const poleBase = (this.level.height - 2) * TILE_SIZE;
    const normalizedHeight = Phaser.Math.Clamp((poleBase - this.player.y) / (poleBase - poleTop), 0, 1);

    if (normalizedHeight >= 0.92) {
      return 5000;
    }

    if (normalizedHeight >= 0.74) {
      return 2000;
    }

    if (normalizedHeight >= 0.5) {
      return 800;
    }

    if (normalizedHeight >= 0.25) {
      return 400;
    }

    return 100;
  }

  private getFlagFireworkCount(time: number): number {
    const finalDigit = time % 10;
    return finalDigit === 1 || finalDigit === 3 || finalDigit === 6 ? finalDigit : 0;
  }

  private launchFlagFireworks(count: number, onComplete: () => void): void {
    if (count <= 0) {
      onComplete();
      return;
    }

    this.hud.flash(`${count} fireworks`);
    for (let index = 0; index < count; index += 1) {
      this.time.delayedCall(index * FLAG_FIREWORK_DELAY, () => {
        const x = this.goalHouseX + Phaser.Math.Between(-34, 34);
        const y = (this.level.height - 9) * TILE_SIZE + Phaser.Math.Between(-28, 28);
        this.spawnFlagFirework(x, y);
        this.runState.score += FLAG_FIREWORK_SCORE;
        this.updateHud();
        this.showScorePopup(FLAG_FIREWORK_SCORE, x, y + 20);
        this.playTone(784, 0.045);
        this.playTone(1174.66, 0.055, 0.05);
      });
    }

    this.time.delayedCall(count * FLAG_FIREWORK_DELAY + 220, onComplete);
  }

  private spawnFlagScoreBurst(x: number, y: number): void {
    const burst = this.add.circle(x, y, 5, 0xffffff, 0.86).setDepth(12);
    this.tweens.add({
      targets: burst,
      scale: 2.2,
      alpha: 0,
      duration: 230,
      ease: 'Quad.out',
      onComplete: () => burst.destroy()
    });

    const colors = [0xffffff, 0xfff08a, 0x83f56c];
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8;
      const spark = this.add.image(x, y, 'spark').setDepth(12).setScale(1.05);
      spark.setTint(colors[index % colors.length]);
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 18,
        alpha: 0,
        scale: 0.28,
        duration: 340,
        ease: 'Quad.out',
        onComplete: () => spark.destroy()
      });
    }
  }

  private spawnFlagFirework(x: number, y: number): void {
    const flash = this.add.circle(x, y, 6, 0xffffff, 0.85).setDepth(12);
    this.tweens.add({
      targets: flash,
      scale: 2.4,
      alpha: 0,
      duration: 240,
      ease: 'Quad.out',
      onComplete: () => flash.destroy()
    });

    const colors = [0xfff08a, 0xff7b54, 0xa8fff2, 0xf8fbff];
    for (let index = 0; index < 12; index += 1) {
      const angle = (Math.PI * 2 * index) / 12 + Phaser.Math.FloatBetween(-0.12, 0.12);
      const distance = Phaser.Math.Between(24, 48);
      const spark = this.add.image(x, y, 'spark').setDepth(12).setScale(1.5);
      spark.setTint(colors[index % colors.length]);
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.35,
        duration: 460,
        ease: 'Quad.out',
        onComplete: () => spark.destroy()
      });
    }
  }

  private showScorePopup(score: number | string, x: number, y: number): void {
    const label = score.toString();
    const isExtraLife = label.toLowerCase().includes('1-up');
    const popup = this.add
      .text(x, y, label.toUpperCase(), {
        color: isExtraLife ? '#83f56c' : '#ffffff',
        fontFamily: '"Courier New", "SFMono-Regular", Consolas, monospace',
        fontSize: isExtraLife ? '17px' : '16px',
        fontStyle: 'bold',
        stroke: '#111927',
        strokeThickness: 3
      })
      .setOrigin(0.5)
      .setDepth(12);

    this.tweens.add({
      targets: popup,
      y: y - 28,
      alpha: 0,
      duration: 620,
      ease: 'Quad.out',
      onComplete: () => popup.destroy()
    });
  }

  private showClearOverlay(): void {
    const nextLevel = LEVELS[this.levelIndex + 1];
    if (nextLevel) {
      this.hud.showCourseClear(this.level.world, nextLevel.world, () => this.advanceLevel());
    } else {
      this.hud.showAdventureClear(() => this.restartRun());
    }
  }

  private advanceLevel(): void {
    this.scene.restart({
      autoStart: false,
      levelIndex: this.levelIndex + 1,
      carry: this.snapshotCarryState()
    });
  }

  private snapshotCarryState(): RunCarryState {
    return {
      score: this.runState.score,
      coins: this.runState.coins,
      lives: this.runState.lives,
      powered: this.isPowered,
      sparked: this.hasSpark
    };
  }

  private slideFlagToBase(onComplete: () => void): void {
    const poleX = this.level.goal.x * TILE_SIZE;
    const baseY = (this.level.height - 2) * TILE_SIZE - 24;
    const grabX = poleX + FLAG_POLE_GRAB_OFFSET_X;
    const dismountX = poleX + FLAG_DISMOUNT_OFFSET_X;
    const playerBaseY = baseY + FLAG_PLAYER_BASE_OFFSET_Y;

    this.player.setFlipX(false);
    this.tweens.add({
      targets: this.flag,
      y: baseY,
      duration: FLAG_SLIDE_DURATION,
      ease: 'Sine.inOut'
    });
    this.tweens.add({
      targets: this.player,
      x: grabX,
      y: playerBaseY,
      duration: FLAG_SLIDE_DURATION,
      ease: 'Sine.inOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.player,
          x: dismountX,
          y: playerBaseY - FLAG_DISMOUNT_HOP_HEIGHT,
          duration: FLAG_DISMOUNT_HOP_DURATION,
          ease: 'Quad.out',
          onComplete: () => {
            this.tweens.add({
              targets: this.player,
              y: playerBaseY,
              duration: FLAG_DISMOUNT_SETTLE_DURATION,
              ease: 'Quad.in',
              onComplete: () => {
                this.time.delayedCall(60, onComplete);
              }
            });
          }
        });
      }
    });
  }

  private runPlayerIntoExitPipe(onComplete: () => void): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const pipeCenterX = this.level.goal.x * TILE_SIZE + TILE_SIZE;
    const pipeTopY = this.level.goal.y * TILE_SIZE;
    const standingOffset = body.bottom - this.player.y;
    const standY = pipeTopY - standingOffset + 2;
    const distance = Math.abs(pipeCenterX - this.player.x);
    const walkDuration = Phaser.Math.Clamp(distance * 7, 220, 620);

    body.enable = false;
    this.player.setFlipX(pipeCenterX < this.player.x);
    this.player.play('pet-run-right', true);
    this.tweens.add({
      targets: this.player,
      x: pipeCenterX,
      y: standY,
      duration: walkDuration,
      ease: 'Sine.inOut',
      onComplete: () => {
        this.player.play('pet-idle', true);
        this.player.setFlipX(false);
        this.tweens.add({
          targets: this.player,
          y: this.player.y + CONDUIT_TRAVEL_PIXELS + 18,
          alpha: 0,
          duration: 260,
          ease: 'Sine.in',
          onComplete
        });
      }
    });
  }

  private runPlayerToGoalHouse(onComplete: () => void): void {
    const targetX = Math.max(this.player.x + 40, this.goalDoorX);
    const distance = Math.max(1, targetX - this.player.x);
    const duration = Phaser.Math.Clamp(distance * 7, FINISH_RUN_MIN_DURATION, FINISH_RUN_MAX_DURATION);

    this.player.setFlipX(false);
    this.player.play('pet-run-right', true);
    this.tweens.add({
      targets: this.player,
      x: targetX,
      duration,
      ease: 'Sine.inOut',
      onComplete: () => {
        this.player.play('pet-idle', true);
        this.tweens.add({
          targets: this.player,
          alpha: 0,
          x: targetX + 12,
          duration: 180,
          ease: 'Sine.in',
          onComplete
        });
      }
    });
  }

  private convertTimeBonusToScore(onComplete: () => void): void {
    const totalBonus = this.runState.time * TIME_BONUS_SCORE;
    if (totalBonus <= 0) {
      onComplete();
      return;
    }

    this.showScorePopup(totalBonus, this.goalHouseX, (this.level.height - 6) * TILE_SIZE);
    this.hud.flash(`Time bonus ${totalBonus}`);

    const tick = (): void => {
      const chunk = Math.min(TIME_BONUS_STEP, this.runState.time);
      if (chunk <= 0) {
        this.time.delayedCall(180, onComplete);
        return;
      }

      this.runState.time -= chunk;
      this.runState.score += chunk * TIME_BONUS_SCORE;
      this.updateHud();

      if (this.runState.time % 25 === 0 || this.runState.time === 0) {
        this.playTone(987.77, 0.025);
      }

      this.time.delayedCall(TIME_BONUS_STEP_DELAY, tick);
    };

    tick();
  }

  private awardComboReward(reward: ComboReward, x: number, y: number): void {
    if (reward === '1up') {
      this.awardExtraLife(x, y);
      return;
    }

    this.awardScore(reward, x, y);
  }

  private awardExtraLife(x: number, y: number): void {
    this.runState.lives += 1;
    this.showScorePopup('1-Up', x, y);
    this.hud.flash('1-Up');
    this.updateHud();
    this.playTone(1046.5, 0.08);
    this.playTone(1567.98, 0.12, 0.08);
  }

  private awardScore(score: number, x: number, y: number): void {
    this.runState.score += score;
    this.showScorePopup(score, x, y);
  }

  private gameOver(): void {
    this.isFinished = true;
    this.stopGameplayMusic(true);
    this.hud.setTimeWarning(false);
    this.physics.pause();
    this.player.setTint(0x6f7788);
    this.player.play('pet-failed', true);
    this.updateHud();
    this.hud.showGameOver(() => this.restartRun());
  }

  private updateHud(): void {
    this.hud.update(this.runState);
  }

  private canPlayGameplayMusic(): boolean {
    return Boolean(
      this.audioContext &&
        this.isStarted &&
        !this.isFinished &&
        !this.isPaused &&
        !this.isConduitTransitioning &&
        !this.isDamageRecovering &&
        !this.isPowerTransitioning &&
        !this.isLifeLossAnimating &&
        !this.hud.isShortcutsOpen()
    );
  }

  private canPlayCourseMusic(): boolean {
    return this.canPlayGameplayMusic() && !this.hasStarPower();
  }

  private canPlayStarMusic(): boolean {
    return this.canPlayGameplayMusic() && this.hasStarPower();
  }

  private startGameplayMusic(): void {
    if (this.hasStarPower()) {
      this.startStarMusic();
    } else {
      this.startCourseMusic();
    }
  }

  private stopGameplayMusic(resetStep: boolean): void {
    this.stopCourseMusic(resetStep);
    this.stopStarMusic(resetStep);
  }

  private startCourseMusic(): void {
    if (!this.canPlayCourseMusic() || this.courseMusicEvent) {
      return;
    }

    this.courseMusicEvent = this.time.addEvent({
      delay: this.getCourseMusicStepDelay(),
      loop: true,
      callback: () => this.playCourseMusicStep()
    });
    this.playCourseMusicStep();
  }

  private stopCourseMusic(resetStep: boolean): void {
    this.courseMusicEvent?.remove(false);
    this.courseMusicEvent = undefined;
    if (resetStep) {
      this.courseMusicStep = 0;
    }
  }

  private playCourseMusicStep(): void {
    if (!this.canPlayCourseMusic()) {
      this.stopCourseMusic(false);
      return;
    }

    const step = this.courseMusicStep;
    const melody = COURSE_MUSIC_NOTES[step % COURSE_MUSIC_NOTES.length];
    const bass = COURSE_MUSIC_BASS[step % COURSE_MUSIC_BASS.length];
    if (bass > 0 && step % 2 === 0) {
      this.playTone(bass, 0.09, 0, 0.011);
    }
    if (melody > 0) {
      this.playTone(melody, 0.052, 0.014, 0.014);
    }
    this.courseMusicStep = step + 1;
  }

  private getCourseMusicStepDelay(): number {
    return this.didTimeWarning ? COURSE_MUSIC_HURRY_STEP_MS : COURSE_MUSIC_STEP_MS;
  }

  private startStarMusic(): void {
    if (!this.canPlayStarMusic() || this.starMusicEvent) {
      return;
    }

    this.starMusicEvent = this.time.addEvent({
      delay: STAR_MUSIC_STEP_MS,
      loop: true,
      callback: () => this.playStarMusicStep()
    });
    this.playStarMusicStep();
  }

  private stopStarMusic(resetStep: boolean): void {
    this.starMusicEvent?.remove(false);
    this.starMusicEvent = undefined;
    if (resetStep) {
      this.starMusicStep = 0;
    }
  }

  private playStarMusicStep(): void {
    if (!this.canPlayStarMusic()) {
      this.stopStarMusic(false);
      return;
    }

    const step = this.starMusicStep;
    const melody = STAR_MUSIC_NOTES[step % STAR_MUSIC_NOTES.length];
    const bass = STAR_MUSIC_BASS[step % STAR_MUSIC_BASS.length];
    if (bass > 0 && step % 2 === 0) {
      this.playTone(bass, 0.055, 0, 0.012);
    }
    this.playTone(melody, 0.04, 0.01, 0.014);
    this.starMusicStep = step + 1;
  }

  private ensureAudioContext(): void {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass || this.audioContext) {
      return;
    }
    this.audioContext = new AudioContextClass();
  }

  private playTone(frequency: number, duration: number, delay = 0, volume = 0.035): void {
    if (!this.audioContext) {
      return;
    }

    const startAt = this.audioContext.currentTime + delay;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
