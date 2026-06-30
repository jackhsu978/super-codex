export const TILE_SIZE = 32;

export type SolidKind = 'ground' | 'brick' | 'bonus' | 'hiddenBonus' | 'platform' | 'cloud' | 'conduitTop' | 'conduitBody';
export type LevelTheme = 'overworld' | 'underground' | 'athletic' | 'fortress';

export interface TileRect {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: SolidKind;
}

export interface Point {
  x: number;
  y: number;
}

export type EnemyKind = 'wobbler' | 'shellback' | 'wingShellback' | 'hammerThrower' | 'pipePlant' | 'guardian';

export interface EnemySpawn extends Point {
  kind?: EnemyKind;
}

export interface HazardRect {
  x: number;
  y: number;
  w: number;
}

export interface ConduitLink {
  entry: Point;
  target: Point;
  targetLevelIndex?: number;
  warpLabel?: string;
}

export interface ThemeRegion {
  x: number;
  y: number;
  w: number;
  h: number;
  theme: LevelTheme;
}

export interface VineBlock extends Point {
  topY: number;
}

export type MovingPlatformAxis = 'horizontal' | 'vertical';

export interface MovingPlatform extends Point {
  axis: MovingPlatformAxis;
  distance: number;
  speed: number;
  phase?: number;
}

export interface BalanceLift {
  left: Point;
  right: Point;
  distance: number;
  speed?: number;
}

export interface FallingLift extends Point {
  delay?: number;
  speed?: number;
}

export interface Firebar extends Point {
  length: number;
  speed: number;
  phase?: number;
}

export interface LavaBubble extends Point {
  interval?: number;
  offset?: number;
  velocity?: number;
}

export interface CannonLauncher extends Point {
  direction?: -1 | 1;
  interval?: number;
  offset?: number;
}

export interface LevelDefinition {
  world: string;
  theme: LevelTheme;
  width: number;
  height: number;
  timeLimit: number;
  spawn: Point;
  checkpoint?: Point;
  goal: Point;
  themeRegions?: ThemeRegion[];
  solids: TileRect[];
  powerupBlocks: Point[];
  starBlocks: Point[];
  multiCoinBlocks: Point[];
  coinBlocks: Point[];
  lifeBlocks: Point[];
  vineBlocks: VineBlock[];
  hiddenBlocks: Point[];
  conduitLinks: ConduitLink[];
  coins: Point[];
  enemies: EnemySpawn[];
  hazards: HazardRect[];
  firebars: Firebar[];
  lavaBubbles: LavaBubble[];
  cannons: CannonLauncher[];
  springboards: Point[];
  balanceLifts: BalanceLift[];
  fallingLifts: FallingLift[];
  movingPlatforms: MovingPlatform[];
}

const line = (startX: number, y: number, count: number, gap = 1): Point[] =>
  Array.from({ length: count }, (_, index) => ({ x: startX + index * gap, y }));

const arc = (startX: number, y: number): Point[] => [
  { x: startX, y: y + 1 },
  { x: startX + 1, y },
  { x: startX + 2, y },
  { x: startX + 3, y: y + 1 }
];

const stairs = (startX: number, floorY: number, steps: number): TileRect[] =>
  Array.from({ length: steps }, (_, index) => ({
    x: startX + index,
    y: floorY - index,
    w: 1,
    h: index + 1,
    kind: 'platform'
  }));

const conduit = (x: number, topY: number, height: number): TileRect[] => [
  { x, y: topY, w: 2, h: 1, kind: 'conduitTop' },
  { x, y: topY + 1, w: 2, h: height - 1, kind: 'conduitBody' }
];

