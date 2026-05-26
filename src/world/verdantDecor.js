/** Lush vines, moss, and greenery for Verdant Depths (bloom biome). */

import { fillSlots, slotDuration, slotInt, staggeredSlots } from "./placement.js";

function addHangingVine(scene, x, topY, length, depth, lean = 1) {
  const g = scene.add.graphics();
  g.lineStyle(2 + (length % 3), 0x3f6212, 0.55);
  const segs = 4;
  let px = 0;
  let py = 0;
  g.beginPath();
  g.moveTo(0, 0);
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const nx = lean * 12 * Math.sin(t * Math.PI) + (i % 2 === 0 ? 6 : -4);
    const ny = (length / segs) * i;
    g.lineTo(nx, ny);
    px = nx;
    py = ny;
  }
  g.strokePath();
  g.lineStyle(1.5, 0x4ade80, 0.45);
  g.lineBetween(px - 4, py - 8, px, py);
  g.lineBetween(px + 5, py - 12, px + 2, py - 2);
  g.setPosition(x, topY);
  g.setDepth(depth);
  return g;
}

function addGroundBush(scene, x, groundY, depth) {
  scene.add.ellipse(x, groundY - 6, 36 + (x % 20), 18, 0x14532d, 0.65).setDepth(depth);
  scene.add.ellipse(x - 8, groundY - 10, 24, 14, 0x166534, 0.55).setDepth(depth);
  scene.add.ellipse(x + 10, groundY - 8, 28, 16, 0x22c55e, 0.4).setDepth(depth);
}

function addFernCluster(scene, x, y, depth) {
  for (let i = -2; i <= 2; i++) {
    scene.add
      .triangle(x + i * 10, y, 0, 22, 6, 0, -6, 0, 0x15803d, 0.5)
      .setDepth(depth);
    scene.add
      .triangle(x + i * 8, y + 4, 0, 18, 5, 0, -5, 0, 0x4ade80, 0.35)
      .setDepth(depth);
  }
}

function addDriftingSpores(scene, xMin, xMax, groundY, height, count) {
  for (let i = 0; i < count; i++) {
    const x = xMin + ((xMax - xMin) * i) / Math.max(1, count - 1);
    const spore = scene.add.circle(x, groundY - 80 - (i % 6) * 35, 2 + (i % 4), 0xbbf7d0, 0.35);
    spore.setDepth(2);
    scene.tweens.add({
      targets: spore,
      y: spore.y - 25 - (i % 3) * 10,
      x: spore.x + (i % 2 === 0 ? 18 : -18),
      alpha: 0.12,
      duration: 2800 + i * 180,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}

/**
 * @param {Phaser.Scene} scene
 * @param {number} worldW
 * @param {number} groundY
 * @param {number} height
 * @param {{ platforms?: {x,y,w}[], xMin?: number, xMax?: number, dense?: boolean }} opts
 */
export function createVerdantGreenery(scene, worldW, groundY, height, opts = {}) {
  const xMin = opts.xMin ?? 40;
  const xMax = opts.xMax ?? worldW - 40;
  const span = xMax - xMin;
  const dense = opts.dense ?? false;
  const depthFar = 0;
  const depthMid = 1;
  const depthNear = 3;

  scene.add.rectangle(worldW / 2, height * 0.52, worldW + 500, height, 0x052e16, 0.22).setDepth(depthFar);
  scene.add.rectangle(worldW / 2, groundY - 60, worldW + 300, 140, 0x166534, 0.18).setDepth(depthFar);

  staggeredSlots(dense ? 14 : 10, xMin, xMax, dense ? 16 : 22, 0).forEach((x, i) => {
    const topY = height - slotInt(i, 188, 228, 1);
    const len = slotInt(i, 52, 78, 2);
    addHangingVine(scene, x, topY, len, depthFar, i % 2 === 0 ? 1 : -1);
    if (i % 2 === 0) addHangingVine(scene, x + 25, topY + 20, len * 0.7, depthFar, -1);
  });

  fillSlots(dense ? 14 : 10, xMin, xMax).forEach((x) => addGroundBush(scene, x, groundY, depthNear));
  fillSlots(dense ? 7 : 5, xMin + 40, xMax).forEach((x) => addFernCluster(scene, x, groundY - 4, depthNear));

  const platforms = opts.platforms ?? [];
  for (const p of platforms) {
    scene.add.ellipse(p.x, p.y - 6, p.w + 24, 12, 0x15803d, 0.5).setDepth(depthMid);
    scene.add.ellipse(p.x - p.w * 0.3, p.y - 2, 8, 16, 0x4d7c0f, 0.45).setDepth(depthMid);
    scene.add.ellipse(p.x + p.w * 0.28, p.y - 2, 8, 16, 0x4d7c0f, 0.45).setDepth(depthMid);
    if (p.y < groundY - 30) {
      addHangingVine(scene, p.x - p.w * 0.35, p.y - 40, 38, depthMid, 1);
      addHangingVine(scene, p.x + p.w * 0.3, p.y - 35, 28, depthMid, -1);
    }
  }

  const ivyStep = dense ? 180 : 260;
  for (let x = xMin; x < xMax; x += ivyStep) {
    const col = scene.add.rectangle(x, height / 2, 14, height - 80, 0x365314, 0.12);
    col.setDepth(depthFar);
    for (let y = 120; y < groundY - 40; y += 50) {
      scene.add.ellipse(x + 6, y, 18, 10, 0x4ade80, 0.2).setDepth(depthFar);
    }
  }

  addDriftingSpores(scene, xMin, xMax, groundY, height, dense ? 18 : 12);

  for (let i = 0; i < (dense ? 8 : 5); i++) {
    const mx = xMin + (span * (i + 0.5)) / (dense ? 8 : 5);
    scene.add.circle(mx, groundY - 18 - (i % 3) * 6, 22 + (i % 4) * 6, 0x14532d, 0.35).setDepth(depthNear);
  }
}

/** Extra lush layer inside boss arena bounds. */
export function createVerdantArenaGreenery(scene, arena, groundY, height, platforms = []) {
  const worldW = scene.scale?.width ?? arena.innerRight + 200;
  createVerdantGreenery(scene, worldW, groundY, height, {
    xMin: arena.innerLeft,
    xMax: arena.innerRight,
    platforms,
    dense: true,
  });

  const arenaW = arena.innerRight - arena.innerLeft;
  for (let i = 0; i < 10; i++) {
    const x = arena.innerLeft + 30 + i * (arenaW / 10);
    scene.add.ellipse(x, groundY - 150 - (i % 3) * 18, 12, 55, 0x4d7c0f, 0.5).setDepth(0);
    scene.add.circle(x, groundY - 175 - (i % 2) * 10, 14, 0x86efac, 0.28).setDepth(0);
  }

  for (let i = 0; i < 4; i++) {
    const x = arena.centerX - 180 + i * 120;
    addFernCluster(scene, x, groundY + 2, 2);
  }
}
