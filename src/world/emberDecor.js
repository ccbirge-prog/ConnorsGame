import Phaser from "phaser";

/** Lava glow, ash, and volcanic rock for Ember Caverns (ember biome). */

/** Point on the climb face (t = 0 foot … 1 rim). */
export function volcanoSlopePoint(volcano, t) {
  const { footX, peakX, peakY, baseY } = volcano;
  const x = Phaser.Math.Linear(footX + 20, peakX - 50, t);
  const surfaceY = Phaser.Math.Linear(baseY - 16, peakY + 14, t);
  return { x, y: surfaceY - 30 };
}

/**
 * Stepped slope segments — left face only; open summit & east side for shrine/pickups.
 */
export function buildVolcanoColliderDefs(volcano) {
  const { footX, peakX, peakY, baseY } = volcano;
  const slopeStartX = footX + 10;
  const slopeStartY = baseY - 16;
  const slopeEndX = peakX - 55;
  const slopeEndY = peakY + 14;
  const segments = [];
  const SEG_COUNT = 24;

  for (let i = 0; i < SEG_COUNT; i++) {
    const t0 = i / SEG_COUNT;
    const t1 = (i + 1) / SEG_COUNT;
    const x0 = Phaser.Math.Linear(slopeStartX, slopeEndX, t0);
    const y0 = Phaser.Math.Linear(slopeStartY, slopeEndY, t0);
    const x1 = Phaser.Math.Linear(slopeStartX, slopeEndX, t1);
    const y1 = Phaser.Math.Linear(slopeStartY, slopeEndY, t1);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2 - 10;
    const len = Math.hypot(x1 - x0, y1 - y0);
    const ang = Phaser.Math.RadToDeg(Math.atan2(y1 - y0, x1 - x0));
    segments.push({ x: cx, y: cy, w: len + 10, h: 20, angle: ang, kind: "slope" });
  }

  segments.push({ x: footX + 55, y: baseY - 14, w: 130, h: 20, angle: 0, kind: "foot" });

  segments.push({ x: peakX - 45, y: peakY + 6, w: 175, h: 20, angle: 0, kind: "rim" });

  const rx = peakX + 42;
  for (let i = 0; i < 5; i++) {
    const t = 0.45 + (i / 4) * 0.55;
    segments.push({
      x: rx,
      y: Phaser.Math.Linear(baseY - 120, peakY + 20, t),
      w: 22,
      h: 44,
      angle: 0,
      kind: "ridge",
    });
  }

  return segments;
}

/** Pickup spots along cave + slope — kept clear of colliders & crater. */
export function buildVolcanoPickupSpots(volcano, groundY) {
  const g = groundY;
  const spots = [{ id: "spine", x: 120, y: g - 36 }];
  const caveIds = ["torso", "arms", "hands", "legs"];
  const caveXs = [380, 640, 920, 1120];
  for (let i = 0; i < caveIds.length; i++) {
    spots.push({ id: caveIds[i], x: caveXs[i], y: g - 88 - (i % 2) * 8 });
  }
  const slopeIds = ["feet", "eyes", "heart"];
  const slopeTs = [0.36, 0.64, 0.88];
  for (let i = 0; i < slopeIds.length; i++) {
    const p = volcanoSlopePoint(volcano, slopeTs[i]);
    spots.push({ id: slopeIds[i], x: p.x - 28, y: p.y - 36 });
  }
  return spots;
}

function addLavaCrack(scene, x, groundY, depth) {
  scene.add.ellipse(x, groundY + 2, 36 + (x % 24), 8, 0x7c2d12, 0.5).setDepth(depth);
  const glow = scene.add.ellipse(x, groundY, 22 + (x % 12), 5, 0xea580c, 0.55).setDepth(depth);
  scene.tweens.add({
    targets: glow,
    alpha: 0.25,
    scaleX: 1.2,
    duration: 800 + (x % 5) * 150,
    yoyo: true,
    repeat: -1,
  });
}