const WORLD_1_1: LevelDefinition = {
  world: '1-1',
  theme: 'overworld',
  width: 205,
  height: 18,
  timeLimit: 400,
  spawn: { x: 3, y: 14 },
  checkpoint: { x: 93, y: 14 },
  goal: { x: 153, y: 6 },
  themeRegions: [{ x: 164, y: 5, w: 37, h: 13, theme: 'underground' }],
  solids: [
    { x: 0, y: 16, w: 69, h: 2, kind: 'ground' },
    { x: 72, y: 16, w: 15, h: 2, kind: 'ground' },
    { x: 91, y: 16, w: 15, h: 2, kind: 'ground' },
    { x: 110, y: 16, w: 50, h: 2, kind: 'ground' },

    ...conduit(26, 14, 2),
    ...conduit(38, 13, 3),
    ...conduit(52, 12, 4),
    ...conduit(74, 13, 3),
    ...conduit(80, 14, 2),
    ...conduit(132, 14, 2),

    { x: 12, y: 12, w: 1, h: 1, kind: 'brick' },
    { x: 13, y: 12, w: 1, h: 1, kind: 'bonus' },
    { x: 14, y: 12, w: 1, h: 1, kind: 'brick' },
    { x: 18, y: 10, w: 1, h: 1, kind: 'bonus' },
    { x: 22, y: 12, w: 4, h: 1, kind: 'brick' },

    { x: 41, y: 12, w: 1, h: 1, kind: 'bonus' },
    { x: 42, y: 12, w: 3, h: 1, kind: 'brick' },
    { x: 46, y: 9, w: 1, h: 1, kind: 'bonus' },
    { x: 47, y: 9, w: 1, h: 1, kind: 'brick' },
    { x: 48, y: 9, w: 1, h: 1, kind: 'bonus' },

    { x: 62, y: 13, w: 4, h: 1, kind: 'brick' },
    { x: 67, y: 11, w: 5, h: 1, kind: 'brick' },
    { x: 75, y: 8, w: 1, h: 1, kind: 'bonus' },
    { x: 76, y: 8, w: 3, h: 1, kind: 'brick' },

    { x: 93, y: 12, w: 4, h: 1, kind: 'brick' },
    ...stairs(99, 15, 5),

    { x: 117, y: 13, w: 7, h: 1, kind: 'brick' },
    { x: 128, y: 10, w: 1, h: 1, kind: 'brick' },
    { x: 129, y: 10, w: 1, h: 1, kind: 'bonus' },
    { x: 130, y: 10, w: 4, h: 1, kind: 'brick' },
    { x: 135, y: 8, w: 1, h: 1, kind: 'bonus' },
    ...stairs(142, 15, 7),

    { x: 124, y: 3, w: 5, h: 1, kind: 'cloud' },
    { x: 130, y: 3, w: 8, h: 1, kind: 'cloud' },

    { x: 164, y: 5, w: 1, h: 11, kind: 'platform' },
    { x: 165, y: 5, w: 35, h: 1, kind: 'platform' },
    { x: 168, y: 8, w: 7, h: 1, kind: 'brick' },
    { x: 178, y: 8, w: 8, h: 1, kind: 'brick' },
    { x: 189, y: 8, w: 7, h: 1, kind: 'brick' },
    { x: 174, y: 12, w: 6, h: 1, kind: 'brick' },
    { x: 184, y: 12, w: 6, h: 1, kind: 'brick' },
    { x: 165, y: 16, w: 36, h: 2, kind: 'ground' },
    { x: 200, y: 5, w: 1, h: 13, kind: 'platform' },
    ...conduit(194, 14, 2)
  ],
  powerupBlocks: [
    { x: 18, y: 10 },
    { x: 75, y: 8 }
  ],
  starBlocks: [
    { x: 46, y: 9 }
  ],
  multiCoinBlocks: [
    { x: 13, y: 12 },
    { x: 22, y: 12 }
  ],
  coinBlocks: [
    { x: 14, y: 12 },
    { x: 47, y: 9 },
    { x: 176, y: 12 }
  ],
  lifeBlocks: [
    { x: 21, y: 9 },
    { x: 135, y: 8 }
  ],
  vineBlocks: [
    { x: 129, y: 10, topY: 2 }
  ],
  hiddenBlocks: [
    { x: 21, y: 9 }
  ],
  conduitLinks: [
    { entry: { x: 26, y: 14 }, target: { x: 168, y: 14 }, warpLabel: 'Secret coin room' },
    { entry: { x: 194, y: 14 }, target: { x: 80, y: 14 }, warpLabel: 'Back to course' }
  ],
  coins: [
    ...line(34, 13, 3),
    ...line(68, 8, 3),
    ...line(90, 13, 4),
    ...line(118, 10, 4),
    ...line(124, 2, 5),
    ...line(130, 2, 8),
    ...line(128, 7, 6),
    ...line(145, 8, 3),
    ...line(168, 13, 5),
    ...line(168, 10, 7),
    ...arc(176, 6),
    ...line(179, 10, 8),
    ...line(179, 14, 8),
    ...arc(188, 6),
    ...line(190, 10, 6),
    ...line(191, 13, 3)
  ],
  enemies: [
    { x: 20, y: 15 },
    { x: 44, y: 15, kind: 'shellback' },
    { x: 52, y: 12, kind: 'pipePlant' },
    { x: 47, y: 8 },
    { x: 74, y: 13, kind: 'pipePlant' },
    { x: 70, y: 10 },
    { x: 112, y: 15 },
    { x: 132, y: 14, kind: 'pipePlant' },
    { x: 122, y: 12, kind: 'shellback' },
    { x: 137, y: 15 }
  ],
  hazards: [
    { x: 69, y: 16, w: 3 },
    { x: 87, y: 16, w: 4 },
    { x: 106, y: 16, w: 4 }
  ],
  firebars: [],
  lavaBubbles: [],
  cannons: [],
  springboards: [],
  balanceLifts: [],
  fallingLifts: [],
  movingPlatforms: []
};

