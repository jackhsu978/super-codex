import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const levelSourcePath = path.join(rootDir, 'src/game/content/level.ts');
const levelSource = fs.readFileSync(levelSourcePath, 'utf8');
const transpiled = ts.transpileModule(levelSource, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;

const tempModulePath = path.join(os.tmpdir(), `super-codex-levels-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`);
fs.writeFileSync(tempModulePath, transpiled);

try {
  const { LEVELS } = await import(pathToFileURL(tempModulePath));
  const failures = [];

  const checkpointEnemySafeX = 7;
  const checkpointEnemySafeY = 2;
  const checkpointProjectileSafeX = 14;
  const checkpointProjectileSafeY = 2;
  const checkpointPointBlankDangerX = 3;
  const checkpointFirebarBuffer = 2;
  const checkpointLavaSafeX = 4;
  const checkpointLavaSafeY = 3;
  const checkpointLiftSafeX = 4;
  const checkpointLiftSafeY = 3;
  const checkpointMovingPlatformSafeX = 4;
  const checkpointMovingPlatformSafeY = 3;
  const checkpointHazardSafeX = 3;
  const checkpointHazardSafeY = 2;
  const checkpointClearRadiusX = 1;
  const checkpointClearHeight = 2;
  const checkpointSupportRadiusX = 1;

  const expandRect = (rect) => {
    const tiles = [];
    for (let dx = 0; dx < rect.w; dx += 1) {
      for (let dy = 0; dy < rect.h; dy += 1) {
        tiles.push({ x: rect.x + dx, y: rect.y + dy, kind: rect.kind });
      }
    }
    return tiles;
  };

  const formatPoint = (point) => `${point.x},${point.y}`;
  const tileDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const withinBox = (a, b, safeX, safeY) => Math.abs(a.x - b.x) <= safeX && Math.abs(a.y - b.y) <= safeY;
  const isConduitTile = (tile) => tile.kind === 'conduitTop' || tile.kind === 'conduitBody';
  const overlapsConduitClearance = (point, rect) =>
    point.x >= rect.x && point.x < rect.x + rect.w && point.y >= rect.y - 1 && point.y < rect.y + rect.h;

  for (const level of LEVELS) {
    const solidTiles = level.solids.flatMap(expandRect);
    const solidTileKeys = new Set(solidTiles.map(formatPoint));
    const solidTileByKey = new Map(solidTiles.map((tile) => [formatPoint(tile), tile]));
    const hiddenBlockKeys = new Set(level.hiddenBlocks.map(formatPoint));
    const conduitRects = level.solids.filter(isConduitTile);
    const conduitTileKeys = new Set(solidTiles.filter(isConduitTile).map(formatPoint));
    const hazardTileKeys = new Set(
      level.hazards.flatMap((hazard) =>
        Array.from({ length: hazard.w }, (_, dx) => `${hazard.x + dx},${hazard.y}`)
      )
    );

    for (const coin of level.coins) {
      const coinKey = formatPoint(coin);
      if (solidTileKeys.has(coinKey)) {
        failures.push(`${level.world}: coin at ${coinKey} is inside a solid tile`);
      }

      if (conduitTileKeys.has(coinKey) || conduitRects.some((rect) => overlapsConduitClearance(coin, rect))) {
        failures.push(`${level.world}: coin at ${coinKey} appears inside a conduit or its mouth`);
      }
    }

    const coinBlockGroups = [
      ['coin block', level.coinBlocks],
      ['multi-coin block', level.multiCoinBlocks]
    ];
    for (const [label, points] of coinBlockGroups) {
      for (const point of points) {
        if (conduitRects.some((rect) => overlapsConduitClearance(point, rect))) {
          failures.push(`${level.world}: ${label} at ${formatPoint(point)} would spawn coins inside a conduit or its mouth`);
        }
      }
    }

    const itemBlockGroups = [
      ['power-up block', level.powerupBlocks],
      ['star block', level.starBlocks],
      ['life block', level.lifeBlocks]
    ];
    for (const [label, points] of itemBlockGroups) {
      for (const point of points) {
        if (conduitRects.some((rect) => overlapsConduitClearance(point, rect))) {
          failures.push(`${level.world}: ${label} at ${formatPoint(point)} would spawn an item inside a conduit or its mouth`);
        }
      }
    }

    for (const link of level.conduitLinks) {
      const entryKey = formatPoint(link.entry);
      const entryTile = solidTileByKey.get(entryKey);
      if (entryTile?.kind !== 'conduitTop') {
        failures.push(`${level.world}: conduit link entry at ${entryKey} is not a conduit top tile`);
      }
    }

    for (const vineBlock of level.vineBlocks) {
      const vineKey = formatPoint(vineBlock);
      const sourceTile = solidTileByKey.get(vineKey);
      const hasHittableSource = sourceTile?.kind === 'bonus' || hiddenBlockKeys.has(vineKey);

      if (!hasHittableSource) {
        failures.push(`${level.world}: vine block at ${vineKey} is not an active bonus or hidden block`);
      }

      if (!Number.isInteger(vineBlock.topY) || vineBlock.topY < 0 || vineBlock.topY >= vineBlock.y) {
        failures.push(`${level.world}: vine block at ${vineKey} has invalid topY ${vineBlock.topY}`);
      }

      if (conduitRects.some((rect) => overlapsConduitClearance(vineBlock, rect))) {
        failures.push(`${level.world}: vine block at ${vineKey} would emerge inside a conduit or its mouth`);
      }

      for (let y = vineBlock.topY; y < vineBlock.y; y += 1) {
        const shaftKey = `${vineBlock.x},${y}`;
        if (solidTileKeys.has(shaftKey)) {
          failures.push(`${level.world}: vine block at ${vineKey} has blocked vine shaft at ${shaftKey}`);
        }
      }
    }

    if (!level.checkpoint) {
      continue;
    }

    const checkpoint = level.checkpoint;
    for (let x = checkpoint.x - checkpointSupportRadiusX; x <= checkpoint.x + checkpointSupportRadiusX; x += 1) {
      const checkpointSupportKey = `${x},${checkpoint.y + 2}`;
      if (!solidTileKeys.has(checkpointSupportKey)) {
        failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} has no stable support at ${checkpointSupportKey}`);
      }
    }

    for (let x = checkpoint.x - checkpointClearRadiusX; x <= checkpoint.x + checkpointClearRadiusX; x += 1) {
      for (let y = checkpoint.y; y < checkpoint.y + checkpointClearHeight; y += 1) {
        const key = `${x},${y}`;
        if (solidTileKeys.has(key)) {
          failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} has blocked player clearance at ${key}`);
        }
      }
    }

    for (let x = checkpoint.x - checkpointHazardSafeX; x <= checkpoint.x + checkpointHazardSafeX; x += 1) {
      for (let y = checkpoint.y; y <= checkpoint.y + checkpointHazardSafeY; y += 1) {
        const key = `${x},${y}`;
        if (hazardTileKeys.has(key)) {
          failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} is too close to hazard tile ${key}`);
        }
      }
    }

    for (const enemy of level.enemies) {
      if (withinBox(enemy, checkpoint, checkpointEnemySafeX, checkpointEnemySafeY)) {
        failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} is too close to enemy at ${formatPoint(enemy)}`);
      }
    }

    for (const cannon of level.cannons) {
      const distance = Math.abs(cannon.x - checkpoint.x);
      const yDistance = Math.abs(cannon.y - checkpoint.y);
      const facesCheckpoint =
        cannon.direction === undefined ? true : cannon.direction < 0 ? checkpoint.x < cannon.x : checkpoint.x > cannon.x;

      if (distance <= checkpointPointBlankDangerX && yDistance <= checkpointProjectileSafeY) {
        failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} is point-blank beside cannon at ${formatPoint(cannon)}`);
      } else if (facesCheckpoint && distance <= checkpointProjectileSafeX && yDistance <= checkpointProjectileSafeY) {
        failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} is in cannon line of fire from ${formatPoint(cannon)}`);
      }
    }

    for (const firebar of level.firebars) {
      if (tileDistance(firebar, checkpoint) <= firebar.length + checkpointFirebarBuffer) {
        failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} is inside firebar reach from ${formatPoint(firebar)}`);
      }
    }

    for (const bubble of level.lavaBubbles) {
      if (withinBox(bubble, checkpoint, checkpointLavaSafeX, checkpointLavaSafeY)) {
        failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} is too close to lava bubble at ${formatPoint(bubble)}`);
      }
    }

    for (const lift of level.fallingLifts) {
      if (withinBox(lift, checkpoint, checkpointLiftSafeX, checkpointLiftSafeY)) {
        failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} is too close to falling lift at ${formatPoint(lift)}`);
      }
    }

    for (const platform of level.movingPlatforms) {
      if (withinBox(platform, checkpoint, checkpointMovingPlatformSafeX, checkpointMovingPlatformSafeY)) {
        failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} is too close to moving platform at ${formatPoint(platform)}`);
      }
    }
  }

  if (failures.length > 0) {
    console.error('Level safety validation failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Level safety validation passed.');
  }
} finally {
  fs.rmSync(tempModulePath, { force: true });
}
