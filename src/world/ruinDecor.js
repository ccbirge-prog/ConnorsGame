/** Teal mist, runes, and crystal glow for Ruin Plaza (ruins biome). */

import { fillSlots, shouldPlace, slotDuration, slotInt } from "./placement.js";

function addRuneGlyph(scene, x, y, size, depth) {
  const g = scene.add.graphics();
  g.lineStyle(2, 0x5eead4, 0.7);
  g.strokeCircle(0, 0, size);
  g.lineBetween(-size * 0.6, 0, size * 0.6, 0);
  g.lineBetween(0, -size * 0.6, 0, size * 0.6);
  g.fillStyle(0x22d3ee, 0.35);
  g.fillCircle(0, 0, size * 0.35);
  g.setPosition(x, y);
  g.setDepth(depth);
  scene.tweens.add({
    targets: g,
    alpha: 0.45,
    duration: 1200 + (x % 5) * 200,
    yoyo: true,
    repeat: -1,
  });
  return g;
}

function addBrokenColumn(scene, x, groundY, height, depth) {
  const h = 55 + (x % 4) * 18;
  const col = scene.add.rectangle(x, groundY - h / 2 - 10, 14, h, 0x334155, 0.55);
  col.setStrokeStyle(2, 0x475569, 0.8);
  col.setDepth(depth);
  scene.add.rectangle(x + 1, groundY - h + 15, 4, h - 20, 0x22d3ee, 0.25).setDepth(depth);
  scene.add.ellipse(x, groundY - h - 8, 10, 6, 0x38bdf8, 0.2).setDepth(depth);
}

function addSoulWisp(scene, x, y, depth) {
  const wisp = scene.add.circle(x, y, 3 + (x % 3), 0x67e8f9, 0.45);
  wisp.setDepth(depth);
  scene.tweens.add({
    targets: wisp,
    y: y - 20 - (x % 4) * 8,
    x: x + (x % 2 === 0 ? 12 : -12),
    alpha: 0.1,
    duration: 2400 + (x % 6) * 300,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function addMistPool(scene, x, groundY, depth) {
  scene.add.ellipse(x, groundY + 2, 48 + (x % 30), 12, 0x0e7490, 0.35).setDepth(depth);
  scene.add.ellipse(x, groundY, 32, 6, 0x22d3ee, 0.45).setDepth(depth);
}

/**
 * @param {Phaser.Scene} scene
 * @param {number} worldW
 * @param {number} groundY
 * @param {number} height
 * @param {{ platforms?: {x,y,w}[], xMin?: number, xMax?: number, dense?: boolean }} opts
 */
export function createRuinFeatures(scene, worldW, groundY, height, opts = {}) {
  const xMin = opts.xMin ?? 40;
  const xMax = opts.xMax ?? worldW - 40;
  const dense = opts.dense ?? false;
  const depthFar = 0;
  const depthMid = 1;
  const depthNear = 3;

  scene.add.rectangle(worldW / 2, height * 0.45, worldW + 400, height * 0.75, 0x0c4a6e, 0.15).setDepth(depthFar);
  scene.add.rectangle(worldW / 2, groundY - 40, worldW + 200, 100, 0x164e63, 0.12).setDepth(depthFar);
  scene.add.rectangle(worldW / 2, 75, worldW, 45, 0x38bdf8, 0.08).setDepth(depthFar);

  fillSlots(dense ? 8 : 5, xMin + 60, xMax).forEach((x, i) => {
    addBrokenColumn(scene, x, groundY, height, depthFar);
    if (shouldPlace(i, 2, 0)) {
      addRuneGlyph(scene, x, groundY - slotInt(i, 78, 108, 1), slotInt(i, 9, 13, 2), depthMid);
    }
  });

  fillSlots(dense ? 6 : 4, xMin + 80, xMax).forEach((x) => addMistPool(scene, x, groundY, depthNear));
  fillSlots(dense ? 16 : 11, xMin, xMax).forEach((x, i) => {
    addSoulWisp(scene, x, groundY - slotInt(i, 58, 98, 3), depthMid);
  });

  const platforms = opts.platforms ?? [];
  for (const p of platforms) {
    scene.add.ellipse(p.x, p.y + 6, p.w + 16, 8, 0x0e7490, 0.3).setDepth(depthMid);
    addRuneGlyph(scene, p.x, p.y - 8, 9, depthMid);
    if (p.y < groundY - 35) {
      scene.add.rectangle(p.x, p.y + 20, 3, 28, 0x22d3ee, 0.2).setDepth(depthFar);
    }
  }

  fillSlots(dense ? 10 : 7, xMin, xMax).forEach((x, i) => {
    const mist = scene.add.ellipse(x, groundY - slotInt(i, 18, 30, 4), 60, 35, 0x38bdf8, 0.06);
    mist.setDepth(depthFar);
    scene.tweens.add({
      targets: mist,
      alpha: 0.14,
      scaleX: 1.15,
      duration: slotDuration(i, 3500, 6, 5) * 400,
      yoyo: true,
      repeat: -1,
    });
  });

  fillSlots(dense ? 6 : 4, xMin, xMax).forEach((x, i) => {
    scene.add.circle(x, height - 160 - i * 25, 3, 0x7dd3fc, 0.5).setDepth(depthFar);
    scene.add.circle(x + 8, height - 150 - i * 20, 2, 0x22d3ee, 0.4).setDepth(depthFar);
  });
}

/** Dense blue ruin dressing inside boss arena. */
export function createRuinArenaFeatures(scene, arena, groundY, height, platforms = []) {
  const worldW = scene.scale?.width ?? arena.innerRight + 200;
  createRuinFeatures(scene, worldW, groundY, height, {
    xMin: arena.innerLeft,
    xMax: arena.innerRight,
    platforms,
    dense: true,
  });

  const arenaW = arena.innerRight - arena.innerLeft;
  const cx = arena.centerX ?? (arena.innerLeft + arena.innerRight) / 2;

  const arenaGlow = scene.add.circle(cx, groundY - 160, 70, 0x22d3ee, 0.08).setDepth(0);
  scene.tweens.add({
    targets: arenaGlow,
    alpha: 0.18,
    scale: 1.12,
    duration: 2000,
    yoyo: true,
    repeat: -1,
  });

  for (let i = 0; i < 8; i++) {
    const x = arena.innerLeft + 40 + i * (arenaW / 8);
    addRuneGlyph(scene, x, groundY - 120 - (i % 2) * 15, 12, 1);
  }
}