const WORLD_1_2: LevelDefinition = {
  world: '1-2',
  theme: 'underground',
  width: 176,
  height: 18,
  timeLimit: 400,
  spawn: { x: 3, y: 14 },
  checkpoint: { x: 94, y: 14 },
  goal: { x: 151, y: 14 },
  solids: [
    { x: 0, y: 4, w: 176, h: 2, kind: 'brick' },

    { x: 0, y: 16, w: 22, h: 2, kind: 'ground' },
    { x: 26, y: 16, w: 26, h: 2, kind: 'ground' },
    { x: 56, y: 16, w: 32, h: 2, kind: 'ground' },
    { x: 92, y: 16, w: 32, h: 2, kind: 'ground' },
    { x: 128, y: 16, w: 48, h: 2, kind: 'ground' },

    ...conduit(35, 13, 3),
    ...conduit(66, 12, 4),
    ...conduit(113, 13, 3),
    ...conduit(151, 14, 2),
    ...conduit(164, 13, 3),
    ...conduit(170, 13, 3),

    { x: 10, y: 12, w: 3, h: 1, kind: 'brick' },
    { x: 14, y: 11, w: 1, h: 1, kind: 'bonus' },
    { x: 31, y: 12, w: 1, h: 1, kind: 'bonus' },
    { x: 32, y: 12, w: 4, h: 1, kind: 'brick' },
    { x: 41, y: 9, w: 1, h: 1, kind: 'bonus' },
    { x: 42, y: 9, w: 2, h: 1, kind: 'brick' },

    { x: 58, y: 13, w: 5, h: 1, kind: 'platform' },
    { x: 72, y: 10, w: 6, h: 1, kind: 'platform' },
    { x: 83, y: 8, w: 1, h: 1, kind: 'bonus' },
    { x: 84, y: 8, w: 3, h: 1, kind: 'brick' },

    { x: 97, y: 12, w: 6, h: 1, kind: 'platform' },
    { x: 107, y: 10, w: 1, h: 1, kind: 'bonus' },
    { x: 108, y: 10, w: 4, h: 1, kind: 'brick' },
    ...stairs(119, 15, 5),

    { x: 135, y: 12, w: 5, h: 1, kind: 'platform' },
    { x: 140, y: 10, w: 23, h: 1, kind: 'brick' },
    { x: 142, y: 9, w: 1, h: 1, kind: 'bonus' },
    { x: 143, y: 9, w: 3, h: 1, kind: 'brick' },
    ...stairs(158, 15, 6)
  ],
  powerupBlocks: [
    { x: 41, y: 9 },
    { x: 107, y: 10 }
  ],
  starBlocks: [
    { x: 83, y: 8 }
  ],
  multiCoinBlocks: [
    { x: 31, y: 12 },
    { x: 32, y: 12 }
  ],
  coinBlocks: [
    { x: 10, y: 12 },
    { x: 43, y: 9 },
    { x: 108, y: 10 }
  ],
  lifeBlocks: [
    { x: 142, y: 9 }
  ],
  vineBlocks: [],
  hiddenBlocks: [
    { x: 24, y: 10 },
    { x: 127, y: 10 }
  ],
  conduitLinks: [
    { entry: { x: 164, y: 13 }, target: { x: 3, y: 14 }, targetLevelIndex: 2, warpLabel: 'Warp to 1-3' },
    { entry: { x: 170, y: 13 }, target: { x: 3, y: 14 }, targetLevelIndex: 3, warpLabel: 'Warp to 1-4' }
  ],
  coins: [
    ...line(7, 13, 4),
    ...arc(13, 8),
    ...line(29, 10, 6),
    ...line(58, 10, 5),
    ...arc(72, 7),
    ...line(82, 6, 5),
    ...line(95, 13, 7),
    ...arc(107, 7),
    ...line(132, 9, 6),
    ...line(142, 8, 6),
    ...arc(158, 8)
  ],
  enemies: [
    { x: 18, y: 15 },
    { x: 35, y: 13, kind: 'pipePlant' },
    { x: 39, y: 15, kind: 'shellback' },
    { x: 61, y: 12 },
    { x: 66, y: 12, kind: 'pipePlant' },
    { x: 78, y: 9, kind: 'shellback' },
    { x: 84, y: 7 },
    { x: 101, y: 11 },
    { x: 113, y: 13, kind: 'pipePlant' },
    { x: 116, y: 15 },
    { x: 145, y: 15 }
  ],
  hazards: [
    { x: 22, y: 16, w: 4 },
    { x: 52, y: 16, w: 4 },
    { x: 88, y: 16, w: 4 },
    { x: 124, y: 16, w: 4 }
  ],
  firebars: [],
  lavaBubbles: [],
  cannons: [],
  springboards: [],
  balanceLifts: [],
  fallingLifts: [],
  movingPlatforms: []
};

