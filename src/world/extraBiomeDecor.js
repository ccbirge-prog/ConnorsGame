/** Atmosphere for Storm Peaks, Sand Shifts, Void Crypt, and Crystal Reef. */

import { fillSlots, shouldPlace, slotDuration, slotInt, staggeredSlots } from "./placement.js";

function addDrift(scene, x, y, slot, color, depth, dy = 30) {
  const p = scene.add.circle(x, y, 2 + slotInt(slot, 0, 2, 1), color, 0.4);
  p.setDepth(depth);
  scene.tweens.add({
    targets: p,
    y: y + dy + slotInt(slot, 0, 10, 2),
    x: x + (shouldPlace(slot, 2, 0) ? 14 : -10),
    alpha: 0.08,
    duration: slotDuration(slot, 3000, 5, 3) * 400,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function biomeBackdrop(scene, worldW, groundY, height, sky, floor, horizon, depth) {
  scene.add.rectangle(worldW / 2, height * 0.45, worldW + 500, height * 0.88, sky, 0.28).setDepth(depth);
  if (horizon != null) {
    scene.add.rectangle(worldW / 2, horizon, worldW + 200, 70, horizon, 0.12).setDepth(depth);
  }
  scene.add.rectangle(worldW / 2, groundY - 35, worldW + 250, 110, floor, 0.15).setDepth(depth);
}

/* ——— Storm Peaks ——— */

function addStormCloud(scene, x, y, w, depth) {
  const cloud = scene.add.ellipse(x, y, w, w * 0.35, 0x4c1d95, 0.35);
  cloud.setDepth(depth);
  scene.add.ellipse(x - w * 0.2, y + 4, w * 0.55, w * 0.22, 0x312e81, 0.4).setDepth(depth);
  scene.add.ellipse(x + w * 0.18, y + 2, w * 0.5, w * 0.2, 0x4338ca, 0.38).setDepth(depth);
  scene.tweens.add({
    targets: cloud,
    x: x + (x % 2 === 0 ? 18 : -14),
    alpha: 0.5,
    duration: 5000 + (x % 5) * 600,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function addStaticPillar(scene, x, groundY, depth) {
  const h = 70 + (x % 5) * 22;
  const pillar = scene.add.rectangle(x, groundY - h / 2 - 8, 12, h, 0x4338ca, 0.55);
  pillar.setStrokeStyle(2, 0x818cf8, 0.85);
  pillar.setDepth(depth);
  const cap = scene.add.circle(x, groundY - h - 10, 8, 0xc4b5fd, 0.7);
  cap.setDepth(depth);
  scene.tweens.add({
    targets: cap,
    alpha: 0.35,
    scale: 1.2,
    duration: 600 + (x % 4) * 120,
    yoyo: true,
    repeat: -1,
  });
  const arc = scene.add.graphics();
  arc.lineStyle(2, 0xe9d5ff, 0.5);
  arc.strokeEllipse(0, -h - 6, 18, 10);
  arc.setPosition(x, groundY - 8);
  arc.setDepth(depth);
}

function addLightningBolt(scene, x, topY, depth) {
  const g = scene.add.graphics();
  g.fillStyle(0xe9d5ff, 0.85);
  g.fillTriangle(0, 0, -3, 28, 3, 28);
  g.fillTriangle(2, 22, 5, 48, -1, 38);
  g.fillTriangle(-2, 40, 0, 62, -6, 50);
  g.setPosition(x, topY);
  g.setDepth(depth);
  g.setAlpha(0.15);
  scene.tweens.add({
    targets: g,
    alpha: 0.75,
    duration: 80 + (x % 3) * 40,
    yoyo: true,
    repeat: -1,
    repeatDelay: 2200 + (x % 7) * 400,
  });
}

function addWindStreak(scene, x, y, depth) {
  const streak = scene.add.rectangle(x, y, 48 + (x % 20), 3, 0xa78bfa, 0.2);
  streak.setAngle(-8 + (x % 4) * 4);
  streak.setDepth(depth);
  scene.tweens.add({
    targets: streak,
    x: x + 40,
    alpha: 0.45,
    duration: 900 + (x % 5) * 100,
    yoyo: true,
    repeat: -1,
  });
}

function addChargedCrystal(scene, x, y, depth) {
  const crystal = scene.add.triangle(x, y, 0, -32, 9, 0, -9, 0, 0x818cf8, 0.55);
  crystal.setDepth(depth);
  scene.add.triangle(x + 3, y + 4, 0, -22, 6, 0, -6, 0, 0xc4b5fd, 0.4).setDepth(depth);
  scene.tweens.add({
    targets: crystal,
    alpha: 0.3,
    scaleY: 1.08,
    duration: 1100 + (x % 4) * 200,
    yoyo: true,
    repeat: -1,
  });
}

function addStormMist(scene, x, groundY, depth) {
  const mist = scene.add.ellipse(x, groundY - 18, 70, 36, 0x6366f1, 0.08);
  mist.setDepth(depth);
  scene.tweens.add({
    targets: mist,
    alpha: 0.18,
    scaleX: 1.15,
    duration: 2800 + (x % 6) * 350,
    yoyo: true,
    repeat: -1,
  });
}

/* ——— Sand Shifts ——— */

function addSandDune(scene, x, groundY, depth) {
  scene.add.ellipse(x, groundY + 2, 72 + (x % 35), 18, 0xd97706, 0.35).setDepth(depth);
  scene.add.ellipse(x - 14, groundY, 48, 12, 0xfbbf24, 0.22).setDepth(depth);
  scene.add.ellipse(x + 18, groundY + 1, 40, 10, 0xb45309, 0.28).setDepth(depth);
}

function addDesertColumn(scene, x, groundY, depth) {
  const h = 50 + (x % 4) * 16;
  const broken = x % 3 === 0;
  const col = scene.add.rectangle(x, groundY - h / 2 - 6, 16, broken ? h * 0.65 : h, 0x92400e, 0.6);
  col.setStrokeStyle(2, 0xfcd34d, 0.5);
  col.setDepth(depth);
  if (broken) {
    scene.add.rectangle(x + 10, groundY - h * 0.35, 12, h * 0.4, 0x78350f, 0.45).setDepth(depth);
  }
  scene.add.triangle(x, groundY - h - 6, 0, 14, 10, 0, -10, 0, 0xfbbf24, 0.35).setDepth(depth);
}

function addBoneArch(scene, x, groundY, depth) {
  const g = scene.add.graphics();
  g.lineStyle(4, 0xfcd34d, 0.45);
  g.lineBetween(-28, 0, -28, -42);
  g.lineBetween(28, 0, 28, -42);
  g.lineBetween(-28, -42, 28, -42);
  g.fillStyle(0xfef3c7, 0.35);
  g.fillCircle(-28, -42, 6);
  g.fillCircle(28, -42, 6);
  g.setPosition(x, groundY - 8);
  g.setDepth(depth);
}

function addScarabRelic(scene, x, groundY, depth) {
  const body = scene.add.ellipse(x, groundY - 4, 22, 14, 0xb45309, 0.5);
  body.setDepth(depth);
  scene.add.ellipse(x, groundY - 10, 14, 10, 0xfbbf24, 0.4).setDepth(depth);
  scene.add.triangle(x - 14, groundY - 6, 0, 8, 6, 0, -6, 0, 0xd97706, 0.45).setDepth(depth);
  scene.add.triangle(x + 14, groundY - 6, 0, 8, -6, 0, 6, 0, 0xd97706, 0.45).setDepth(depth);
}

function addSandParticle(scene, xMin, xMax, groundY, count) {
  fillSlots(count, xMin, xMax).forEach((x, i) => {
    const grain = scene.add.circle(x, groundY - slotInt(i, 32, 52, 0), 2, 0xfde68a, 0.35);
    grain.setDepth(2);
    scene.tweens.add({
      targets: grain,
      x: x + 35 + slotInt(i, 0, 10, 1),
      y: grain.y - 8,
      alpha: 0.08,
      duration: 2000 + i * 150,
      yoyo: true,
      repeat: -1,
    });
  });
}

function addOasisPool(scene, x, groundY, depth) {
  scene.add.ellipse(x, groundY + 2, 52 + (x % 24), 12, 0x0c4a6e, 0.45).setDepth(depth);
  const shine = scene.add.ellipse(x, groundY, 34, 6, 0x38bdf8, 0.5);
  shine.setDepth(depth);
  scene.tweens.add({
    targets: shine,
    alpha: 0.25,
    scaleX: 1.1,
    duration: 2200 + (x % 5) * 280,
    yoyo: true,
    repeat: -1,
  });
  scene.add.ellipse(x, groundY - 14, 28, 10, 0x166534, 0.35).setDepth(depth);
}

function addSunHaze(scene, worldW, height, depth) {
  scene.add.rectangle(worldW / 2, 55, worldW, 90, 0xfbbf24, 0.08).setDepth(depth);
  scene.add.circle(worldW * 0.75, 70, 45, 0xfcd34d, 0.12).setDepth(depth);
}

/* ——— Void Crypt ——— */

function addVoidRift(scene, x, groundY, height, depth) {
  const g = scene.add.graphics();
  g.fillStyle(0x1a0a2e, 0.9);
  g.fillCircle(0, 0, 14 + (x % 4) * 6);
  g.fillStyle(0xa855f7, 0.35);
  g.fillCircle(0, 0, 6 + (x % 3) * 4);
  g.setPosition(x, groundY - 50 - (x % 5) * 20);
  g.setDepth(depth);
  scene.tweens.add({
    targets: g,
    alpha: 0.55,
    scaleY: 1.08,
    duration: 1600 + (x % 5) * 250,
    yoyo: true,
    repeat: -1,
  });
}

function addRunestone(scene, x, groundY, depth) {
  const stone = scene.add.rectangle(x, groundY - 28, 22, 44, 0x2e1065, 0.7);
  stone.setStrokeStyle(2, 0x7c3aed, 0.8);
  stone.setDepth(depth);
  const glyph = scene.add.graphics();
  glyph.lineStyle(2, 0xc084fc, 0.75);
  glyph.strokeCircle(0, -28, 8);
  glyph.lineBetween(-5, -28, 5, -28);
  glyph.lineBetween(0, -33, 0, -23);
  glyph.setPosition(x, groundY - 6);
  glyph.setDepth(depth);
  scene.tweens.add({
    targets: glyph,
    alpha: 0.4,
    duration: 1400 + (x % 4) * 200,
    yoyo: true,
    repeat: -1,
  });
}

function addVoidWisp(scene, x, y, depth) {
  const wisp = scene.add.circle(x, y, 4 + (x % 3), 0xa855f7, 0.5);
  wisp.setDepth(depth);
  const tail = scene.add.circle(x - 6, y + 4, 2, 0x7c3aed, 0.35);
  tail.setDepth(depth);
  scene.tweens.add({
    targets: [wisp, tail],
    y: y - 28 - (x % 4) * 10,
    x: x + (x % 2 === 0 ? 16 : -14),
    alpha: 0.1,
    duration: 2600 + (x % 6) * 320,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function addTombArch(scene, x, groundY, depth) {
  const g = scene.add.graphics();
  g.fillStyle(0x1a0a2e, 0.85);
  g.fillRect(-32, -55, 64, 55);
  g.fillStyle(0x2e1065, 0.6);
  g.fillCircle(0, -55, 32);
  g.lineStyle(2, 0x7c3aed, 0.7);
  g.strokeCircle(0, -55, 32);
  g.fillStyle(0x4c1d95, 0.5);
  g.fillCircle(0, -38, 10);
  g.setPosition(x, groundY);
  g.setDepth(depth);
}

function addHangingChain(scene, x, topY, length, depth) {
  const g = scene.add.graphics();
  g.lineStyle(2, 0x64748b, 0.55);
  for (let y = 0; y < length; y += 12) {
    g.strokeCircle(0, y, 4);
  }
  g.setPosition(x, topY);
  g.setDepth(depth);
  scene.tweens.add({
    targets: g,
    x: x + 3,
    duration: 1800 + (x % 4) * 200,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function addVoidPool(scene, x, groundY, depth) {
  scene.add.ellipse(x, groundY + 2, 46 + (x % 22), 11, 0x1a0a2e, 0.55).setDepth(depth);
  const glow = scene.add.ellipse(x, groundY, 30, 5, 0xa855f7, 0.45);
  glow.setDepth(depth);
  scene.tweens.add({
    targets: glow,
    alpha: 0.2,
    scaleX: 1.18,
    duration: 1900 + (x % 5) * 300,
    yoyo: true,
    repeat: -1,
  });
}

function addObsidianShard(scene, x, groundY, depth) {
  scene.add.triangle(x, groundY, 0, -48 - (x % 4) * 12, 12, 0, -12, 0, 0x3b0764, 0.55).setDepth(depth);
  scene.add.triangle(x + 5, groundY - 4, 0, -36, 8, 0, -8, 0, 0x6b21a8, 0.4).setDepth(depth);
}

/* ——— Crystal Reef ——— */

function addKelpStrand(scene, x, groundY, depth) {
  const g = scene.add.graphics();
  g.lineStyle(3, 0x0f766e, 0.55);
  g.beginPath();
  g.moveTo(0, 0);
  for (let i = 1; i <= 5; i++) {
    const t = i / 5;
    g.lineTo(Math.sin(t * Math.PI * 2) * 10, -t * 55 - (x % 3) * 8);
  }
  g.strokePath();
  g.lineStyle(2, 0x2dd4bf, 0.4);
  g.fillStyle(0x14b8a6, 0.35);
  g.fillTriangle(-8, -50, 0, -62, 8, -50);
  g.setPosition(x, groundY - 8);
  g.setDepth(depth);
  scene.tweens.add({
    targets: g,
    angle: 4,
    duration: 2200 + (x % 5) * 300,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function addBubbleStream(scene, x, groundY, count, depth) {
  for (let i = 0; i < count; i++) {
    const b = scene.add.circle(x + (i % 3) * 8 - 8, groundY - 20 - i * 28, 3 + (i % 3), 0x99f6e4, 0.35);
    b.setStrokeStyle(1, 0x5eead4, 0.6);
    b.setDepth(depth);
    scene.tweens.add({
      targets: b,
      y: b.y - 60 - i * 15,
      alpha: 0.05,
      scale: 1.3,
      duration: 2400 + i * 400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeOut",
    });
  }
}

function addCoralCluster(scene, x, groundY, depth) {
  const colors = [0x2dd4bf, 0x14b8a6, 0xf472b6, 0x5eead4];
  for (let i = -2; i <= 2; i++) {
    const c = colors[(i + 2 + x) % colors.length];
    scene.add
      .triangle(x + i * 14, groundY - 4, 0, 26 + (i % 2) * 8, 7, 0, -7, 0, c, 0.55)
      .setDepth(depth);
  }
  scene.add.ellipse(x, groundY + 2, 40, 8, 0x0d9488, 0.4).setDepth(depth);
}

function addLightRay(scene, x, height, depth) {
  const ray = scene.add.triangle(x, 30, 0, 0, 18, height * 0.5, -18, height * 0.5, 0x5eead4, 0.06);
  ray.setDepth(depth);
  scene.tweens.add({
    targets: ray,
    alpha: 0.14,
    duration: 3200 + (x % 6) * 400,
    yoyo: true,
    repeat: -1,
  });
}

function addTidePool(scene, x, groundY, depth) {
  scene.add.ellipse(x, groundY + 2, 56 + (x % 26), 13, 0x042f2e, 0.5).setDepth(depth);
  scene.add.ellipse(x, groundY, 38, 7, 0x2dd4bf, 0.45).setDepth(depth);
  scene.add.ellipse(x, groundY - 8, 24, 5, 0x67e8f9, 0.3).setDepth(depth);
}

function addShell(scene, x, groundY, depth) {
  scene.add.ellipse(x, groundY - 2, 14, 9, 0xfef3c7, 0.55).setDepth(depth);
  scene.add.ellipse(x - 4, groundY - 3, 8, 5, 0xfde68a, 0.4).setDepth(depth);
}

function addAnemone(scene, x, groundY, depth) {
  for (let i = -3; i <= 3; i++) {
    const tent = scene.add.rectangle(x + i * 5, groundY - 14, 3, 18 + (i % 2) * 4, 0xf472b6, 0.5);
    tent.setDepth(depth);
    scene.tweens.add({
      targets: tent,
      angle: i * 6,
      scaleY: 1.15,
      duration: 800 + Math.abs(i) * 80,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
  scene.add.circle(x, groundY - 6, 8, 0xec4899, 0.45).setDepth(depth);
}

function addStarfish(scene, x, groundY, depth) {
  const g = scene.add.graphics();
  g.fillStyle(0xf97316, 0.55);
  for (let a = 0; a < 5; a++) {
    const rad = (a / 5) * Math.PI * 2 - Math.PI / 2;
    g.fillTriangle(0, 0, Math.cos(rad) * 14, Math.sin(rad) * 14, Math.cos(rad + 0.4) * 6, Math.sin(rad + 0.4) * 6);
  }
  g.setPosition(x, groundY - 4);
  g.setDepth(depth);
}

/* ——— Level dressing ——— */

export function createStormDetails(scene, worldW, groundY, height, opts = {}) {
  const xMin = opts.xMin ?? 40;
  const xMax = opts.xMax ?? worldW - 40;
  const dense = opts.dense ?? false;
  const depthFar = 0;
  const depthMid = 1;

  biomeBackdrop(scene, worldW, groundY, height, 0x312e81, 0x4338ca, 0x4c1d95, depthFar);
  scene.add.rectangle(worldW / 2, 50, worldW, 60, 0x6366f1, 0.1).setDepth(depthFar);

  const cloudXs = staggeredSlots(dense ? 9 : 6, xMin, xMax, dense ? 24 : 32, 0);
  cloudXs.forEach((x, i) => {
    addStormCloud(scene, x, slotInt(i, 52, 88, 1), slotInt(i, 85, 115, 2), depthFar);
  });

  fillSlots(dense ? 10 : 7, xMin + 40, xMax).forEach((x) => addStaticPillar(scene, x, groundY, depthFar));

  const boltXs = fillSlots(dense ? 12 : 8, xMin, xMax);
  boltXs.forEach((x, i) => {
    addLightningBolt(scene, x, slotInt(i, 48, 118, 3), depthMid);
    if (shouldPlace(i, 2, 0)) addWindStreak(scene, x + 20, slotInt(i, 95, 135, 4), depthMid);
  });

  fillSlots(dense ? 11 : 8, xMin, xMax).forEach((x) => addStormMist(scene, x, groundY, depthFar));

  fillSlots(dense ? 18 : 12, xMin, xMax).forEach((x, i) => {
    addDrift(scene, x, slotInt(i, 72, 110, 5), i, 0xc4b5fd, depthMid, 40);
  });

  for (const p of opts.platforms ?? []) {
    scene.add.ellipse(p.x, p.y + 6, p.w + 16, 8, 0x6366f1, 0.35).setDepth(depthMid);
    scene.add.ellipse(p.x, p.y + 3, p.w * 0.3, 4, 0xa78bfa, 0.45).setDepth(depthMid);
    if (p.y < groundY - 40) {
      addChargedCrystal(scene, p.x - p.w * 0.3, p.y - 6, depthMid);
      addChargedCrystal(scene, p.x + p.w * 0.28, p.y - 4, depthMid);
    }
  }

  fillSlots(dense ? 6 : 4, xMin, xMax).forEach((x, i) => {
    const spark = scene.add.circle(x, height - 140 - i * 30, 5, 0xe9d5ff, 0.25);
    spark.setDepth(depthFar);
    scene.tweens.add({
      targets: spark,
      alpha: 0.55,
      scale: 1.3,
      duration: 500 + i * 100,
      yoyo: true,
      repeat: -1,
    });
  });
}

export function createDuneDetails(scene, worldW, groundY, height, opts = {}) {
  const xMin = opts.xMin ?? 40;
  const xMax = opts.xMax ?? worldW - 40;
  const dense = opts.dense ?? false;
  const depthFar = 0;
  const depthMid = 1;
  const depthNear = 3;

  biomeBackdrop(scene, worldW, groundY, height, 0x451a03, 0x78350f, 0xfbbf24, depthFar);
  addSunHaze(scene, worldW, height, depthFar);

  fillSlots(dense ? 12 : 8, xMin, xMax).forEach((x) => addSandDune(scene, x, groundY, depthNear));
  fillSlots(dense ? 8 : 5, xMin + 60, xMax).forEach((x) => addDesertColumn(scene, x, groundY, depthFar));
  fillSlots(dense ? 5 : 3, xMin + 100, xMax).forEach((x) => addBoneArch(scene, x, groundY, depthFar));
  staggeredSlots(dense ? 10 : 7, xMin + 35, xMax, 12, 1).forEach((x) => addScarabRelic(scene, x, groundY, depthMid));
  fillSlots(dense ? 5 : 3, xMin + 120, xMax).forEach((x) => addOasisPool(scene, x, groundY, depthMid));
  addSandParticle(scene, xMin, xMax, groundY, dense ? 22 : 14);

  fillSlots(dense ? 10 : 7, xMin, xMax).forEach((x, i) => {
    scene.add
      .triangle(x, groundY - slotInt(i, 42, 58, 2), 0, 38, 16, 0, -16, 0, 0xb45309, 0.22)
      .setDepth(depthFar);
  });

  for (const p of opts.platforms ?? []) {
    scene.add.ellipse(p.x, p.y + 5, p.w + 14, 7, 0xfbbf24, 0.28).setDepth(depthMid);
    scene.add.ellipse(p.x, p.y + 3, p.w * 0.4, 4, 0xd97706, 0.35).setDepth(depthMid);
    if (p.y < groundY - 50) {
      scene.add.rectangle(p.x, p.y + 10, p.w + 8, 4, 0x92400e, 0.35).setDepth(depthMid);
    }
  }

  fillSlots(dense ? 5 : 3, xMin, xMax).forEach((x, i) => {
    const heat = scene.add.circle(x, groundY - 120 - i * 25, 40, 0xfcd34d, 0.06);
    heat.setDepth(depthFar);
    scene.tweens.add({
      targets: heat,
      alpha: 0.14,
      scale: 1.1,
      duration: 2500 + i * 400,
      yoyo: true,
      repeat: -1,
    });
  });
}

export function createVoidDetails(scene, worldW, groundY, height, opts = {}) {
  const xMin = opts.xMin ?? 40;
  const xMax = opts.xMax ?? worldW - 40;
  const dense = opts.dense ?? false;
  const depthFar = 0;
  const depthMid = 1;

  biomeBackdrop(scene, worldW, groundY, height, 0x1e1033, 0x2e1065, 0x4c1d95, depthFar);
  scene.add.rectangle(worldW / 2, height * 0.55, worldW + 300, height * 0.5, 0x0f0518, 0.35).setDepth(depthFar);

  fillSlots(dense ? 9 : 6, xMin + 50, xMax).forEach((x) => addVoidRift(scene, x, groundY, height, depthFar));
  fillSlots(dense ? 9 : 6, xMin + 30, xMax).forEach((x, i) => {
    addRunestone(scene, x, groundY, depthFar);
    if (shouldPlace(i, 2, 0)) addObsidianShard(scene, x + 40, groundY, depthFar);
  });
  fillSlots(dense ? 4 : 3, xMin + 80, xMax).forEach((x) => addTombArch(scene, x, groundY, depthFar));
  fillSlots(dense ? 11 : 8, xMin, xMax).forEach((x, i) => {
    addHangingChain(scene, x, slotInt(i, 68, 82, 1), slotInt(i, 52, 68, 2), depthMid);
  });
  fillSlots(dense ? 7 : 5, xMin + 70, xMax).forEach((x) => addVoidPool(scene, x, groundY, depthMid));
  fillSlots(dense ? 16 : 11, xMin, xMax).forEach((x, i) => {
    addVoidWisp(scene, x, slotInt(i, 85, 130, 3), depthMid);
  });

  for (const p of opts.platforms ?? []) {
    scene.add.ellipse(p.x, p.y + 6, p.w + 14, 7, 0x7c3aed, 0.32).setDepth(depthMid);
    scene.add.ellipse(p.x, p.y + 3, p.w * 0.35, 4, 0xc084fc, 0.4).setDepth(depthMid);
    if (p.y < groundY - 45) {
      const eye = scene.add.circle(p.x, p.y - 12, 5, 0xa855f7, 0.5);
      eye.setDepth(depthMid);
      scene.tweens.add({
        targets: eye,
        alpha: 0.2,
        scale: 1.2,
        duration: 1200,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  fillSlots(dense ? 6 : 4, xMin, xMax).forEach((x, i) => {
    const pulse = scene.add.circle(x, groundY - 130 - i * 28, 8, 0x7c3aed, 0.15);
    pulse.setDepth(depthFar);
    scene.tweens.add({
      targets: pulse,
      alpha: 0.4,
      scale: 1.35,
      duration: 1700 + i * 320,
      yoyo: true,
      repeat: -1,
    });
  });
}

export function createReefDetails(scene, worldW, groundY, height, opts = {}) {
  const xMin = opts.xMin ?? 40;
  const xMax = opts.xMax ?? worldW - 40;
  const dense = opts.dense ?? false;
  const depthFar = 0;
  const depthMid = 1;
  const depthNear = 3;

  biomeBackdrop(scene, worldW, groundY, height, 0x042f2e, 0x0f766e, 0x5eead4, depthFar);
  scene.add.rectangle(worldW / 2, 40, worldW, 80, 0x67e8f9, 0.08).setDepth(depthFar);

  fillSlots(dense ? 7 : 5, xMin + 80, xMax).forEach((x) => addLightRay(scene, x, height, depthFar));
  staggeredSlots(dense ? 14 : 10, xMin, xMax, 18, 0).forEach((x, i) => {
    addKelpStrand(scene, x, groundY, depthFar);
    if (shouldPlace(i, 2, 0)) addKelpStrand(scene, x + 35, groundY, depthFar);
  });
  fillSlots(dense ? 10 : 7, xMin + 25, xMax).forEach((x) => addCoralCluster(scene, x, groundY, depthNear));
  fillSlots(dense ? 6 : 4, xMin + 90, xMax).forEach((x) => addTidePool(scene, x, groundY, depthMid));
  fillSlots(dense ? 8 : 6, xMin + 50, xMax).forEach((x) => addBubbleStream(scene, x, groundY, dense ? 4 : 3, depthMid));
  fillSlots(dense ? 12 : 8, xMin + 20, xMax).forEach((x, i) => {
    addShell(scene, x, groundY, depthMid);
    if (shouldPlace(i, 3, 0)) addStarfish(scene, x + 18, groundY, depthMid);
  });
  fillSlots(dense ? 6 : 4, xMin + 60, xMax).forEach((x) => addAnemone(scene, x, groundY, depthMid));
  fillSlots(dense ? 14 : 10, xMin, xMax).forEach((x, i) => {
    addDrift(scene, x, slotInt(i, 95, 130, 4), i, 0x99f6e4, depthMid, 35);
  });

  for (const p of opts.platforms ?? []) {
    scene.add.ellipse(p.x, p.y + 6, p.w + 14, 7, 0x0d9488, 0.42).setDepth(depthMid);
    scene.add.ellipse(p.x, p.y + 3, p.w * 0.35, 5, 0x5eead4, 0.45).setDepth(depthMid);
    if (p.y < groundY - 35) {
      scene.add.triangle(p.x, p.y + 8, 0, 16, 8, 0, -8, 0, 0x14b8a6, 0.5).setDepth(depthMid);
    }
  }

  fillSlots(dense ? 5 : 3, xMin, xMax).forEach((x, i) => {
    const caustic = scene.add.ellipse(x, groundY - 100 - i * 22, 50, 20, 0x67e8f9, 0.08);
    caustic.setDepth(depthFar);
    scene.tweens.add({
      targets: caustic,
      alpha: 0.2,
      scaleX: 1.15,
      duration: 2100 + i * 350,
      yoyo: true,
      repeat: -1,
    });
  });
}

/* ——— Boss arenas ——— */

function arenaExtras(scene, centerX, groundY, glowColor, ringCount) {
  for (let i = 0; i < ringCount; i++) {
    const ring = scene.add.circle(centerX, groundY - 80 - i * 18, 40 + i * 12, glowColor, 0.06);
    ring.setDepth(0);
    scene.tweens.add({
      targets: ring,
      alpha: 0.14,
      scale: 1.08,
      duration: 1400 + i * 200,
      yoyo: true,
      repeat: -1,
    });
  }
}

export function createStormArenaDetails(scene, arena, groundY, height, platforms = []) {
  const worldW = scene.scale?.width ?? arena.innerRight + 200;
  createStormDetails(scene, worldW, groundY, height, {
    xMin: arena.innerLeft,
    xMax: arena.innerRight,
    platforms,
    dense: true,
  });

  const cx = arena.centerX ?? (arena.innerLeft + arena.innerRight) / 2;
  const arenaW = arena.innerRight - arena.innerLeft;

  for (let i = 0; i < 10; i++) {
    const x = arena.innerLeft + 20 + i * (arenaW / 10);
    addStaticPillar(scene, x, groundY, 0);
    addLightningBolt(scene, x, 55 + (i % 5) * 32, 0);
  }

  const stormEye = scene.add.circle(cx, groundY - 150, 100, 0x6366f1, 0.1).setDepth(0);
  scene.tweens.add({
    targets: stormEye,
    alpha: 0.28,
    scale: 1.15,
    duration: 1200,
    yoyo: true,
    repeat: -1,
  });
}

export function createDuneArenaDetails(scene, arena, groundY, height, platforms = []) {
  const worldW = scene.scale?.width ?? arena.innerRight + 200;
  createDuneDetails(scene, worldW, groundY, height, {
    xMin: arena.innerLeft,
    xMax: arena.innerRight,
    platforms,
    dense: true,
  });

  const cx = arena.centerX ?? (arena.innerLeft + arena.innerRight) / 2;
  const arenaW = arena.innerRight - arena.innerLeft;

  for (let i = 0; i < 8; i++) {
    const x = arena.innerLeft + 30 + i * (arenaW / 8);
    addBoneArch(scene, x, groundY, 0);
    addSandDune(scene, x + 15, groundY, 3);
  }

  const sarcophagus = scene.add.graphics();
  sarcophagus.fillStyle(0x78350f, 0.7);
  sarcophagus.fillRect(-40, -25, 80, 50);
  sarcophagus.lineStyle(2, 0xfcd34d, 0.8);
  sarcophagus.strokeRect(-40, -25, 80, 50);
  sarcophagus.fillStyle(0xfbbf24, 0.5);
  sarcophagus.fillTriangle(0, -35, -12, -20, 12, -20);
  sarcophagus.setPosition(cx, groundY - 55);
  sarcophagus.setDepth(0);

  const sunGlow = scene.add.circle(cx, groundY - 180, 70, 0xfbbf24, 0.1).setDepth(0);
  scene.tweens.add({
    targets: sunGlow,
    alpha: 0.22,
    scale: 1.1,
    duration: 2200,
    yoyo: true,
    repeat: -1,
  });
}

export function createVoidArenaDetails(scene, arena, groundY, height, platforms = []) {
  const worldW = scene.scale?.width ?? arena.innerRight + 200;
  createVoidDetails(scene, worldW, groundY, height, {
    xMin: arena.innerLeft,
    xMax: arena.innerRight,
    platforms,
    dense: true,
  });

  const cx = arena.centerX ?? (arena.innerLeft + arena.innerRight) / 2;

  for (let i = 0; i < 10; i++) {
    const x = arena.innerLeft + 25 + i * ((arena.innerRight - arena.innerLeft) / 10);
    addHangingChain(scene, x, 68 + (i % 3) * 14, 55 + (i % 3) * 12, 0);
    addVoidRift(scene, x + 10, groundY, height, 0);
  }

  const watcherEye = scene.add.graphics();
  watcherEye.fillStyle(0x4c1d95, 0.5);
  watcherEye.fillCircle(0, 0, 55);
  watcherEye.fillStyle(0xa855f7, 0.8);
  watcherEye.fillCircle(-18, -5, 12);
  watcherEye.fillCircle(18, -5, 12);
  watcherEye.fillStyle(0x1a0a2e, 1);
  watcherEye.fillCircle(-18, -5, 5);
  watcherEye.fillCircle(18, -5, 5);
  watcherEye.setPosition(cx, groundY - 165);
  watcherEye.setDepth(0);
  scene.tweens.add({
    targets: watcherEye,
    alpha: 0.65,
    scale: 1.05,
    duration: 2000,
    yoyo: true,
    repeat: -1,
  });
}

export function createEclipseDetails(scene, worldW, groundY, height, opts = {}) {
  createVoidDetails(scene, worldW, groundY, height, opts);
}

export function createEclipseArenaDetails(scene, arena, groundY, height, platforms = []) {
  createEclipseDetails(scene, arena.innerRight + 200, groundY, height, {
    xMin: arena.innerLeft,
    xMax: arena.innerRight,
    platforms,
    dense: true,
  });
  arenaExtras(scene, arena.centerX, groundY, 0xe879f9, 9);
}

export function createPrimeArenaDetails(scene, arena, groundY, height, platforms = []) {
  biomeBackdrop(scene, arena.innerRight + 200, groundY, height, 0x0a0612, 0x44403c, 0xfef08a, 0);
  arenaExtras(scene, arena.centerX, groundY, 0xfbbf24, 10);
}

export function createReefArenaDetails(scene, arena, groundY, height, platforms = []) {
  const worldW = scene.scale?.width ?? arena.innerRight + 200;
  createReefDetails(scene, worldW, groundY, height, {
    xMin: arena.innerLeft,
    xMax: arena.innerRight,
    platforms,
    dense: true,
  });

  const cx = arena.centerX ?? (arena.innerLeft + arena.innerRight) / 2;
  const arenaW = arena.innerRight - arena.innerLeft;

  for (let i = 0; i < 9; i++) {
    const x = arena.innerLeft + 35 + i * (arenaW / 9);
    addCoralCluster(scene, x, groundY, 3);
    addAnemone(scene, x + 20, groundY, 1);
  }

  const fan = scene.add.graphics();
  fan.fillStyle(0xf472b6, 0.45);
  for (let i = -4; i <= 4; i++) {
    fan.fillTriangle(i * 12, 0, i * 12 + 6, -55 - Math.abs(i) * 4, i * 12 - 6, 0);
  }
  fan.fillStyle(0x2dd4bf, 0.5);
  fan.fillCircle(0, -20, 22);
  fan.setPosition(cx, groundY - 70);
  fan.setDepth(0);
  scene.tweens.add({
    targets: fan,
    angle: 3,
    duration: 2800,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  const tideGlow = scene.add.ellipse(cx, groundY - 140, 120, 40, 0x5eead4, 0.1).setDepth(0);
  scene.tweens.add({
    targets: tideGlow,
    alpha: 0.25,
    scaleX: 1.12,
    duration: 2400,
    yoyo: true,
    repeat: -1,
  });
}
