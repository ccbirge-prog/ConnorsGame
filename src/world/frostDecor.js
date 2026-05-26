/** Icicles, snow, and crystal frost for Frost Hollow (frost biome). */

import { fillSlots, shouldPlace, slotDuration, slotInt, staggeredSlots } from "./placement.js";

function addIcicle(scene, x, topY, length, depth) {
  const g = scene.add.graphics();
  g.fillStyle(0xbae6fd, 0.75);
  g.fillTriangle(0, 0, -5, length, 5, length);
  g.fillStyle(0xe0f2fe, 0.5);
  g.fillTriangle(0, length * 0.3, -3, length, 3, length);
  g.setPosition(x, topY);
  g.setDepth(depth);
  return g;
}

function addIceCrystal(scene, x, groundY, depth) {
  const h = 45 + (x % 5) * 16;
  scene.add.triangle(x, groundY, 0, -h, 10, 0, -10, 0, 0x7dd3fc, 0.45).setDepth(depth);
  scene.add.triangle(x + 4, groundY - 8, 0, -(h * 0.7), 7, 0, -7, 0, 0xe0f2fe, 0.35).setDepth(depth);
  const core = scene.add.rectangle(x, groundY - h * 0.45, 3, h * 0.5, 0x38bdf8, 0.4);
  core.setDepth(depth);
  scene.tweens.add({
    targets: core,
    alpha: 0.15,
    duration: 1400 + (x % 4) * 200,
    yoyo: true,
    repeat: -1,
  });
}

function addSnowDrift(scene, x, groundY, depth) {
  scene.add.ellipse(x, groundY + 4, 52 + (x % 28), 14, 0xe2e8f0, 0.35).setDepth(depth);
  scene.add.ellipse(x - 8, groundY + 2, 32, 10, 0xf8fafc, 0.25).setDepth(depth);
}

