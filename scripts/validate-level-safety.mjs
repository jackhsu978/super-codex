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

  for (const level of LEVELS) {
    const solidTiles = level.solids.flatMap(expandRect);
    const solidTileKeys = new Set(solidTiles.map(formatPoint));
    const conduitTileKeys = new Set(
      solidTiles
        .filter((tile) => tile.kind === 'conduitTop' || tile.kind === 'conduitBody')
        .map(formatPoint)
    );
    const hazardTileKeys = new Set(
      level.hazards.flatMap((hazard) =>
        Array.from({ length: hazard.w }, (_, dx) => `${hazard.x + dx},${hazard.y}`)
      )
    );

    for (const coin of level.coins) {
      if (conduitTileKeys.has(formatPoint(coin))) {
        failures.push(`${level.world}: coin at ${formatPoint(coin)} is inside a conduit tile`);
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
      if (Math.abs(enemy.x - checkpoint.x) <= 4 && Math.abs(enemy.y - checkpoint.y) <= 3) {
        failures.push(`${level.world}: checkpoint at ${formatPoint(checkpoint)} is too close to enemy at ${formatPoint(enemy)}`);
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
