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
  const overlapsConduitClearance = (coin, rect) =>
    coin.x >= rect.x && coin.x < rect.x + rect.w && coin.y >= rect.y - 1 && coin.y < rect.y + rect.h;

  for (const level of LEVELS) {
    const solidTiles = level.solids.flatMap(expandRect);
    const solidTileKeys = new Set(solidTiles.map(formatPoint));
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

    if (!level.checkpoint) {
      continue;
    }

    const checkpoint = level.checkpoint;
    const checkpointSupportKey = `${checkpoint.x},${checkpoint.y + 2}`;
    if (!solidTileKeys.has(checkpointSupportKey)) {
      failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} has no stable support at ${checkpointSupportKey}`);
    }

    for (let x = checkpoint.x - 1; x <= checkpoint.x + 1; x += 1) {
      for (let y = checkpoint.y; y <= checkpoint.y + 2; y += 1) {
        const key = `${x},${y}`;
        if (hazardTileKeys.has(key)) {
          failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} overlaps nearby hazard tile ${key}`);
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