function addSnowflake(scene, x, y, depth) {
  const flake = scene.add.circle(x, y, 2 + (x % 3), 0xf8fafc, 0.5);
  flake.setDepth(depth);
  scene.tweens.add({
    targets: flake,
    y: y + 50 + (x % 5) * 15,
    x: x + (x % 2 === 0 ? 16 : -12),
    alpha: 0.08,
    duration: 3600 + (x % 8) * 450,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function addFrozenPool(scene, x, groundY, depth) {
  scene.add.ellipse(x, groundY + 2, 44 + (x % 20), 10, 0x0c4a6e, 0.4).setDepth(depth);
  const shine = scene.add.ellipse(x, groundY, 28, 5, 0x7dd3fc, 0.45).setDepth(depth);
  scene.tweens.add({
    targets: shine,
    alpha: 0.2,
    scaleX: 1.15,
    duration: 2000 + (x % 5) * 300,
    yoyo: true,
    repeat: -1,
  });
}

/**
 * @param {Phaser.Scene} scene
 * @param {number} worldW
 * @param {number} groundY
 * @param {number} height
 * @param {{ platforms?: {x,y,w}[], xMin?: number, xMax?: number, dense?: boolean }} opts
 */
export function createFrostDetails(scene, worldW, groundY, height, opts = {}) {
  const xMin = opts.xMin ?? 40;
  const xMax = opts.xMax ?? worldW - 40;
  const dense = opts.dense ?? false;
  const depthFar = 0;
  const depthMid = 1;
  const depthNear = 3;

  scene.add.rectangle(worldW / 2, height * 0.48, worldW + 500, height * 0.88, 0x0c4a6e, 0.22).setDepth(depthFar);
  scene.add.rectangle(worldW / 2, groundY - 35, worldW + 250, 110, 0x164e63, 0.15).setDepth(depthFar);
  scene.add.rectangle(worldW / 2, 65, worldW, 55, 0x38bdf8, 0.1).setDepth(depthFar);

  staggeredSlots(dense ? 14 : 10, xMin, xMax, dense ? 20 : 28, 0).forEach((x, i) => {
    const topY = slotInt(i, 82, 118, 1);
    const len = slotInt(i, 36, 58, 2);
    addIcicle(scene, x, topY, len, depthFar);
    if (shouldPlace(i, 2, 0)) addIcicle(scene, x + 22, topY + 18, len * 0.75, depthFar);
  });

  fillSlots(dense ? 9 : 6, xMin + 55, xMax).forEach((x) => addIceCrystal(scene, x, groundY, depthFar));
  fillSlots(dense ? 11 : 8, xMin, xMax).forEach((x) => addSnowDrift(scene, x, groundY, depthNear));
  fillSlots(dense ? 6 : 4, xMin + 90, xMax).forEach((x) => addFrozenPool(scene, x, groundY, depthMid));
  fillSlots(dense ? 20 : 14, xMin, xMax).forEach((x, i) => {
    addSnowflake(scene, x, slotInt(i, 68, 118, 3), depthMid);
  });

  fillSlots(dense ? 10 : 7, xMin, xMax).forEach((x, i) => {
    const mist = scene.add.ellipse(x, groundY - slotInt(i, 18, 28, 4), 65, 38, 0xbae6fd, 0.06);
    mist.setDepth(depthFar);
    scene.tweens.add({
      targets: mist,
      alpha: 0.14,
      scaleX: 1.12,
      duration: slotDuration(i, 3200, 5, 5) * 400,
      yoyo: true,
      repeat: -1,
    });
  });

  const platforms = opts.platforms ?? [];
  for (const p of platforms) {
    scene.add.ellipse(p.x, p.y + 6, p.w + 16, 8, 0xe2e8f0, 0.35).setDepth(depthMid);
    scene.add.ellipse(p.x, p.y + 4, p.w * 0.35, 4, 0x7dd3fc, 0.4).setDepth(depthMid);
    if (p.y < groundY - 35) {
      addIcicle(scene, p.x - p.w * 0.32, p.y - 8, 24, depthMid);
      addIcicle(scene, p.x + p.w * 0.28, p.y - 6, 18, depthMid);
    }
  }

  fillSlots(dense ? 6 : 4, xMin, xMax).forEach((x, i) => {
    const chill = scene.add.circle(x, height - 150 - i * 28, 6 + (i % 3) * 3, 0x67e8f9, 0.2);
    chill.setDepth(depthFar);
    scene.tweens.add({
      targets: chill,
      alpha: 0.45,
      scale: 1.25,
      duration: 1800 + i * 350,
      yoyo: true,
      repeat: -1,
    });
  });
}

/** Dense ice dressing inside boss arena. */
export function createFrostArenaDetails(scene, arena, groundY, height, platforms = []) {
  const worldW = scene.scale?.width ?? arena.innerRight + 200;
  createFrostDetails(scene, worldW, groundY, height, {
    xMin: arena.innerLeft,
    xMax: arena.innerRight,
    platforms,
    dense: true,
  });

  const arenaW = arena.innerRight - arena.innerLeft;
  const cx = arena.centerX ?? (arena.innerLeft + arena.innerRight) / 2;

  for (let i = 0; i < 12; i++) {
    const x = arena.innerLeft + 25 + i * (arenaW / 12);
    scene.add.ellipse(x, groundY - 155 - (i % 3) * 14, 10, 48, 0xbae6fd, 0.35).setDepth(0);
    scene.add.triangle(x, groundY - 175 - (i % 2) * 8, 0, 28, 6, 0, -6, 0, 0xe0f2fe, 0.4).setDepth(0);
  }

  const frostBreath = scene.add.circle(cx, groundY - 140, 90, 0x38bdf8, 0.08).setDepth(0);
  scene.tweens.add({
    targets: frostBreath,
    alpha: 0.22,
    scale: 1.12,
    duration: 2000,
    yoyo: true,
    repeat: -1,
  });
}