const WORLD_1_3: LevelDefinition = {
  world: '1-3',
  theme: 'athletic',
  width: 190,
  height: 18,
  timeLimit: 300,
  spawn: { x: 3, y: 14 },
  checkpoint: { x: 103, y: 14 },
  goal: { x: 183, y: 6 },
  solids: [
    { x: 0, y: 16, w: 20, h: 2, kind: 'ground' },
    { x: 24, y: 16, w: 18, h: 2, kind: 'ground' },
    { x: 48, y: 16, w: 18, h: 2, kind: 'ground' },
    { x: 72, y: 16, w: 22, h: 2, kind: 'ground' },
    { x: 100, y: 16, w: 24, h: 2, kind: 'ground' },
    { x: 128, y: 16, w: 62, h: 2, kind: 'ground' },

    ...conduit(31, 13, 3),
    ...conduit(79, 14, 2),
    ...conduit(118, 12, 4),
    ...conduit(160, 13, 3),

    { x: 9, y: 12, w: 1, h: 1, kind: 'bonus' },
    { x: 10, y: 12, w: 4, h: 1, kind: 'brick' },
    { x: 24, y: 13, w: 5, h: 1, kind: 'platform' },
    { x: 37, y: 10, w: 1, h: 1, kind: 'bonus' },
    { x: 38, y: 10, w: 4, h: 1, kind: 'brick' },

    { x: 52, y: 12, w: 6, h: 1, kind: 'platform' },
    { x: 62, y: 9, w: 1, h: 1, kind: 'bonus' },
    { x: 63, y: 9, w: 3, h: 1, kind: 'brick' },
    { x: 73, y: 11, w: 6, h: 1, kind: 'platform' },

    { x: 92, y: 12, w: 5, h: 1, kind: 'platform' },
    { x: 105, y: 9, w: 1, h: 1, kind: 'bonus' },
    { x: 106, y: 9, w: 5, h: 1, kind: 'brick' },
    ...stairs(113, 15, 5),

    { x: 132, y: 13, w: 5, h: 1, kind: 'platform' },
    { x: 139, y: 10, w: 6, h: 1, kind: 'platform' },
    { x: 148, y: 8, w: 1, h: 1, kind: 'bonus' },
    { x: 149, y: 8, w: 4, h: 1, kind: 'brick' },
    ...stairs(170, 15, 8)
  ],
  powerupBlocks: [
    { x: 37, y: 10 },
    { x: 148, y: 8 }
  ],
  starBlocks: [
    { x: 62, y: 9 }
  ],
  multiCoinBlocks: [
    { x: 9, y: 12 },
    { x: 38, y: 10 },
    { x: 130, y: 10 }
  ],
  coinBlocks: [
    { x: 10, y: 12 },
    { x: 63, y: 9 },
    { x: 106, y: 9 }
  ],
  lifeBlocks: [
    { x: 88, y: 8 },
    { x: 105, y: 9 }
  ],
  vineBlocks: [],
  hiddenBlocks: [
    { x: 88, y: 8 },
    { x: 130, y: 10 }
  ],
  conduitLinks: [],
  coins: [
    ...line(6, 13, 5),
    ...arc(24, 9),
    ...line(38, 7, 5),
    ...line(52, 9, 6),
    ...arc(62, 6),
    ...line(74, 8, 5),
    ...arc(94, 8),
    ...line(106, 6, 6),
    ...line(132, 10, 5),
    ...arc(143, 6),
    ...line(172, 8, 5)
  ],
  enemies: [
    { x: 16, y: 15 },
    { x: 28, y: 12, kind: 'shellback' },
    { x: 31, y: 13, kind: 'pipePlant' },
    { x: 56, y: 11 },
    { x: 76, y: 10, kind: 'wingShellback' },
    { x: 79, y: 14, kind: 'pipePlant' },
    { x: 63, y: 8 },
    { x: 108, y: 8 },
    { x: 118, y: 12, kind: 'pipePlant' },
    { x: 134, y: 12 },
    { x: 152, y: 15, kind: 'wingShellback' },
    { x: 160, y: 13, kind: 'pipePlant' },
    { x: 166, y: 15 }
  ],
  hazards: [
    { x: 20, y: 16, w: 4 },
    { x: 42, y: 16, w: 6 },
    { x: 66, y: 16, w: 6 },
    { x: 94, y: 16, w: 6 },
    { x: 124, y: 16, w: 4 }
  ],
  firebars: [],
  lavaBubbles: [],
  cannons: [
    { x: 86, y: 15, direction: -1, interval: 1900 },
    { x: 147, y: 15, direction: -1, interval: 1650, offset: 600 }
  ],
  springboards: [
    { x: 112, y: 15 },
    { x: 168, y: 15 }
  ],
  balanceLifts: [
    { left: { x: 42, y: 12 }, right: { x: 45, y: 12 }, distance: 3, speed: 68 },
    { left: { x: 121, y: 12 }, right: { x: 128, y: 12 }, distance: 3, speed: 72 }
  ],
  fallingLifts: [
    { x: 94, y: 13, delay: 420, speed: 250 },
    { x: 97, y: 13, delay: 360, speed: 270 }
  ],
  movingPlatforms: [
    { x: 67, y: 12, axis: 'vertical', distance: 3, speed: 58, phase: 1 },
    { x: 156, y: 10, axis: 'horizontal', distance: 5, speed: 78 }
  ]
};