function addVolcanicSpire(scene, x, groundY, depth) {
  const h = 70 + (x % 5) * 22;
  const base = scene.add.triangle(x, groundY - h, 0, h, 18, 0, -18, 0, 0x292524, 0.6);
  base.setDepth(depth);
  scene.add.triangle(x + 2, groundY - h + 20, 0, h - 30, 12, 0, -12, 0, 0x44403c, 0.45).setDepth(depth);
  const vein = scene.add.rectangle(x, groundY - h * 0.55, 4, h * 0.5, 0xdc2626, 0.35);
  vein.setDepth(depth);
  scene.tweens.add({
    targets: vein,
    alpha: 0.15,
    duration: 1100 + (x % 4) * 200,
    yoyo: true,
    repeat: -1,
  });
}

function addStalactite(scene, x, topY, length, depth) {
  const g = scene.add.graphics();
  g.fillStyle(0x292524, 0.55);
  g.fillTriangle(0, 0, -8, length, 8, length);
  g.fillStyle(0xea580c, 0.4);
  g.fillTriangle(0, length - 6, -4, length, 4, length);
  g.setPosition(x, topY);
  g.setDepth(depth);
  return g;
}

function addAshParticle(scene, x, y, depth) {
  const ash = scene.add.circle(x, y, 2 + (x % 3), 0x78716c, 0.4);
  ash.setDepth(depth);
  scene.tweens.add({
    targets: ash,
    y: y + 35 + (x % 4) * 12,
    x: x + (x % 2 === 0 ? 14 : -10),
    alpha: 0.08,
    duration: 3200 + (x % 7) * 400,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function addEmberSpark(scene, x, y, depth) {
  const spark = scene.add.circle(x, y, 2 + (x % 2), 0xfbbf24, 0.7);
  spark.setDepth(depth);
  scene.tweens.add({
    targets: spark,
    y: y - 40 - (x % 5) * 15,
    alpha: 0.1,
    duration: 1600 + (x % 6) * 250,
    yoyo: true,
    repeat: -1,
    ease: "Quad.easeOut",
  });
}

/**
 * @param {Phaser.Scene} scene
 * @param {number} worldW
 * @param {number} groundY
 * @param {number} height
 * @param {{ platforms?: {x,y,w}[], xMin?: number, xMax?: number, dense?: boolean }} opts
 */
export function createEmberVolcano(scene, worldW, groundY, height, opts = {}) {
  const xMin = opts.xMin ?? 40;
  const xMax = opts.xMax ?? worldW - 40;
  const span = xMax - xMin;
  const dense = opts.dense ?? false;
  const depthFar = 0;
  const depthMid = 1;
  const depthNear = 3;

  scene.add.rectangle(worldW / 2, height * 0.42, worldW + 500, height * 0.9, 0x431407, 0.35).setDepth(depthFar);
  scene.add.rectangle(worldW / 2, groundY - 30, worldW + 300, 120, 0x7c2d12, 0.2).setDepth(depthFar);
  scene.add.rectangle(worldW / 2, height - 55, worldW, 70, 0xea580c, 0.12).setDepth(depthFar);

  const magmaHorizon = scene.add.ellipse(worldW / 2, groundY + 18, worldW + 120, 50, 0xdc2626, 0.18);
  magmaHorizon.setDepth(depthFar);
  scene.tweens.add({
    targets: magmaHorizon,
    alpha: 0.32,
    scaleY: 1.15,
    duration: 2200,
    yoyo: true,
    repeat: -1,
  });

  const spireStep = dense ? 150 : 210;
  for (let x = xMin + 50; x < xMax; x += spireStep) {
    addVolcanicSpire(scene, x, groundY, depthFar);
  }

  const stalStep = dense ? 85 : 120;
  for (let x = xMin; x < xMax; x += stalStep + (x % 3) * 15) {
    const topY = 90 + (x % 6) * 18;
    const len = 40 + (x % 8) * 12;
    addStalactite(scene, x, topY, len, depthFar);
    if (x % 2 === 0) {
      addStalactite(scene, x + 30, topY + 25, len * 0.75, depthFar);
    }
  }

  const crackStep = dense ? 130 : 190;
  for (let x = xMin + 70; x < xMax; x += crackStep) {
    addLavaCrack(scene, x, groundY, depthNear);
  }

  const ashCount = dense ? 18 : 12;
  for (let i = 0; i < ashCount; i++) {
    const x = xMin + (span * i) / Math.max(1, ashCount - 1);
    addAshParticle(scene, x, 80 + (i % 8) * 45, depthMid);
  }

  const sparkCount = dense ? 14 : 9;
  for (let i = 0; i < sparkCount; i++) {
    const x = xMin + (span * i) / Math.max(1, sparkCount - 1);
    addEmberSpark(scene, x, groundY - 60 - (i % 6) * 35, depthMid);
  }

  for (let x = xMin; x < xMax; x += dense ? 110 : 150) {
    const heat = scene.add.ellipse(x, groundY - 25 - (x % 4) * 10, 70, 40, 0xf97316, 0.07);
    heat.setDepth(depthFar);
    scene.tweens.add({
      targets: heat,
      alpha: 0.16,
      scaleX: 1.1,
      duration: 2800 + (x % 6) * 350,
      yoyo: true,
      repeat: -1,
    });
  }

  const platforms = opts.platforms ?? [];
  for (const p of platforms) {
    scene.add.ellipse(p.x, p.y + 7, p.w + 14, 7, 0x7c2d12, 0.45).setDepth(depthMid);
    scene.add.ellipse(p.x, p.y + 5, p.w * 0.4, 4, 0xea580c, 0.5).setDepth(depthMid);
    if (p.y < groundY - 40) {
      addEmberSpark(scene, p.x - p.w * 0.2, p.y + 15, depthMid);
      addEmberSpark(scene, p.x + p.w * 0.25, p.y + 12, depthMid);
    }
  }

  for (let i = 0; i < (dense ? 5 : 3); i++) {
    const x = xMin + (span * (i + 0.5)) / (dense ? 5 : 3);
    const vent = scene.add.circle(x, height - 140 - i * 30, 8 + (i % 3) * 4, 0xf97316, 0.25);
    vent.setDepth(depthFar);
    scene.tweens.add({
      targets: vent,
      alpha: 0.5,
      scale: 1.3,
      duration: 1500 + i * 300,
      yoyo: true,
      repeat: -1,
    });
  }
}

/** Far-off volcano silhouette — Ember Caverns stage 3. */
export function createDistantVolcano(scene, worldW, groundY, height, opts = {}) {
  const vx = opts.x ?? worldW * 0.84;
  const baseY = opts.baseY ?? groundY;
  const scale = opts.scale ?? 1;
  const depth = -2;
  const peakY = baseY - 300 * scale;
  const halfW = 200 * scale;

  const haze = scene.add.circle(vx, peakY - 20, 120 * scale, 0xea580c, 0.12).setDepth(depth);
  scene.tweens.add({
    targets: haze,
    alpha: 0.22,
    scale: 1.08,
    duration: 2400,
    yoyo: true,
    repeat: -1,
  });

  const tipY = peakY - baseY;
  const layers = [
    { color: 0x1c1917, alpha: 0.55, hw: halfW * 1.15, tip: tipY + 22 * scale },
    { color: 0x292524, alpha: 0.7, hw: halfW, tip: tipY + 10 * scale },
    { color: 0x44403c, alpha: 0.85, hw: halfW * 0.88, tip: tipY },
  ];
  for (const layer of layers) {
    scene.add
      .triangle(vx, baseY, -layer.hw, 0, layer.hw, 0, 0, layer.tip, layer.color, layer.alpha)
      .setDepth(depth);
  }

  scene.add
    .triangle(vx, peakY - 6 * scale, -32 * scale, 0, 32 * scale, 0, 0, -18 * scale, 0x7c2d12, 0.9)
    .setDepth(depth);
  const caldera = scene.add.ellipse(vx, peakY - 4 * scale, 52 * scale, 14 * scale, 0xdc2626, 0.75);
  caldera.setDepth(depth - 1);
  scene.tweens.add({
    targets: caldera,
    alpha: 0.45,
    scaleX: 1.12,
    duration: 1100,
    yoyo: true,
    repeat: -1,
  });

  for (let i = 0; i < 5; i++) {
    const smoke = scene.add.circle(vx + (i - 2) * 14 * scale, peakY - 30 * scale - i * 22 * scale, 10 + i * 4, 0x57534e, 0.2);
    smoke.setDepth(depth - 1);
    scene.tweens.add({
      targets: smoke,
      y: smoke.y - 40 - i * 15,
      alpha: 0.05,
      scale: 1.4,
      duration: 2800 + i * 400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeOut",
    });
  }

  scene.add
    .text(vx, peakY - 55 * scale, "THE GREAT CALDERA", {
      fontFamily: "system-ui, sans-serif",
      fontSize: `${Math.round(11 * scale)}px`,
      color: "#fdba74",
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setAlpha(0.45)
    .setDepth(depth);
}

/** Climb path embers + heat (visual only, no physics). */
function addVolcanoClimbAmbience(scene, volcano, depth) {
  for (let t = 0.08; t <= 0.95; t += 0.11) {
    const p = volcanoSlopePoint(volcano, t);
    const ember = scene.add.circle(p.x - 38, p.y + 18, 3, 0xfbbf24, 0.55).setDepth(depth);
    scene.tweens.add({
      targets: ember,
      alpha: 0.15,
      y: ember.y - 8,
      duration: 900 + t * 600,
      yoyo: true,
      repeat: -1,
    });
  }
  const { footX, peakX, peakY, baseY } = volcano;
  const vent = scene.add.ellipse(footX + 40, baseY - 8, 90, 20, 0xdc2626, 0.2).setDepth(depth - 1);
  scene.tweens.add({ targets: vent, alpha: 0.38, duration: 1400, yoyo: true, repeat: -1 });
  scene.add
    .text(footX + 30, baseY - 42, "↑ Ascent", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "11px",
      color: "#fdba74",
    })
    .setOrigin(0.5)
    .setAlpha(0.55)
    .setDepth(depth);
  scene.add
    .text(peakX - 50, peakY - 52, "Summit shrine →", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "10px",
      color: "#fde68a",
    })
    .setOrigin(0.5)
    .setAlpha(0.6)
    .setDepth(depth);
}

/** Climbable volcano backdrop — visual only; stays behind gameplay. */
export function createClimbableVolcano(scene, worldW, groundY, height, opts = {}) {
  const footX = opts.footX ?? opts.baseX ?? worldW * 0.45;
  const peakX = opts.peakX ?? worldW * 0.88;
  const baseY = opts.baseY ?? groundY;
  const peakY = opts.peakY ?? baseY - 300;
  const ridgeX = peakX + 55;
  const depthBg = -3;
  const depth = -2;

  scene.add.rectangle(peakX - 200, (baseY + peakY) / 2, 520, baseY - peakY + 80, 0x450a0a, 0.14).setDepth(depthBg);

  const footL = footX - 80;
  const g = scene.add.graphics();
  g.setDepth(depth);

  g.fillStyle(0x1c1917, 0.9);
  g.beginPath();
  g.moveTo(footL, baseY);
  g.lineTo(ridgeX + 30, baseY - 20);
  g.lineTo(ridgeX, peakY + 35);
  g.lineTo(peakX + 55, peakY + 5);
  g.lineTo(footX - 30, baseY - 18);
  g.closePath();
  g.fillPath();

  g.fillStyle(0x292524, 0.88);
  g.beginPath();
  g.moveTo(footX - 40, baseY);
  g.lineTo(ridgeX - 10, peakY + 45);
  g.lineTo(peakX + 25, peakY + 10);
  g.lineTo(footX + 10, baseY - 12);
  g.closePath();
  g.fillPath();

  g.fillStyle(0x44403c, 0.85);
  g.beginPath();
  g.moveTo(footX + 15, baseY - 10);
  g.lineTo(peakX - 15, peakY + 22);
  g.lineTo(peakX - 55, peakY + 4);
  g.closePath();
  g.fillPath();

  g.fillStyle(0xdc2626, 0.5);
  g.fillTriangle(footX + 50, baseY, footX + 150, baseY, footX + 120, baseY - 120);
  g.fillStyle(0xea580c, 0.4);
  g.fillTriangle(footX + 140, baseY - 45, footX + 280, baseY - 25, footX + 220, baseY - 170);

  const craterX = peakX + 25;
  scene.add.ellipse(craterX, peakY - 4, 72, 22, 0x7c2d12, 0.95).setDepth(depth);
  const lava = scene.add.ellipse(craterX, peakY, 48, 12, 0xf97316, 0.9).setDepth(depth - 1);
  scene.tweens.add({
    targets: lava,
    alpha: 0.5,
    scaleX: 1.12,
    duration: 700,
    yoyo: true,
    repeat: -1,
  });

  for (let i = 0; i < 5; i++) {
    const puff = scene.add.circle(craterX + (i - 2) * 12, peakY - 28 - i * 24, 10 + i * 2, 0x78716c, 0.22);
    puff.setDepth(depth - 1);
    scene.tweens.add({
      targets: puff,
      y: puff.y - 45,
      alpha: 0.05,
      scale: 1.4,
      duration: 2400 + i * 300,
      yoyo: true,
      repeat: -1,
    });
  }

  const rimGlow = scene.add.circle(peakX - 40, peakY, 85, 0xea580c, 0.07).setDepth(depth - 1);
  scene.tweens.add({
    targets: rimGlow,
    alpha: 0.16,
    scale: 1.08,
    duration: 1500,
    yoyo: true,
    repeat: -1,
  });

  addVolcanoClimbAmbience(scene, opts, depth);
}

/**
 * Central volcano for Cinder Wraith boss — boss erupts from the caldera.
 * @returns {{ cx: number, mouthY: number, emergeY: number, lava: object, smoke: object[] }}
 */
export function createEmberBossVolcano(scene, cx, groundY, arena) {
  const g = groundY;
  const mouthY = arena?.volcanoMouthY ?? g - 212;
  const emergeY = arena?.volcanoEmergeY ?? g - 160;
  const depth = -1;
  const baseY = g - 55;
  const peakY = mouthY - 95;

  const haze = scene.add.circle(cx, mouthY - 30, 100, 0xea580c, 0.12).setDepth(depth - 1);
  scene.tweens.add({ targets: haze, alpha: 0.22, scale: 1.1, duration: 1800, yoyo: true, repeat: -1 });

  const cone = scene.add.graphics().setDepth(depth);
  cone.fillStyle(0x1c1917, 0.92);
  cone.fillTriangle(cx - 130, baseY, cx + 130, baseY, cx, peakY);
  cone.fillStyle(0x292524, 0.88);
  cone.fillTriangle(cx - 95, baseY, cx + 95, baseY, cx, peakY + 25);
  cone.fillStyle(0x44403c, 0.85);
  cone.fillTriangle(cx - 55, baseY - 15, cx + 55, baseY - 15, cx, peakY + 45);
  cone.fillStyle(0xdc2626, 0.45);
  cone.fillTriangle(cx - 40, baseY, cx + 40, baseY, cx, mouthY + 20);

  const rim = scene.add.ellipse(cx, mouthY - 8, 118, 32, 0x7c2d12, 0.95).setDepth(depth);
  const lava = scene.add.ellipse(cx, mouthY - 2, 78, 20, 0xf97316, 0.92).setDepth(depth - 1);
  scene.tweens.add({
    targets: lava,
    alpha: 0.55,
    scaleX: 1.14,
    duration: 650,
    yoyo: true,
    repeat: -1,
  });

  const smoke = [];
  for (let i = 0; i < 4; i++) {
    const puff = scene.add.circle(cx + (i - 2) * 18, mouthY - 40 - i * 22, 14 + i * 3, 0x57534e, 0.28);
    puff.setDepth(depth - 2);
    smoke.push(puff);
    scene.tweens.add({
      targets: puff,
      y: puff.y - 55,
      alpha: 0.06,
      scale: 1.5,
      duration: 2600 + i * 400,
      yoyo: true,
      repeat: -1,
    });
  }

  scene.add
    .text(cx, mouthY - 62, "CALDERA", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "11px",
      color: "#fdba74",
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setAlpha(0.5)
    .setDepth(depth);

  return { cx, mouthY, emergeY, lava, rim, smoke, cone };
}

/** Burst when the boss emerges from the volcano mouth. */
export function playVolcanoEruption(scene, volcano) {
  if (!volcano) return;
  const { cx, mouthY, lava, smoke } = volcano;

  scene.cameras.main.shake(280, 0.012);
  scene.tweens.add({
    targets: lava,
    scaleX: 1.5,
    scaleY: 1.4,
    alpha: 1,
    duration: 200,
    yoyo: true,
  });

  for (let i = 0; i < 10; i++) {
    const spark = scene.add.circle(cx + Phaser.Math.Between(-40, 40), mouthY, Phaser.Math.Between(4, 9), 0xfbbf24, 0.9);
    spark.setDepth(12);
    scene.tweens.add({
      targets: spark,
      y: mouthY - Phaser.Math.Between(60, 140),
      x: spark.x + Phaser.Math.Between(-30, 30),
      alpha: 0,
      scale: 0.2,
      duration: 500 + i * 40,
      ease: "Quad.easeOut",
      onComplete: () => spark.destroy(),
    });
  }

  if (smoke) {
    for (const puff of smoke) {
      scene.tweens.add({
        targets: puff,
        scale: 2,
        alpha: 0.5,
        duration: 400,
        yoyo: true,
      });
    }
  }
}

/** Dense volcanic dressing inside boss arena. */
export function createEmberArenaVolcano(scene, arena, groundY, height, platforms = []) {
  const worldW = scene.scale?.width ?? arena.innerRight + 200;
  createEmberVolcano(scene, worldW, groundY, height, {
    xMin: arena.innerLeft,
    xMax: arena.innerRight,
    platforms,
    dense: true,
  });

  const arenaW = arena.innerRight - arena.innerLeft;
  const cx = arena.centerX ?? (arena.innerLeft + arena.innerRight) / 2;

  const pitGlow = scene.add.ellipse(cx, groundY + 6, arenaW * 0.55, 22, 0xdc2626, 0.35).setDepth(1);
  scene.tweens.add({
    targets: pitGlow,
    alpha: 0.55,
    scaleX: 1.08,
    duration: 900,
    yoyo: true,
    repeat: -1,
  });

  const coreGlow = scene.add.circle(cx, groundY - 150, 80, 0xf97316, 0.1).setDepth(0);
  scene.tweens.add({
    targets: coreGlow,
    alpha: 0.28,
    scale: 1.15,
    duration: 1100,
    yoyo: true,
    repeat: -1,
  });

  for (let i = 0; i < 6; i++) {
    const x = arena.innerLeft + 50 + i * (arenaW / 6);
    addLavaCrack(scene, x, groundY, 2);
    scene.add.ellipse(x, groundY - 130 - (i % 2) * 20, 20, 45, 0xea580c, 0.2).setDepth(0);
  }
}
