import Phaser from 'phaser';

type DrawTexture = (graphics: Phaser.GameObjects.Graphics) => void;

const makeTexture = (
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: DrawTexture
): void => {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics();
  draw(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
};

interface GrassGroundPalette {
  grass: number;
  grassLight: number;
  grassDark: number;
  base: number;
  shade: number;
  highlight: number;
  mortar: number;
}

interface BlockPalette {
  base: number;
  shade: number;
  highlight: number;
  outline: number;
}

const drawGrassGroundTile = (g: Phaser.GameObjects.Graphics, palette: GrassGroundPalette): void => {
  g.fillStyle(palette.base, 1).fillRect(0, 0, 32, 32);
  g.fillStyle(palette.grass, 1).fillRect(0, 0, 32, 8);
  g.fillStyle(palette.grassLight, 1).fillRect(2, 1, 9, 3).fillRect(18, 1, 9, 3);
  g.fillStyle(palette.grassDark, 1).fillRect(0, 7, 32, 3);
  g.fillStyle(palette.mortar, 1).fillRect(0, 18, 32, 3).fillRect(15, 8, 3, 10).fillRect(6, 21, 3, 11).fillRect(23, 21, 3, 11);
  g.fillStyle(palette.highlight, 1).fillRect(3, 11, 10, 3).fillRect(19, 23, 8, 3);
  g.fillStyle(palette.shade, 1).fillRect(0, 30, 32, 2).fillRect(0, 8, 2, 24);
};

const drawGrassGroundFillTile = (g: Phaser.GameObjects.Graphics, palette: GrassGroundPalette): void => {
  g.fillStyle(palette.base, 1).fillRect(0, 0, 32, 32);
  g.fillStyle(palette.mortar, 1).fillRect(0, 13, 32, 3).fillRect(14, 0, 3, 13).fillRect(6, 16, 3, 16).fillRect(23, 16, 3, 16);
  g.fillStyle(palette.highlight, 0.7).fillRect(3, 5, 10, 3).fillRect(19, 19, 8, 3);
  g.fillStyle(palette.shade, 1).fillRect(0, 30, 32, 2).fillRect(0, 0, 2, 32);
};

const drawStoneTile = (g: Phaser.GameObjects.Graphics, palette: BlockPalette): void => {
  g.fillStyle(palette.base, 1).fillRect(0, 0, 32, 32);
  g.fillStyle(palette.outline, 1).fillRect(0, 0, 32, 2).fillRect(0, 30, 32, 2).fillRect(0, 0, 2, 32).fillRect(30, 0, 2, 32);
  g.fillStyle(palette.shade, 1).fillRect(0, 14, 32, 3).fillRect(14, 0, 3, 14).fillRect(5, 17, 3, 15);
  g.fillStyle(palette.highlight, 1).fillRect(4, 4, 10, 3).fillRect(20, 20, 8, 3);
};

const drawStoneFillTile = (g: Phaser.GameObjects.Graphics, palette: BlockPalette): void => {
  g.fillStyle(palette.base, 1).fillRect(0, 0, 32, 32);
  g.fillStyle(palette.outline, 1).fillRect(0, 30, 32, 2).fillRect(0, 0, 2, 32).fillRect(30, 0, 2, 32);
  g.fillStyle(palette.shade, 1).fillRect(0, 14, 32, 3).fillRect(14, 0, 3, 14).fillRect(5, 17, 3, 15);
  g.fillStyle(palette.highlight, 0.65).fillRect(4, 4, 10, 3).fillRect(20, 20, 8, 3);
};

const drawBrickTile = (g: Phaser.GameObjects.Graphics, palette: BlockPalette): void => {
  g.fillStyle(palette.base, 1).fillRect(0, 0, 32, 32);
  g.fillStyle(palette.outline, 1).fillRect(0, 0, 32, 2).fillRect(0, 30, 32, 2).fillRect(0, 0, 2, 32).fillRect(30, 0, 2, 32);
  g.fillStyle(palette.shade, 1).fillRect(0, 14, 32, 3).fillRect(14, 0, 3, 14).fillRect(5, 17, 3, 13).fillRect(23, 17, 3, 13);
  g.fillStyle(palette.highlight, 1).fillRect(4, 4, 8, 3).fillRect(19, 4, 8, 3).fillRect(9, 20, 9, 3).fillRect(25, 20, 4, 3);
};

const drawQuestionBlock = (g: Phaser.GameObjects.Graphics, palette: BlockPalette): void => {
  g.fillStyle(palette.base, 1).fillRect(0, 0, 32, 32);
  g.fillStyle(palette.highlight, 1).fillRect(4, 4, 22, 4).fillRect(4, 8, 4, 14);
  g.fillStyle(palette.shade, 1).fillRect(25, 5, 3, 22).fillRect(5, 25, 23, 3);
  g.fillStyle(palette.outline, 1).fillRect(0, 0, 32, 3).fillRect(0, 29, 32, 3).fillRect(0, 0, 3, 32).fillRect(29, 0, 3, 32);
  g.fillStyle(palette.outline, 1).fillRect(5, 5, 4, 4).fillRect(23, 5, 4, 4).fillRect(5, 23, 4, 4).fillRect(23, 23, 4, 4);
  g.fillStyle(0xfff4bf, 1)
    .fillRect(10, 7, 12, 4)
    .fillRect(21, 10, 4, 7)
    .fillRect(16, 16, 8, 4)
    .fillRect(14, 19, 4, 5)
    .fillRect(14, 26, 4, 3);
  g.fillStyle(palette.outline, 0.82)
    .fillRect(12, 10, 7, 2)
    .fillRect(19, 12, 2, 3)
    .fillRect(15, 21, 2, 2)
    .fillRect(15, 27, 2, 1);
  g.fillStyle(0xffffd6, 0.8).fillRect(11, 8, 8, 1).fillRect(5, 5, 2, 2);
};

const drawUsedBlock = (g: Phaser.GameObjects.Graphics, palette: BlockPalette): void => {
  g.fillStyle(palette.base, 1).fillRect(0, 0, 32, 32);
  g.fillStyle(palette.highlight, 1).fillRect(4, 4, 22, 4).fillRect(4, 8, 4, 14);
  g.fillStyle(palette.outline, 1).fillRect(0, 0, 32, 3).fillRect(0, 29, 32, 3).fillRect(0, 0, 3, 32).fillRect(29, 0, 3, 32);
  g.fillStyle(palette.shade, 1).fillRect(7, 7, 6, 6).fillRect(19, 7, 6, 6).fillRect(7, 19, 6, 6).fillRect(19, 19, 6, 6);
  g.fillStyle(palette.outline, 0.75).fillRect(9, 9, 2, 2).fillRect(21, 9, 2, 2).fillRect(9, 21, 2, 2).fillRect(21, 21, 2, 2);
};

type ConduitEdge = 'left' | 'right' | 'middle';

const drawConduitTopTile = (g: Phaser.GameObjects.Graphics, edge: ConduitEdge): void => {
  g.fillStyle(0x06260f, 1).fillRect(0, 0, 32, 32);
  g.fillStyle(0x0e7a31, 1).fillRect(0, 8, 32, 24);
  g.fillStyle(0x24b84f, 1).fillRect(0, 5, 32, 22);
  g.fillStyle(0x69df58, 1).fillRect(0, 2, 32, 9);
  g.fillStyle(0xb6ff72, 0.92).fillRect(edge === 'right' ? 3 : 8, 3, 8, 23);
  g.fillStyle(0x0b4f28, 1).fillRect(0, 11, 32, 4).fillRect(0, 27, 32, 5);

  if (edge === 'left') {
    g.fillStyle(0x06260f, 1).fillRect(0, 4, 5, 28).fillRect(0, 0, 32, 3);
    g.fillStyle(0x0a5d28, 1).fillRect(5, 5, 3, 24);
  } else if (edge === 'right') {
    g.fillStyle(0x06260f, 1).fillRect(27, 4, 5, 28).fillRect(0, 0, 32, 3);
    g.fillStyle(0x0a5d28, 1).fillRect(20, 5, 3, 24);
  } else {
    g.fillStyle(0x06260f, 1).fillRect(0, 0, 32, 3);
  }

  g.fillStyle(0xe6ff9a, 0.9).fillRect(edge === 'right' ? 4 : 9, 4, 5, 2);
};

const drawConduitBodyTile = (g: Phaser.GameObjects.Graphics, edge: ConduitEdge): void => {
  g.fillStyle(0x06260f, 1).fillRect(0, 0, 32, 32);
  g.fillStyle(0x0b6a2d, 1).fillRect(0, 0, 32, 32);
  g.fillStyle(0x20aa49, 1).fillRect(0, 0, 32, 32);
  g.fillStyle(0x69df58, 1).fillRect(edge === 'right' ? 3 : 8, 0, 8, 32);

  if (edge === 'left') {
    g.fillStyle(0x06260f, 1).fillRect(0, 0, 5, 32);
    g.fillStyle(0x0a5d28, 1).fillRect(5, 0, 3, 32);
  } else if (edge === 'right') {
    g.fillStyle(0x06260f, 1).fillRect(27, 0, 5, 32);
    g.fillStyle(0x0a5d28, 1).fillRect(20, 0, 3, 32);
  }

  g.fillStyle(0xb6ff72, 0.72).fillRect(edge === 'right' ? 4 : 9, 0, 4, 32);
};

export const ensureGeneratedTextures = (scene: Phaser.Scene): void => {
  makeTexture(scene, 'tile-ground', 32, 32, (g) => {
    drawGrassGroundTile(g, {
      grass: 0x4bd54b,
      grassLight: 0xa8ff66,
      grassDark: 0x16833a,
      base: 0xc96a2a,
      shade: 0x6a2f1c,
      highlight: 0xf7b15d,
      mortar: 0x8c3f24
    });
  });

  makeTexture(scene, 'tile-ground-underground', 32, 32, (g) => {
    drawStoneTile(g, {
      base: 0x334681,
      shade: 0x151b38,
      highlight: 0x6f82b4,
      outline: 0x0d1229
    });
  });

  makeTexture(scene, 'tile-ground-fill', 32, 32, (g) => {
    drawGrassGroundFillTile(g, {
      grass: 0x4bd54b,
      grassLight: 0xa8ff66,
      grassDark: 0x16833a,
      base: 0xc96a2a,
      shade: 0x6a2f1c,
      highlight: 0xf7b15d,
      mortar: 0x8c3f24
    });
  });

  makeTexture(scene, 'tile-ground-fill-underground', 32, 32, (g) => {
    drawStoneFillTile(g, {
      base: 0x334681,
      shade: 0x151b38,
      highlight: 0x6f82b4,
      outline: 0x0d1229
    });
  });

  makeTexture(scene, 'tile-ground-athletic', 32, 32, (g) => {
    drawGrassGroundTile(g, {
      grass: 0x55b85d,
      grassLight: 0xb0f08b,
      grassDark: 0x267a3b,
      base: 0xe18c45,
      shade: 0x8b5735,
      highlight: 0xffd486,
      mortar: 0x96512f
    });
  });

  makeTexture(scene, 'tile-ground-fill-athletic', 32, 32, (g) => {
    drawGrassGroundFillTile(g, {
      grass: 0x55b85d,
      grassLight: 0xb0f08b,
      grassDark: 0x267a3b,
      base: 0xe18c45,
      shade: 0x8b5735,
      highlight: 0xffd486,
      mortar: 0x96512f
    });
  });

  makeTexture(scene, 'tile-ground-fortress', 32, 32, (g) => {
    drawStoneTile(g, {
      base: 0x3a3d5d,
      shade: 0x151827,
      highlight: 0x777f9f,
      outline: 0x0d0f1b
    });
  });

  makeTexture(scene, 'tile-ground-fill-fortress', 32, 32, (g) => {
    drawStoneFillTile(g, {
      base: 0x3a3d5d,
      shade: 0x151827,
      highlight: 0x777f9f,
      outline: 0x0d0f1b
    });
  });

  makeTexture(scene, 'tile-platform', 32, 32, (g) => {
    drawBrickTile(g, {
      base: 0xb96e4b,
      shade: 0x6f332a,
      highlight: 0xf0a46f,
      outline: 0x4c241f
    });
  });

  makeTexture(scene, 'tile-platform-underground', 32, 32, (g) => {
    drawBrickTile(g, {
      base: 0x3c4f89,
      shade: 0x151b38,
      highlight: 0x798dcc,
      outline: 0x0d1229
    });
  });

  makeTexture(scene, 'tile-platform-athletic', 32, 32, (g) => {
    drawBrickTile(g, {
      base: 0xd67c45,
      shade: 0x7e3d2b,
      highlight: 0xffc077,
      outline: 0x55271e
    });
  });

  makeTexture(scene, 'tile-platform-fortress', 32, 32, (g) => {
    drawBrickTile(g, {
      base: 0x343852,
      shade: 0x151827,
      highlight: 0x6e7699,
      outline: 0x0d0f1b
    });
  });

  makeTexture(scene, 'moving-lift', 96, 18, (g) => {
    g.fillStyle(0x21324f, 1).fillRoundedRect(0, 4, 96, 12, 3);
    g.fillStyle(0xf7c85f, 1).fillRoundedRect(3, 1, 90, 10, 3);
    g.fillStyle(0xffefaa, 1).fillRect(8, 3, 18, 3).fillRect(38, 3, 20, 3).fillRect(70, 3, 14, 3);
    g.fillStyle(0x8b5735, 1).fillRect(0, 12, 96, 3);
    g.fillStyle(0x111927, 1).fillRect(12, 8, 4, 4).fillRect(80, 8, 4, 4);
  });

  makeTexture(scene, 'tile-cloud', 32, 32, (g) => {
    g.fillStyle(0xdff8ff, 1).fillEllipse(8, 18, 18, 15);
    g.fillEllipse(18, 13, 24, 22);
    g.fillEllipse(27, 19, 18, 14);
    g.fillStyle(0xffffff, 1).fillEllipse(9, 15, 15, 11);
    g.fillEllipse(19, 10, 18, 16);
    g.fillEllipse(26, 16, 14, 10);
    g.fillStyle(0x91d7ee, 0.75).fillRect(4, 22, 24, 4);
  });

  makeTexture(scene, 'vine', 20, 32, (g) => {
    g.fillStyle(0x107b4f, 1).fillRect(8, 0, 4, 32);
    g.fillStyle(0x36c66f, 1).fillRect(10, 0, 3, 32);
    g.fillStyle(0x24b86f, 1).fillEllipse(6, 8, 11, 7);
    g.fillEllipse(15, 16, 11, 7);
    g.fillEllipse(6, 25, 11, 7);
    g.fillStyle(0xc9ffd5, 0.78).fillRect(11, 2, 2, 26);
  });

  makeTexture(scene, 'springboard', 32, 28, (g) => {
    g.fillStyle(0x111927, 1).fillRoundedRect(5, 21, 22, 5, 2);
    g.fillStyle(0xffd166, 1).fillRoundedRect(6, 2, 20, 7, 3);
    g.fillStyle(0xfff4a3, 1).fillRect(9, 3, 14, 3);
    g.lineStyle(3, 0x24b86f, 1);
    g.beginPath();
    g.moveTo(9, 10);
    g.lineTo(23, 13);
    g.lineTo(9, 16);
    g.lineTo(23, 19);
    g.strokePath();
    g.fillStyle(0x0d7f58, 1).fillRoundedRect(8, 19, 16, 5, 2);
    g.fillStyle(0xa8fff2, 0.75).fillRect(10, 4, 4, 2);
  });

  makeTexture(scene, 'balance-lift', 72, 16, (g) => {
    g.fillStyle(0x111927, 1).fillRoundedRect(0, 10, 72, 6, 2);
    g.fillStyle(0xc8873d, 1).fillRoundedRect(2, 5, 68, 8, 3);
    g.fillStyle(0xffd166, 1).fillRoundedRect(6, 2, 60, 6, 2);
    g.fillStyle(0xfff4a3, 1).fillRect(12, 3, 18, 2).fillRect(43, 3, 14, 2);
    g.fillStyle(0x6d4228, 1).fillRect(8, 10, 6, 4).fillRect(30, 10, 6, 4).fillRect(56, 10, 6, 4);
  });

  makeTexture(scene, 'falling-lift', 96, 18, (g) => {
    g.fillStyle(0x111927, 1).fillRoundedRect(0, 12, 96, 6, 2);
    g.fillStyle(0x5b8fbf, 1).fillRoundedRect(3, 4, 90, 10, 3);
    g.fillStyle(0xa8fff2, 1).fillRoundedRect(8, 2, 80, 6, 2);
    g.fillStyle(0xffd166, 1).fillRect(13, 4, 10, 3).fillRect(38, 4, 10, 3).fillRect(63, 4, 10, 3);
    g.fillStyle(0x193d5a, 1).fillRect(11, 12, 6, 4).fillRect(44, 12, 6, 4).fillRect(79, 12, 6, 4);
    g.fillStyle(0xfff4a3, 0.9).fillTriangle(85, 4, 91, 4, 88, 10);
  });

  makeTexture(scene, 'tile-conduit-top', 32, 32, (g) => drawConduitTopTile(g, 'middle'));
  makeTexture(scene, 'tile-conduit-top-left', 32, 32, (g) => drawConduitTopTile(g, 'left'));
  makeTexture(scene, 'tile-conduit-top-right', 32, 32, (g) => drawConduitTopTile(g, 'right'));

  makeTexture(scene, 'tile-conduit-body', 32, 32, (g) => drawConduitBodyTile(g, 'middle'));
  makeTexture(scene, 'tile-conduit-body-left', 32, 32, (g) => drawConduitBodyTile(g, 'left'));
  makeTexture(scene, 'tile-conduit-body-right', 32, 32, (g) => drawConduitBodyTile(g, 'right'));

  makeTexture(scene, 'tile-brick', 32, 32, (g) => {
    drawBrickTile(g, {
      base: 0xb96e4b,
      shade: 0x6f332a,
      highlight: 0xf0a46f,
      outline: 0x4c241f
    });
  });

  makeTexture(scene, 'tile-brick-underground', 32, 32, (g) => {
    drawBrickTile(g, {
      base: 0x49598e,
      shade: 0x1c2447,
      highlight: 0x8798d0,
      outline: 0x0f1430
    });
  });

  makeTexture(scene, 'tile-brick-athletic', 32, 32, (g) => {
    drawBrickTile(g, {
      base: 0xc97448,
      shade: 0x6d3a31,
      highlight: 0xffbd7a,
      outline: 0x512820
    });
  });

  makeTexture(scene, 'tile-brick-fortress', 32, 32, (g) => {
    drawBrickTile(g, {
      base: 0x3a3d5d,
      shade: 0x151827,
      highlight: 0x727b9e,
      outline: 0x0d0f1b
    });
  });

  makeTexture(scene, 'brick-fragment', 16, 16, (g) => {
    g.fillStyle(0xb96e4b, 1).fillRect(0, 0, 16, 16);
    g.fillStyle(0x7f3e35, 1).fillRect(0, 7, 16, 2).fillRect(7, 0, 2, 7);
    g.fillStyle(0xe0a178, 1).fillRect(2, 2, 6, 2).fillRect(9, 10, 5, 2);
    g.fillStyle(0x5a2b25, 1).fillRect(0, 0, 16, 1).fillRect(0, 15, 16, 1);
  });

  makeTexture(scene, 'brick-fragment-underground', 16, 16, (g) => {
    g.fillStyle(0x49598e, 1).fillRect(0, 0, 16, 16);
    g.fillStyle(0x1c2447, 1).fillRect(0, 7, 16, 2).fillRect(7, 0, 2, 7);
    g.fillStyle(0x8798d0, 1).fillRect(2, 2, 6, 2).fillRect(9, 10, 5, 2);
    g.fillStyle(0x121733, 1).fillRect(0, 0, 16, 1).fillRect(0, 15, 16, 1);
  });

  makeTexture(scene, 'brick-fragment-athletic', 16, 16, (g) => {
    g.fillStyle(0xc97448, 1).fillRect(0, 0, 16, 16);
    g.fillStyle(0x6d3a31, 1).fillRect(0, 7, 16, 2).fillRect(7, 0, 2, 7);
    g.fillStyle(0xffbd7a, 1).fillRect(2, 2, 6, 2).fillRect(9, 10, 5, 2);
    g.fillStyle(0x4b2722, 1).fillRect(0, 0, 16, 1).fillRect(0, 15, 16, 1);
  });

  makeTexture(scene, 'brick-fragment-fortress', 16, 16, (g) => {
    g.fillStyle(0x3a3d5d, 1).fillRect(0, 0, 16, 16);
    g.fillStyle(0x151827, 1).fillRect(0, 7, 16, 2).fillRect(7, 0, 2, 7);
    g.fillStyle(0x727b9e, 1).fillRect(2, 2, 6, 2).fillRect(9, 10, 5, 2);
    g.fillStyle(0x0d0f1b, 1).fillRect(0, 0, 16, 1).fillRect(0, 15, 16, 1);
  });

  makeTexture(scene, 'tile-bonus', 32, 32, (g) => {
    drawQuestionBlock(g, {
      base: 0xf0a736,
      shade: 0xa86025,
      highlight: 0xffe26a,
      outline: 0x5b3023
    });
  });

  makeTexture(scene, 'tile-bonus-bright', 32, 32, (g) => {
    drawQuestionBlock(g, {
      base: 0xffca45,
      shade: 0xc7792b,
      highlight: 0xffffa3,
      outline: 0x69351f
    });
  });

  makeTexture(scene, 'tile-bonus-shadow', 32, 32, (g) => {
    drawQuestionBlock(g, {
      base: 0xd98b32,
      shade: 0x88491f,
      highlight: 0xffc55f,
      outline: 0x4f281d
    });
  });

  makeTexture(scene, 'tile-used', 32, 32, (g) => {
    drawUsedBlock(g, {
      base: 0xb87546,
      shade: 0x6d3a2b,
      highlight: 0xd99a63,
      outline: 0x4c241f
    });
  });

  makeTexture(scene, 'tile-used-underground', 32, 32, (g) => {
    drawUsedBlock(g, {
      base: 0x556083,
      shade: 0x2b3356,
      highlight: 0x8798d0,
      outline: 0x121733
    });
  });

  makeTexture(scene, 'tile-used-fortress', 32, 32, (g) => {
    drawUsedBlock(g, {
      base: 0x464a63,
      shade: 0x1a1d2e,
      highlight: 0x8b93af,
      outline: 0x0d0f1b
    });
  });

  makeTexture(scene, 'coin', 18, 18, (g) => {
    g.fillStyle(0x7a3f18, 1).fillRect(4, 1, 10, 2).fillRect(2, 3, 14, 12).fillRect(4, 15, 10, 2);
    g.fillStyle(0xf0a42f, 1).fillRect(5, 2, 8, 2).fillRect(4, 4, 10, 10).fillRect(5, 14, 8, 2);
    g.fillStyle(0xffe66d, 1).fillRect(7, 3, 5, 12).fillRect(5, 6, 2, 5);
    g.fillStyle(0xfffbca, 1).fillRect(7, 4, 2, 9).fillRect(10, 3, 1, 3);
  });

  makeTexture(scene, 'coin-mid', 18, 18, (g) => {
    g.fillStyle(0x7a3f18, 1).fillRect(6, 1, 6, 2).fillRect(5, 3, 8, 12).fillRect(6, 15, 6, 2);
    g.fillStyle(0xf0a42f, 1).fillRect(7, 2, 4, 2).fillRect(7, 4, 4, 10).fillRect(7, 14, 4, 2);
    g.fillStyle(0xfffbca, 1).fillRect(8, 4, 2, 9);
  });

  makeTexture(scene, 'coin-side', 18, 18, (g) => {
    g.fillStyle(0x7a3f18, 1).fillRect(8, 1, 3, 16);
    g.fillStyle(0xf0a42f, 1).fillRect(9, 2, 1, 14);
    g.fillStyle(0xfffbca, 1).fillRect(10, 4, 1, 8);
  });

  makeTexture(scene, 'powerup', 28, 28, (g) => {
    g.fillStyle(0x4c241f, 1).fillRect(5, 11, 18, 5).fillRect(7, 6, 15, 5).fillRect(9, 3, 10, 4);
    g.fillStyle(0xd94830, 1).fillRect(4, 11, 20, 6).fillRect(7, 6, 15, 6).fillRect(10, 3, 9, 4);
    g.fillStyle(0xfff4bf, 1).fillRect(7, 9, 5, 4).fillRect(17, 8, 4, 4);
    g.fillStyle(0x4c241f, 1).fillRect(7, 17, 15, 8).fillRect(9, 25, 11, 2);
    g.fillStyle(0xffd08a, 1).fillRect(9, 17, 11, 8);
    g.fillStyle(0x111927, 1).fillRect(10, 20, 2, 3).fillRect(17, 20, 2, 3);
  });

  makeTexture(scene, 'powerup-spark', 28, 28, (g) => {
    g.fillStyle(0x0b4f28, 1).fillRect(13, 17, 4, 10);
    g.fillStyle(0x35b84f, 1).fillRect(14, 17, 2, 10);
    g.fillStyle(0x0b4f28, 1).fillEllipse(9, 21, 11, 7).fillEllipse(21, 18, 11, 7);
    g.fillStyle(0x6fe86d, 1).fillEllipse(9, 20, 8, 5).fillEllipse(20, 17, 8, 5);
    g.fillStyle(0xa6282b, 1).fillEllipse(14, 10, 24, 20);
    g.fillStyle(0xfff4bf, 1).fillEllipse(14, 10, 15, 13);
    g.fillStyle(0xff7b35, 1).fillEllipse(7, 10, 8, 9).fillEllipse(21, 10, 8, 9).fillEllipse(14, 4, 8, 8).fillEllipse(14, 17, 8, 8);
    g.fillStyle(0xfff4bf, 1).fillEllipse(14, 10, 8, 7);
    g.fillStyle(0x111927, 1).fillRect(11, 10, 2, 2).fillRect(16, 10, 2, 2);
  });

  makeTexture(scene, 'powerup-life', 28, 28, (g) => {
    g.fillStyle(0x0b4f28, 1).fillRect(5, 11, 18, 5).fillRect(7, 6, 15, 5).fillRect(9, 3, 10, 4);
    g.fillStyle(0x42d85f, 1).fillRect(4, 11, 20, 6).fillRect(7, 6, 15, 6).fillRect(10, 3, 9, 4);
    g.fillStyle(0xe9fff1, 1).fillRect(7, 9, 5, 4).fillRect(17, 8, 4, 4).fillRect(13, 5, 2, 9).fillRect(10, 9, 8, 2);
    g.fillStyle(0x4c241f, 1).fillRect(7, 17, 15, 8).fillRect(9, 25, 11, 2);
    g.fillStyle(0xffd08a, 1).fillRect(9, 17, 11, 8);
    g.fillStyle(0x111927, 1).fillRect(10, 20, 2, 3).fillRect(17, 20, 2, 3);
  });

  makeTexture(scene, 'spark-shot', 14, 14, (g) => {
    g.fillStyle(0xfff6a6, 1).fillEllipse(7, 7, 13, 13);
    g.fillStyle(0xff7b54, 1).fillEllipse(7, 7, 8, 8);
    g.fillStyle(0xa8fff2, 1).fillRect(6, 0, 2, 14).fillRect(0, 6, 14, 2);
  });

  makeTexture(scene, 'powerup-star', 28, 28, (g) => {
    g.fillStyle(0x7a3f18, 1).fillTriangle(14, 0, 18, 10, 28, 10);
    g.fillTriangle(28, 10, 20, 16, 24, 27);
    g.fillTriangle(24, 27, 14, 21, 4, 27);
    g.fillTriangle(4, 27, 8, 16, 0, 10);
    g.fillTriangle(0, 10, 10, 10, 14, 0);
    g.fillStyle(0xffe66d, 1).fillTriangle(14, 2, 18, 11, 26, 11);
    g.fillTriangle(26, 11, 19, 16, 22, 25);
    g.fillTriangle(22, 25, 14, 20, 6, 25);
    g.fillTriangle(6, 25, 9, 16, 2, 11);
    g.fillTriangle(2, 11, 10, 11, 14, 2);
    g.fillStyle(0xfffbca, 1).fillRect(12, 5, 3, 4).fillRect(8, 12, 12, 3);
    g.fillStyle(0x111927, 1).fillRect(10, 12, 2, 3).fillRect(17, 12, 2, 3);
  });

  makeTexture(scene, 'player', 28, 34, (g) => {
    g.fillStyle(0x132236, 1).fillRect(7, 29, 6, 4).fillRect(17, 29, 6, 4);
    g.fillStyle(0x14a6a0, 1).fillRect(7, 12, 14, 17);
    g.fillStyle(0xffd17b, 1).fillRect(9, 5, 12, 9);
    g.fillStyle(0x24607a, 1).fillRect(7, 2, 15, 5).fillRect(4, 6, 20, 4);
    g.fillStyle(0xffef94, 1).fillRect(20, 15, 3, 10);
    g.fillStyle(0x132236, 1).fillRect(18, 8, 2, 2).fillRect(11, 29, 3, 3).fillRect(19, 29, 3, 3);
  });

  makeTexture(scene, 'enemy', 28, 24, (g) => {
    g.fillStyle(0x111927, 1).fillRect(5, 20, 7, 4).fillRect(17, 20, 7, 4);
    g.fillStyle(0x7f3e35, 1).fillEllipse(14, 12, 26, 21);
    g.fillStyle(0xb96e4b, 1).fillEllipse(14, 8, 23, 14);
    g.fillStyle(0xe0a178, 1).fillRect(7, 11, 15, 8);
    g.fillStyle(0x111927, 1).fillRect(9, 12, 3, 4).fillRect(17, 12, 3, 4);
    g.fillStyle(0x5a2b25, 1).fillRect(6, 18, 17, 2);
    g.fillStyle(0xffd49a, 1).fillRect(7, 5, 5, 2).fillRect(17, 5, 4, 2);
  });

  makeTexture(scene, 'enemy-step', 28, 24, (g) => {
    g.fillStyle(0x111927, 1).fillRect(3, 20, 8, 4).fillRect(19, 21, 6, 3);
    g.fillStyle(0x6d352f, 1).fillEllipse(14, 12, 26, 21);
    g.fillStyle(0xc77952, 1).fillEllipse(14, 8, 23, 14);
    g.fillStyle(0xe0a178, 1).fillRect(7, 11, 15, 8);
    g.fillStyle(0x111927, 1).fillRect(8, 12, 3, 4).fillRect(16, 12, 3, 4);
    g.fillStyle(0x5a2b25, 1).fillRect(6, 18, 17, 2);
    g.fillStyle(0xffd49a, 1).fillRect(7, 5, 5, 2).fillRect(17, 5, 4, 2);
  });

  makeTexture(scene, 'enemy-crushed', 28, 14, (g) => {
    g.fillStyle(0x111927, 1).fillRect(4, 10, 20, 3);
    g.fillStyle(0x6d352f, 1).fillEllipse(14, 8, 26, 10);
    g.fillStyle(0xc77952, 1).fillEllipse(14, 5, 22, 7);
    g.fillStyle(0xe0a178, 1).fillRect(6, 7, 17, 3);
    g.fillStyle(0x111927, 1).fillRect(8, 7, 5, 1).fillRect(16, 7, 5, 1);
  });

  makeTexture(scene, 'enemy-shellback', 30, 28, (g) => {
    g.fillStyle(0x10231f, 1).fillRect(6, 24, 7, 3).fillRect(20, 24, 6, 3);
    g.fillStyle(0x10231f, 1).fillEllipse(9, 13, 13, 12);
    g.fillStyle(0xffe3a4, 1).fillEllipse(8, 13, 10, 9);
    g.fillStyle(0x10231f, 1).fillRect(4, 12, 3, 2).fillRect(7, 9, 3, 3);
    g.fillStyle(0xf8fbff, 1).fillRect(8, 9, 2, 2);
    g.fillStyle(0x10231f, 1).fillEllipse(18, 13, 22, 20);
    g.fillStyle(0x1f8a4b, 1).fillEllipse(18, 12, 18, 16);
    g.fillStyle(0x54d978, 1).fillEllipse(16, 9, 12, 8);
    g.fillStyle(0x0f5b38, 1).fillRect(9, 14, 19, 4).fillRect(15, 5, 3, 16);
    g.fillStyle(0xffe3a4, 1).fillRect(9, 18, 18, 4);
    g.fillStyle(0x7b4f2e, 1).fillRect(11, 20, 13, 2);
    g.fillStyle(0xf8fbff, 0.75).fillRect(13, 7, 4, 2);
  });

  makeTexture(scene, 'enemy-shellback-step', 30, 28, (g) => {
    g.fillStyle(0x10231f, 1).fillRect(4, 24, 8, 3).fillRect(19, 23, 7, 3);
    g.fillStyle(0x10231f, 1).fillEllipse(9, 13, 13, 12);
    g.fillStyle(0xffe3a4, 1).fillEllipse(8, 13, 10, 9);
    g.fillStyle(0x10231f, 1).fillRect(4, 12, 3, 2).fillRect(7, 9, 3, 3);
    g.fillStyle(0xf8fbff, 1).fillRect(8, 9, 2, 2);
    g.fillStyle(0x10231f, 1).fillEllipse(18, 13, 22, 20);
    g.fillStyle(0x249552, 1).fillEllipse(18, 12, 18, 16);
    g.fillStyle(0x65e486, 1).fillEllipse(16, 9, 12, 8);
    g.fillStyle(0x0f5b38, 1).fillRect(9, 14, 19, 4).fillRect(15, 5, 3, 16);
    g.fillStyle(0xffe3a4, 1).fillRect(9, 18, 18, 4);
    g.fillStyle(0x7b4f2e, 1).fillRect(11, 20, 13, 2);
    g.fillStyle(0xf8fbff, 0.75).fillRect(13, 7, 4, 2);
  });

  makeTexture(scene, 'enemy-wing-shellback', 38, 32, (g) => {
    g.fillStyle(0x8ed6ff, 1).fillEllipse(29, 12, 15, 18);
    g.fillStyle(0xf8fbff, 1).fillEllipse(28, 10, 12, 15);
    g.fillStyle(0x8ed6ff, 1).fillEllipse(10, 12, 15, 18);
    g.fillStyle(0xf8fbff, 1).fillEllipse(9, 10, 12, 15);
    g.fillStyle(0x10231f, 1).fillRect(10, 28, 7, 3).fillRect(24, 28, 6, 3);
    g.fillStyle(0x10231f, 1).fillEllipse(13, 16, 13, 12);
    g.fillStyle(0xffe3a4, 1).fillEllipse(12, 16, 10, 9);
    g.fillStyle(0x10231f, 1).fillRect(8, 15, 3, 2).fillRect(11, 12, 3, 3);
    g.fillStyle(0xf8fbff, 1).fillRect(12, 12, 2, 2);
    g.fillStyle(0x10231f, 1).fillEllipse(22, 16, 22, 20);
    g.fillStyle(0x1f8a4b, 1).fillEllipse(22, 15, 18, 16);
    g.fillStyle(0x54d978, 1).fillEllipse(20, 12, 12, 8);
    g.fillStyle(0x0f5b38, 1).fillRect(13, 17, 19, 4).fillRect(19, 8, 3, 16);
    g.fillStyle(0xffe3a4, 1).fillRect(13, 21, 18, 4);
    g.fillStyle(0x7b4f2e, 1).fillRect(15, 23, 13, 2);
  });

  makeTexture(scene, 'enemy-wing-shellback-step', 38, 32, (g) => {
    g.fillStyle(0x8ed6ff, 1).fillEllipse(29, 8, 14, 17);
    g.fillStyle(0xf8fbff, 1).fillEllipse(28, 7, 11, 14);
    g.fillStyle(0x8ed6ff, 1).fillEllipse(10, 8, 14, 17);
    g.fillStyle(0xf8fbff, 1).fillEllipse(9, 7, 11, 14);
    g.fillStyle(0x10231f, 1).fillRect(8, 28, 8, 3).fillRect(24, 27, 7, 3);
    g.fillStyle(0x10231f, 1).fillEllipse(13, 17, 13, 12);
    g.fillStyle(0xffe3a4, 1).fillEllipse(12, 17, 10, 9);
    g.fillStyle(0x10231f, 1).fillRect(8, 16, 3, 2).fillRect(11, 13, 3, 3);
    g.fillStyle(0xf8fbff, 1).fillRect(12, 13, 2, 2);
    g.fillStyle(0x10231f, 1).fillEllipse(22, 17, 22, 20);
    g.fillStyle(0x249552, 1).fillEllipse(22, 16, 18, 16);
    g.fillStyle(0x65e486, 1).fillEllipse(20, 13, 12, 8);
    g.fillStyle(0x0f5b38, 1).fillRect(13, 18, 19, 4).fillRect(19, 9, 3, 16);
    g.fillStyle(0xffe3a4, 1).fillRect(13, 22, 18, 4);
    g.fillStyle(0x7b4f2e, 1).fillRect(15, 24, 13, 2);
  });

  makeTexture(scene, 'enemy-shell', 30, 20, (g) => {
    g.fillStyle(0x10231f, 1).fillEllipse(15, 12, 28, 16);
    g.fillStyle(0x1f8a4b, 1).fillEllipse(15, 10, 23, 13);
    g.fillStyle(0x54d978, 1).fillEllipse(13, 8, 14, 8);
    g.fillStyle(0x0f5b38, 1).fillRect(4, 12, 22, 3).fillRect(14, 4, 3, 10);
    g.fillStyle(0xffe3a4, 1).fillRect(5, 15, 20, 3);
    g.fillStyle(0x7b4f2e, 1).fillRect(8, 17, 14, 2);
    g.fillStyle(0xf8fbff, 0.75).fillRect(10, 7, 5, 2);
  });

  makeTexture(scene, 'enemy-shell-wake', 30, 20, (g) => {
    g.fillStyle(0x10231f, 1).fillEllipse(15, 12, 28, 16);
    g.fillStyle(0x2faa5b, 1).fillEllipse(15, 10, 23, 13);
    g.fillStyle(0x75f09a, 1).fillEllipse(13, 8, 14, 8);
    g.fillStyle(0x0f5b38, 1).fillRect(4, 12, 22, 3).fillRect(14, 4, 3, 10);
    g.fillStyle(0xffe3a4, 1).fillRect(5, 15, 20, 3);
    g.fillStyle(0x10231f, 1).fillRect(6, 14, 4, 2).fillRect(21, 14, 4, 2);
    g.fillStyle(0x7b4f2e, 1).fillRect(8, 17, 14, 2);
    g.fillStyle(0xf8fbff, 0.75).fillRect(10, 6, 5, 2);
  });

  makeTexture(scene, 'enemy-hammer-thrower', 32, 34, (g) => {
    g.fillStyle(0x3b315f, 1).fillEllipse(16, 19, 27, 24);
    g.fillStyle(0x7b63c7, 1).fillEllipse(16, 14, 22, 17);
    g.fillStyle(0xffd166, 1).fillRect(5, 11, 6, 10).fillRect(21, 11, 6, 10);
    g.fillStyle(0xf8fbff, 1).fillRect(10, 11, 4, 5).fillRect(19, 11, 4, 5);
    g.fillStyle(0x111927, 1).fillRect(12, 13, 2, 2).fillRect(20, 13, 2, 2);
    g.fillStyle(0xfff4a3, 1).fillRect(10, 22, 12, 4);
    g.fillStyle(0x111927, 1).fillRect(7, 29, 7, 4).fillRect(19, 29, 7, 4);
    g.fillStyle(0x8b5735, 1).fillRect(23, 3, 3, 12);
    g.fillStyle(0xcfd7e6, 1).fillRoundedRect(20, 1, 9, 6, 2);
  });

  makeTexture(scene, 'enemy-hammer', 18, 18, (g) => {
    g.fillStyle(0x6d4228, 1).fillRect(8, 3, 3, 13);
    g.fillStyle(0xcfd7e6, 1).fillRoundedRect(3, 1, 12, 6, 2);
    g.fillRoundedRect(2, 11, 13, 5, 2);
    g.fillStyle(0xf8fbff, 0.65).fillRect(5, 2, 5, 2).fillRect(4, 12, 5, 2);
  });

  makeTexture(scene, 'enemy-pipe-plant', 30, 38, (g) => {
    g.fillStyle(0x063d1f, 1).fillRect(13, 18, 5, 20);
    g.fillStyle(0x35b84f, 1).fillRect(14, 18, 3, 20);
    g.fillStyle(0x0b4f28, 1).fillEllipse(8, 27, 13, 8).fillEllipse(23, 23, 13, 8);
    g.fillStyle(0x6fe86d, 1).fillEllipse(8, 26, 10, 6).fillEllipse(22, 22, 10, 6);
    g.fillStyle(0x5f1126, 1).fillEllipse(15, 13, 29, 25);
    g.fillStyle(0xd22e3e, 1).fillEllipse(15, 12, 24, 21);
    g.fillStyle(0xf8fbff, 1).fillEllipse(8, 10, 7, 6).fillEllipse(21, 14, 7, 6).fillEllipse(16, 5, 7, 5).fillEllipse(12, 18, 5, 4);
    g.fillStyle(0x5f1126, 1).fillEllipse(15, 17, 16, 9);
    g.fillStyle(0x101927, 1).fillRect(8, 10, 2, 2).fillRect(20, 10, 2, 2);
    g.fillStyle(0xfff4bf, 1).fillTriangle(8, 16, 12, 18, 10, 21);
    g.fillTriangle(18, 18, 22, 16, 20, 21);
    g.fillTriangle(13, 14, 15, 17, 17, 14);
  });

  makeTexture(scene, 'enemy-guardian', 56, 54, (g) => {
    g.fillStyle(0x162033, 1).fillEllipse(28, 28, 50, 42);
    g.fillStyle(0x6f3fb3, 1).fillEllipse(28, 24, 43, 32);
    g.fillStyle(0xf0b94d, 1).fillTriangle(10, 15, 2, 2, 19, 12);
    g.fillTriangle(46, 15, 54, 2, 37, 12);
    g.fillStyle(0xffe66d, 1).fillRect(17, 33, 22, 8);
    g.fillStyle(0xfff4bf, 1).fillTriangle(17, 33, 21, 42, 24, 33);
    g.fillTriangle(31, 33, 35, 42, 38, 33);
    g.fillStyle(0xf8fbff, 1).fillRect(15, 18, 8, 7).fillRect(33, 18, 8, 7);
    g.fillStyle(0x111927, 1).fillRect(19, 21, 3, 3).fillRect(34, 21, 3, 3);
    g.fillStyle(0xff6b3a, 1).fillRect(9, 38, 9, 5).fillRect(38, 38, 9, 5);
    g.fillStyle(0x0e1729, 1).fillRect(11, 45, 12, 5).fillRect(33, 45, 12, 5);
  });

  makeTexture(scene, 'guardian-fireball', 20, 20, (g) => {
    g.fillStyle(0xfff08a, 1).fillEllipse(10, 10, 19, 19);
    g.fillStyle(0xff6b3a, 1).fillEllipse(10, 11, 14, 15);
    g.fillStyle(0xd83232, 1).fillTriangle(3, 10, 12, 2, 17, 15);
    g.fillStyle(0xffffff, 0.9).fillEllipse(8, 6, 5, 3);
  });

  makeTexture(scene, 'lava-bubble', 24, 28, (g) => {
    g.fillStyle(0xfff08a, 1).fillEllipse(12, 14, 21, 26);
    g.fillStyle(0xff6b3a, 1).fillEllipse(12, 16, 16, 21);
    g.fillStyle(0xd83232, 1).fillEllipse(12, 18, 10, 14);
    g.fillStyle(0xfff4bf, 1).fillEllipse(8, 8, 5, 5).fillEllipse(15, 6, 4, 4);
    g.fillStyle(0x111927, 1).fillRect(7, 11, 3, 3).fillRect(15, 11, 3, 3);
    g.fillStyle(0xffd166, 1).fillRect(8, 20, 8, 3);
  });

  makeTexture(scene, 'cannon-launcher', 32, 32, (g) => {
    g.fillStyle(0x111927, 1).fillRoundedRect(3, 4, 26, 25, 4);
    g.fillStyle(0x3a4a63, 1).fillRoundedRect(6, 7, 20, 18, 3);
    g.fillStyle(0x0b111d, 1).fillEllipse(16, 13, 17, 12);
    g.fillStyle(0x72839f, 1).fillRect(7, 23, 18, 3).fillRect(9, 5, 14, 3);
    g.fillStyle(0xf8fbff, 0.36).fillRect(8, 8, 4, 12);
  });

  makeTexture(scene, 'cannon-shot', 26, 20, (g) => {
    g.fillStyle(0x0c111c, 1).fillEllipse(13, 10, 25, 17);
    g.fillStyle(0x263247, 1).fillEllipse(10, 8, 16, 10);
    g.fillStyle(0xf8fbff, 1).fillEllipse(8, 8, 5, 5);
    g.fillStyle(0x111927, 1).fillRect(7, 8, 2, 2);
    g.fillStyle(0x707f98, 1).fillRect(20, 8, 4, 4);
  });

  makeTexture(scene, 'flag', 32, 24, (g) => {
    g.fillStyle(0x063d1f, 1).fillRect(0, 1, 31, 21);
    g.fillStyle(0x24b86f, 1).fillRect(2, 3, 26, 17);
    g.fillStyle(0x79f26d, 1).fillRect(4, 4, 20, 3).fillRect(4, 7, 4, 10);
    g.fillStyle(0x0b4f28, 1).fillRect(24, 3, 4, 17).fillRect(2, 18, 26, 2);
    g.fillStyle(0xe9fff1, 1).fillRect(10, 8, 9, 3).fillRect(8, 11, 13, 4).fillRect(10, 15, 9, 2);
    g.fillStyle(0x24b86f, 1).fillRect(13, 11, 3, 3);
  });

  makeTexture(scene, 'flagpole-cap', 22, 22, (g) => {
    g.fillStyle(0x7a3f18, 1).fillRect(7, 0, 8, 3).fillRect(4, 3, 14, 3).fillRect(1, 6, 20, 10).fillRect(4, 16, 14, 3).fillRect(7, 19, 8, 3);
    g.fillStyle(0xffe66d, 1).fillRect(7, 3, 8, 3).fillRect(4, 6, 14, 8).fillRect(7, 14, 8, 3);
    g.fillStyle(0xfffbca, 1).fillRect(7, 5, 5, 3).fillRect(5, 8, 4, 4);
  });

  makeTexture(scene, 'fortress-bridge', 26, 12, (g) => {
    g.fillStyle(0x111927, 1).fillRoundedRect(0, 3, 26, 8, 2);
    g.fillStyle(0x7f4e3b, 1).fillRoundedRect(2, 1, 22, 8, 2);
    g.fillStyle(0xd49a55, 1).fillRect(5, 2, 5, 6).fillRect(15, 2, 5, 6);
  });

  makeTexture(scene, 'gate-switch', 34, 28, (g) => {
    g.fillStyle(0x151827, 1).fillRect(3, 18, 28, 8);
    g.fillStyle(0x8b93af, 1).fillRoundedRect(7, 12, 20, 10, 3);
    g.fillStyle(0xffd166, 1).fillRoundedRect(10, 4, 14, 12, 3);
    g.fillStyle(0xfff08a, 1).fillRect(13, 6, 8, 3);
  });

  makeTexture(scene, 'gate-switch-down', 34, 28, (g) => {
    g.fillStyle(0x151827, 1).fillRect(3, 18, 28, 8);
    g.fillStyle(0x8b93af, 1).fillRoundedRect(7, 12, 20, 10, 3);
    g.fillStyle(0xff6b3a, 1).fillRoundedRect(10, 10, 14, 7, 3);
  });

  makeTexture(scene, 'fortress-gate', 90, 116, (g) => {
    g.fillStyle(0x171a2b, 1).fillRect(12, 28, 66, 82);
    g.fillStyle(0x3a3d5d, 1).fillRect(16, 20, 14, 18).fillRect(38, 20, 14, 18).fillRect(60, 20, 14, 18);
    g.fillStyle(0x5f6688, 1).fillRect(16, 44, 58, 8).fillRect(16, 72, 58, 7);
    g.fillStyle(0x0d1020, 1).fillEllipse(45, 82, 34, 44).fillRect(28, 82, 34, 28);
    g.fillStyle(0xff6b3a, 0.36).fillRect(40, 78, 4, 32).fillRect(47, 78, 4, 32);
    g.fillStyle(0x8b93af, 1).fillRect(22, 54, 10, 9).fillRect(59, 54, 10, 9);
    g.fillStyle(0x101624, 1).fillRect(18, 106, 54, 6);
  });

  makeTexture(scene, 'goal-house', 104, 104, (g) => {
    g.fillStyle(0x111927, 1).fillRect(8, 94, 88, 7);
    g.fillStyle(0x5a2b25, 1).fillRect(12, 42, 80, 53).fillRect(18, 24, 18, 70).fillRect(68, 24, 18, 70);
    g.fillStyle(0xb96e4b, 1).fillRect(15, 43, 74, 50).fillRect(20, 25, 14, 67).fillRect(70, 25, 14, 67);
    g.fillStyle(0xe0a178, 1).fillRect(18, 46, 12, 4).fillRect(39, 46, 12, 4).fillRect(60, 46, 12, 4).fillRect(24, 65, 13, 4).fillRect(54, 65, 13, 4).fillRect(72, 31, 8, 3).fillRect(22, 31, 8, 3);
    g.fillStyle(0x4c241f, 1).fillRect(12, 57, 80, 3).fillRect(12, 78, 80, 3).fillRect(34, 43, 3, 50).fillRect(52, 43, 3, 50).fillRect(67, 25, 3, 68);
    g.fillStyle(0x111927, 1).fillRect(15, 18, 23, 10).fillRect(66, 18, 23, 10).fillRect(30, 32, 44, 13);
    g.fillStyle(0xc87538, 1).fillRect(18, 15, 6, 13).fillRect(28, 15, 6, 13).fillRect(69, 15, 6, 13).fillRect(79, 15, 6, 13).fillRect(34, 29, 7, 16).fillRect(48, 29, 7, 16).fillRect(62, 29, 7, 16);
    g.fillStyle(0xe8a162, 1).fillRect(19, 16, 4, 3).fillRect(29, 16, 4, 3).fillRect(70, 16, 4, 3).fillRect(80, 16, 4, 3).fillRect(35, 30, 5, 3).fillRect(49, 30, 5, 3).fillRect(63, 30, 5, 3);
    g.fillStyle(0x111927, 1).fillRect(24, 49, 10, 12).fillRect(70, 49, 10, 12);
    g.fillStyle(0xf8fbff, 0.7).fillRect(25, 50, 8, 2).fillRect(71, 50, 8, 2);
    g.fillStyle(0x111927, 1).fillEllipse(52, 82, 27, 34).fillRect(39, 82, 26, 15);
    g.fillStyle(0x0b1024, 1).fillEllipse(52, 84, 20, 28).fillRect(42, 84, 20, 13);
    g.fillStyle(0x36465f, 1).fillRect(51, 72, 3, 26);
    g.fillStyle(0xffe66d, 1).fillRect(58, 84, 3, 3);
  });

  makeTexture(scene, 'spike', 32, 32, (g) => {
    g.fillStyle(0x36465f, 1).fillRect(0, 24, 32, 8);
    g.fillStyle(0xf4f8ff, 1).fillTriangle(1, 25, 8, 6, 15, 25);
    g.fillStyle(0xc8d4e6, 1).fillTriangle(14, 25, 22, 3, 30, 25);
  });

  makeTexture(scene, 'lava', 32, 32, (g) => {
    g.fillStyle(0x4d1830, 1).fillRect(0, 0, 32, 32);
    g.fillStyle(0xff5a2e, 1).fillRect(0, 10, 32, 22);
    g.fillStyle(0xffc247, 1).fillEllipse(7, 14, 13, 6).fillEllipse(22, 18, 15, 7).fillEllipse(14, 26, 11, 5);
    g.fillStyle(0xfff08a, 0.95).fillRect(3, 11, 7, 2).fillRect(18, 17, 8, 2);
    g.fillStyle(0x2b1020, 1).fillRect(0, 0, 32, 6);
  });

  makeTexture(scene, 'firebar-flame', 18, 18, (g) => {
    g.fillStyle(0xfff08a, 1).fillEllipse(9, 9, 17, 17);
    g.fillStyle(0xff6b3a, 1).fillEllipse(9, 10, 13, 15);
    g.fillStyle(0xd83232, 1).fillTriangle(9, 1, 15, 13, 5, 15);
    g.fillStyle(0xffffff, 0.9).fillEllipse(7, 6, 4, 3);
  });

  makeTexture(scene, 'firebar-hub', 18, 18, (g) => {
    g.fillStyle(0x111927, 1).fillEllipse(9, 9, 18, 18);
    g.fillStyle(0x8b93af, 1).fillEllipse(9, 9, 12, 12);
    g.fillStyle(0xffd166, 1).fillEllipse(9, 9, 5, 5);
  });

  makeTexture(scene, 'spark', 8, 8, (g) => {
    g.fillStyle(0xffffff, 1).fillRect(3, 0, 2, 8).fillRect(0, 3, 8, 2);
    g.fillStyle(0xffcf4a, 1).fillRect(3, 3, 2, 2);
  });

  makeTexture(scene, 'dust-puff', 14, 10, (g) => {
    g.fillStyle(0xfff2c4, 0.94).fillEllipse(5, 6, 9, 6);
    g.fillStyle(0xe3bb7a, 0.86).fillEllipse(10, 7, 8, 5);
    g.fillStyle(0xffffff, 0.72).fillEllipse(7, 4, 6, 4);
  });
};