const WORLD_1_4: LevelDefinition = {
  world: '1-4',
  theme: 'fortress',
  width: 168,
  height: 18,
  timeLimit: 300,
  spawn: { x: 3, y: 14 },
  checkpoint: { x: 106, y: 14 },
  goal: { x: 158, y: 6 },
  solids: [
    { x: 0, y: 16, w: 20, h: 2, kind: 'ground' },
    { x: 24, y: 16, w: 18, h: 2, kind: 'ground' },
    { x: 46, y: 16, w: 20, h: 2, kind: 'ground' },
    { x: 72, y: 16, w: 18, h: 2, kind: 'ground' },
    { x: 96, y: 16, w: 20, h: 2, kind: 'ground' },
    { x: 122, y: 16, w: 46, h: 2, kind: 'ground' },

    { x: 0, y: 3, w: 36, h: 1, kind: 'brick' },
    { x: 45, y: 3, w: 34, h: 1, kind: 'brick' },
    { x: 91, y: 3, w: 36, h: 1, kind: 'brick' },
    { x: 138, y: 3, w: 30, h: 1, kind: 'brick' },

    { x: 10, y: 12, w: 1, h: 1, kind: 'bonus' },
    { x: 11, y: 12, w: 5, h: 1, kind: 'brick' },
    { x: 26, y: 12, w: 5, h: 1, kind: 'platform' },
    { x: 34, y: 10, w: 1, h: 1, kind: 'bonus' },
    { x: 35, y: 10, w: 4, h: 1, kind: 'brick' },

    { x: 48, y: 13, w: 5, h: 1, kind: 'platform' },
    { x: 58, y: 10, w: 1, h: 1, kind: 'bonus' },
    { x: 59, y: 10, w: 5, h: 1, kind: 'brick' },
    { x: 73, y: 12, w: 6, h: 1, kind: 'platform' },

    { x: 93, y: 13, w: 4, h: 1, kind: 'platform' },
    { x: 103, y: 9, w: 1, h: 1, kind: 'bonus' },
    { x: 104, y: 9, w: 4, h: 1, kind: 'brick' },
    { x: 118, y: 12, w: 7, h: 1, kind: 'platform' },
    { x: 132, y: 10, w: 1, h: 1, kind: 'bonus' },
    { x: 133, y: 10, w: 4, h: 1, kind: 'brick' },
    ...stairs(143, 15, 7)
  ],
  powerupBlocks: [
    { x: 34, y: 10 },
    { x: 103, y: 9 }
  ],
  starBlocks: [
    { x: 132, y: 10 }
  ],
  multiCoinBlocks: [
    { x: 10, y: 12 },
    { x: 35, y: 10 },
    { x: 80, y: 9 }
  ],
  coinBlocks: [
    { x: 11, y: 12 },
    { x: 59, y: 10 },
    { x: 104, y: 9 }
  ],
  lifeBlocks: [
    { x: 58, y: 10 }
  ],
  vineBlocks: [],
  hiddenBlocks: [
    { x: 58, y: 10 },
    { x: 80, y: 9 },
    { x: 136, y: 8 }
  ],
  conduitLinks: [],
  coins: [
    ...line(7, 13, 5),
    ...arc(25, 9),
    ...line(35, 7, 5),
    ...line(49, 10, 5),
    ...arc(58, 7),
    ...line(74, 9, 6),
    ...line(94, 10, 4),
    ...arc(103, 6),
    ...line(120, 9, 6),
    ...arc(132, 7),
    ...line(145, 8, 5)
  ],
  enemies: [
    { x: 17, y: 15 },
    { x: 30, y: 11, kind: 'shellback' },
    { x: 51, y: 12 },
    { x: 63, y: 15, kind: 'shellback' },
    { x: 77, y: 11, kind: 'hammerThrower' },
    { x: 105, y: 8, kind: 'shellback' },
    { x: 124, y: 11, kind: 'hammerThrower' },
    { x: 140, y: 15, kind: 'shellback' },
    { x: 151, y: 15, kind: 'guardian' }
  ],
  hazards: [
    { x: 20, y: 16, w: 4 },
    { x: 42, y: 16, w: 4 },
    { x: 66, y: 16, w: 6 },
    { x: 90, y: 16, w: 6 },
    { x: 116, y: 16, w: 6 }
  ],
  firebars: [
    { x: 23, y: 13, length: 4, speed: 2.3 },
    { x: 68, y: 12, length: 5, speed: -1.85, phase: 0.8 },
    { x: 113, y: 12, length: 4, speed: 2.15, phase: 1.9 },
    { x: 142, y: 12, length: 5, speed: -2.05, phase: 0.4 }
  ],
  lavaBubbles: [
    { x: 21, y: 16, interval: 1900, offset: 260 },
    { x: 44, y: 16, interval: 2200, offset: 980, velocity: -540 },
    { x: 68, y: 16, interval: 1750, offset: 520 },
    { x: 118, y: 16, interval: 2050, offset: 1180, velocity: -575 }
  ],
  cannons: [
    { x: 56, y: 15, direction: -1, interval: 1800 },
    { x: 100, y: 15, direction: -1, interval: 1550, offset: 420 },
    { x: 130, y: 15, direction: -1, interval: 1650, offset: 880 }
  ],
  springboards: [
    { x: 40, y: 15 },
    { x: 94, y: 12 }
  ],
  balanceLifts: [],
  fallingLifts: [],
  movingPlatforms: [
    { x: 88, y: 13, axis: 'horizontal', distance: 5, speed: 66 }
  ]
};

export const LEVELS: LevelDefinition[] = [WORLD_1_1, WORLD_1_2, WORLD_1_3, WORLD_1_4];
export const LEVEL = LEVELS[0];
