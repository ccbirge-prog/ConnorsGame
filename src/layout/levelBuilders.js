import { UNLOCK_ORDER } from "../progression.js";
import {
  buildVolcanoColliderDefs,
  buildVolcanoPickupSpots,
  volcanoSlopePoint,
} from "../world/emberDecor.js";
import {
  FINAL_BIOME_INDEX,
  getBiome,
  getLevelDisplayName,
  globalLevelIndex,
  SECRET_BIOME_INDEX,
  splitLevelIndex,
} from "../world/biomes.js";

function clampY(y, groundY) {
  return Math.min(groundY - 48, Math.max(groundY - 88, y));
}

function spreadPickups(groundY, platforms, worldW, spots) {
  if (spots) return spots;
  const sorted = [...platforms].sort((a, b) => a.x - b.x);
  const pickups = [{ id: "spine", x: 150, y: groundY - 36 }];
  for (let i = 1; i < UNLOCK_ORDER.length; i++) {
    const t = i / (UNLOCK_ORDER.length - 1);
    const idx = sorted.length ? Math.min(sorted.length - 1, Math.floor(t * sorted.length)) : 0;
    const plat = sorted[idx] ?? { x: 180 + t * (worldW - 320), y: groundY - 52 };
    pickups.push({
      id: UNLOCK_ORDER[i],
      x: Math.min(worldW - 120, Math.max(100, plat.x)),
      y: clampY(plat.y, groundY) - 36,
    });
  }
  return pickups;
}

function pack(biomeIndex, levelInBiome, groundY, height, hard, extra) {
  const biome = getBiome(biomeIndex);
  const tier = globalLevelIndex(biomeIndex, levelInBiome);
  return {
    levelIndex: tier,
    biomeIndex,
    levelInBiome,
    biome,
    name: getLevelDisplayName(biomeIndex, levelInBiome),
    isBossLevel: false,
    gravityY: hard ? 840 : 760,
    baseJump: hard ? -580 : -620,
    hopJump: hard ? -460 : -500,
    ...extra,
  };
}

/** —— RUIN PLAZA (0–3) —— */
function ruinAwakening(groundY, height, hard) {
  const g = groundY;
  return pack(0, 0, g, height, hard, {
    worldW: 1700,
    shrineX: 1590,
    platforms: [
      { x: 320, y: g - 54, w: 120 },
      { x: 580, y: g - 54, w: 120 },
    ],
    spikes: [{ x: 420, y: g - 6, w: 180, h: 12 }],
    pickups: spreadPickups(g, [], 1700, [
      { id: "spine", x: 140, y: g - 36 },
      { id: "torso", x: 320, y: g - 90 },
      { id: "arms", x: 580, y: g - 90 },
      { id: "hands", x: 820, y: g - 36 },
      { id: "legs", x: 1020, y: g - 36 },
      { id: "feet", x: 1220, y: g - 36 },
      { id: "eyes", x: 1380, y: g - 36 },
      { id: "heart", x: 1520, y: g - 36 },
    ]),
    checkpoints: [
      { x: 100, cpY: g },
      { x: 800, cpY: g },
    ],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function ruinTowers(groundY, height, hard) {
  const g = groundY;
  return pack(0, 1, g, height, hard, {
    worldW: 1900,
    shrineX: 1790,
    platforms: [
      { x: 280, y: g - 52, w: 70 },
      { x: 280, y: g - 78, w: 70 },
      { x: 520, y: g - 58, w: 64 },
      { x: 760, y: g - 82, w: 68 },
      { x: 1020, y: g - 56, w: 72 },
      { x: 1280, y: g - 80, w: 66 },
    ],
    spikes: [
      { x: 380, y: g - 6, w: 90, h: 12 },
      { x: 900, y: g - 6, w: 110, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 110, cpY: g }, { x: 760, cpY: g - 82 }],
    moving: { x: 520, y: g - 58, w: 64, h: 16, minX: 460, maxX: 640, speed: hard ? 68 : 50 },
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function ruinVault(groundY, height, hard) {
  const g = groundY;
  const wallX = 920;
  return pack(0, 2, g, height, hard, {
    worldW: 2000,
    shrineX: 1890,
    platforms: [
      { x: 360, y: g - 56, w: 90 },
      { x: 620, y: g - 72, w: 80 },
      { x: wallX + 200, y: g - 60, w: 100 },
      { x: 1500, y: g - 68, w: 88 },
    ],
    spikes: [{ x: 250, y: g - 6, w: 200, h: 12 }, { x: wallX + 40, y: g - 6, w: 160, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 120, cpY: g }, { x: wallX + 200, cpY: g - 60 }],
    moving: null,
    crumble: null,
    barrier: { x: wallX, y: height - 205, w: 22, h: 290, switchId: "gate" },
    switch: { x: wallX - 140, y: g - 72, r: 17, id: "gate" },
    patrol: null,
  });
}

function ruinCrumbleShuttle(groundY, height, hard) {
  const g = groundY;
  return pack(0, 3, g, height, hard, {
    worldW: 2100,
    shrineX: 1990,
    platforms: [
      { x: 400, y: g - 54, w: 86 },
      { x: 1100, y: g - 78, w: 58 },
      { x: 1450, y: g - 56, w: 92 },
    ],
    spikes: [
      { x: 600, y: g - 6, w: 140, h: 12 },
      { x: 1250, y: g - 6, w: 120, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 110, cpY: g }, { x: 1100, cpY: g - 78 }],
    moving: { x: 700, y: g - 54, w: 72, h: 16, minX: 520, maxX: 900, speed: hard ? 80 : 58 },
    crumble: { x: 1100, y: g - 78, w: 58, h: 16 },
    barrier: null,
    switch: null,
    patrol: { x: 1600, y: g - 50, w: 12, h: 44, minY: g - 88, maxY: g - 30, speed: hard ? 62 : 44 },
  });
}

/** —— EMBER (4–7) —— */
function emberAshWalk(groundY, height, hard) {
  const g = groundY;
  return pack(1, 0, g, height, hard, {
    worldW: 2800,
    shrineX: 2680,
    platforms: [
      { x: 420, y: g - 56, w: 72 },
      { x: 780, y: g - 58, w: 70 },
      { x: 1140, y: g - 60, w: 68 },
      { x: 1500, y: g - 58, w: 70 },
      { x: 1860, y: g - 62, w: 66 },
      { x: 2220, y: g - 56, w: 72 },
    ],
    spikes: [
      { x: 280, y: g - 6, w: 140, h: 12 },
      { x: 620, y: g - 6, w: 200, h: 12 },
      { x: 980, y: g - 6, w: 220, h: 12 },
      { x: 1340, y: g - 6, w: 200, h: 12 },
      { x: 1700, y: g - 6, w: 220, h: 12 },
      { x: 2060, y: g - 6, w: 180, h: 12 },
    ],
    pickups: null,
    checkpoints: [
      { x: 100, cpY: g },
      { x: 1140, cpY: g - 60 },
      { x: 2220, cpY: g - 56 },
    ],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function emberStair(groundY, height, hard) {
  const g = groundY;
  const steps = [];
  for (let i = 0; i < 11; i++) {
    steps.push({ x: 220 + i * 230, y: g - 48 - i * 6, w: 62 });
  }
  return pack(1, 1, g, height, hard, {
    worldW: 3000,
    shrineX: 2880,
    platforms: steps,
    spikes: [
      { x: 900, y: g - 6, w: 350, h: 12 },
      { x: 1800, y: g - 6, w: 400, h: 12 },
    ],
    pickups: null,
    checkpoints: [
      { x: 120, cpY: g },
      { x: 1400, cpY: g - 72 },
      { x: 2550, cpY: g - 108 },
    ],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function emberShuttle(groundY, height, hard) {
  const g = groundY;
  const worldW = 3500;
  const volcanoX = worldW - 220;
  return pack(1, 2, g, height, hard, {
    worldW,
    shrineX: 3360,
    emberVolcano: "distant",
    volcano: { x: volcanoX, baseY: g, scale: 1.1 },
    platforms: [
      { x: 280, y: g - 62, w: 58 },
      { x: 560, y: g - 64, w: 56 },
      { x: 840, y: g - 64, w: 56 },
      { x: 1120, y: g - 66, w: 54 },
      { x: 1400, y: g - 68, w: 52 },
      { x: 1680, y: g - 70, w: 50 },
      { x: 1960, y: g - 72, w: 48 },
      { x: 2240, y: g - 74, w: 48 },
      { x: 2520, y: g - 76, w: 46 },
      { x: 2800, y: g - 78, w: 46 },
    ],
    spikes: [
      { x: 400, y: g - 6, w: 180, h: 12 },
      { x: 1000, y: g - 6, w: 260, h: 12 },
      { x: 1600, y: g - 6, w: 280, h: 12 },
      { x: 2200, y: g - 6, w: 240, h: 12 },
    ],
    pickups: null,
    checkpoints: [
      { x: 100, cpY: g },
      { x: 1400, cpY: g - 68 },
      { x: 2520, cpY: g - 76 },
    ],
    moving: { x: 1120, y: g - 66, w: 56, h: 16, minX: 900, maxX: 1360, speed: hard ? 95 : 72 },
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function emberVolcanoClimb(groundY, height, hard) {
  const g = groundY;
  const worldW = 3800;
  const peakY = g - 318;
  const peakX = 3320;
  const footX = 1380;
  const volcano = { footX, baseX: footX, peakX, peakY, baseY: g };
  const midSlope = volcanoSlopePoint(volcano, 0.52);
  const approach = [
    { x: 160, y: g - 38, w: 120 },
    { x: 400, y: g - 52, w: 82 },
    { x: 640, y: g - 48, w: 78 },
    { x: 880, y: g - 58, w: 74 },
    { x: 1120, y: g - 52, w: 70 },
  ];
  return pack(1, 3, g, height, hard, {
    worldW,
    shrineX: peakX - 115,
    shrineAnchorY: peakY + 30,
    emberVolcano: "climb",
    volcano,
    volcanoColliders: buildVolcanoColliderDefs(volcano),
    platforms: approach,
    spikes: [
      { x: 520, y: g - 6, w: 380, h: 12 },
      { x: 1180, y: g - 6, w: 160, h: 12 },
      { x: peakX + 18, y: peakY + 16, w: 48, h: 12 },
    ],
    pickups: buildVolcanoPickupSpots(volcano, g),
    checkpoints: [
      { x: 110, cpY: g },
      { x: 1120, cpY: g - 52 },
      { x: midSlope.x, cpY: midSlope.y },
    ],
    moving: { x: 880, y: g - 58, w: 68, h: 16, minX: 720, maxX: 1040, speed: hard ? 72 : 55 },
    crumble: { x: 640, y: g - 48, w: 78, h: 16 },
    barrier: null,
    switch: null,
    patrol: {
      x: midSlope.x + 90,
      y: midSlope.y - 70,
      w: 12,
      h: 40,
      minY: midSlope.y - 120,
      maxY: midSlope.y - 20,
      speed: hard ? 58 : 42,
    },
  });
}

/** —— FROST (8–11) —— */
function frostRime(groundY, height, hard) {
  const g = groundY;
  return pack(2, 0, g, height, hard, {
    worldW: 2000,
    shrineX: 1890,
    platforms: [{ x: 600, y: g - 60, w: 200 }, { x: 1200, y: g - 60, w: 200 }],
    spikes: [
      { x: 200, y: g - 6, w: 300, h: 12 },
      { x: 850, y: g - 6, w: 250, h: 12 },
      { x: 1500, y: g - 6, w: 280, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }, { x: 1200, cpY: g - 60 }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function frostZigzag(groundY, height, hard) {
  const g = groundY;
  return pack(2, 1, g, height, hard, {
    worldW: 2100,
    shrineX: 1990,
    platforms: [
      { x: 320, y: g - 52, w: 80 },
      { x: 560, y: g - 76, w: 72 },
      { x: 820, y: g - 54, w: 76 },
      { x: 1080, y: g - 80, w: 70 },
      { x: 1340, y: g - 56, w: 74 },
      { x: 1620, y: g - 78, w: 68 },
    ],
    spikes: [{ x: 700, y: g - 6, w: 100, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 110, cpY: g }, { x: 1080, cpY: g - 80 }],
    moving: { x: 820, y: g - 54, w: 76, h: 16, minX: 700, maxX: 960, speed: hard ? 75 : 55 },
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function frostHall(groundY, height, hard) {
  const g = groundY;
  const wallX = 1050;
  return pack(2, 2, g, height, hard, {
    worldW: 2050,
    shrineX: 1940,
    platforms: [
      { x: 400, y: g - 58, w: 88 },
      { x: wallX + 180, y: g - 62, w: 96 },
    ],
    spikes: [{ x: 500, y: g - 6, w: 400, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 120, cpY: g }],
    moving: null,
    crumble: null,
    barrier: { x: wallX, y: height - 205, w: 22, h: 290, switchId: "gate" },
    switch: { x: 850, y: g - 58, r: 17, id: "gate" },
    patrol: { x: 1400, y: g - 45, w: 14, h: 50, minY: g - 90, maxY: g - 25, speed: hard ? 78 : 56 },
  });
}

function frostPits(groundY, height, hard) {
  const g = groundY;
  return pack(2, 3, g, height, hard, {
    worldW: 2150,
    shrineX: 2040,
    platforms: [
      { x: 280, y: g - 55, w: 60 },
      { x: 480, y: g - 55, w: 60 },
      { x: 900, y: g - 70, w: 55 },
      { x: 1180, y: g - 55, w: 58 },
      { x: 1500, y: g - 72, w: 54 },
      { x: 1780, y: g - 56, w: 60 },
    ],
    spikes: [
      { x: 350, y: g - 6, w: 100, h: 12 },
      { x: 650, y: g - 6, w: 180, h: 12 },
      { x: 1050, y: g - 6, w: 90, h: 12 },
      { x: 1350, y: g - 6, w: 120, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }, { x: 1500, cpY: g - 72 }],
    moving: null,
    crumble: { x: 1500, y: g - 72, w: 54, h: 16 },
    barrier: null,
    switch: null,
    patrol: null,
  });
}

/** —— BLOOM (12–15) —— */
function bloomRoots(groundY, height, hard) {
  const g = groundY;
  return pack(3, 0, g, height, hard, {
    worldW: 1800,
    shrineX: 1690,
    platforms: [
      { x: 400, y: g - 54, w: 100 },
      { x: 800, y: g - 68, w: 90 },
      { x: 1200, y: g - 54, w: 100 },
    ],
    spikes: [],
    pickups: null,
    checkpoints: [{ x: 110, cpY: g }, { x: 800, cpY: g - 68 }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function bloomCanopy(groundY, height, hard) {
  const g = groundY;
  return pack(3, 1, g, height, hard, {
    worldW: 2000,
    shrineX: 1890,
    platforms: [
      { x: 300, y: g - 78, w: 88 },
      { x: 550, y: g - 50, w: 88 },
      { x: 850, y: g - 82, w: 84 },
      { x: 1150, y: g - 48, w: 90 },
      { x: 1450, y: g - 80, w: 86 },
    ],
    spikes: [{ x: 680, y: g - 6, w: 120, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 120, cpY: g }, { x: 850, cpY: g - 82 }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function bloomThornGate(groundY, height, hard) {
  const g = groundY;
  const wallX = 980;
  return pack(3, 2, g, height, hard, {
    worldW: 2080,
    shrineX: 1970,
    platforms: [
      { x: 380, y: g - 56, w: 82 },
      { x: 650, y: g - 74, w: 70 },
      { x: wallX + 220, y: g - 58, w: 94 },
    ],
    spikes: [
      { x: 280, y: g - 6, w: 150, h: 12 },
      { x: wallX + 60, y: g - 6, w: 200, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 110, cpY: g }],
    moving: { x: 650, y: g - 74, w: 70, h: 16, minX: 560, maxX: 780, speed: hard ? 70 : 52 },
    crumble: null,
    barrier: { x: wallX, y: height - 205, w: 22, h: 290, switchId: "gate" },
    switch: { x: wallX - 130, y: g - 74, r: 17, id: "gate" },
    patrol: null,
  });
}

function bloomSporeField(groundY, height, hard) {
  const g = groundY;
  return pack(3, 3, g, height, hard, {
    worldW: 2250,
    shrineX: 2140,
    platforms: [],
    spikes: [],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }, { x: 1100, cpY: g }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

// Micro-platform minefield for bloom 3
const bloomSporeFieldOrig = bloomSporeField;
function bloomSporeFieldFixed(groundY, height, hard) {
  const layout = bloomSporeFieldOrig(groundY, height, hard);
  const g = groundY;
  const plats = [];
  let cx = 260;
  for (let i = 0; i < 14; i++) {
    cx += 95 + (i % 3) * 15;
    plats.push({ x: cx, y: g - 50 - (i % 4) * 8, w: 38 + (i % 2) * 8 });
  }
  layout.platforms = plats;
  layout.spikes = [
    { x: 400, y: g - 6, w: 80, h: 12 },
    { x: 900, y: g - 6, w: 100, h: 12 },
    { x: 1400, y: g - 6, w: 90, h: 12 },
  ];
  layout.pickups = spreadPickups(g, plats, layout.worldW);
  return layout;
}

/** —— STORM (16–19) —— */
function stormStatic(groundY, height, hard) {
  const g = groundY;
  return pack(4, 0, g, height, hard, {
    worldW: 1900,
    shrineX: 1790,
    platforms: [
      { x: 450, y: g - 58, w: 90 },
      { x: 900, y: g - 62, w: 86 },
      { x: 1350, y: g - 58, w: 88 },
    ],
    spikes: [
      { x: 300, y: g - 6, w: 200, h: 12 },
      { x: 1100, y: g - 6, w: 220, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }, { x: 900, cpY: g - 62 }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function stormLadder(groundY, height, hard) {
  const g = groundY;
  const steps = [];
  for (let i = 0; i < 8; i++) {
    steps.push({ x: 240 + i * 210, y: g - 48 - i * 7, w: 62 });
  }
  return pack(4, 1, g, height, hard, {
    worldW: 2050,
    shrineX: 1940,
    platforms: steps,
    spikes: [{ x: 900, y: g - 6, w: 350, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 120, cpY: g }, { x: 1500, cpY: g - 96 }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function stormBridge(groundY, height, hard) {
  const g = groundY;
  return pack(4, 2, g, height, hard, {
    worldW: 2150,
    shrineX: 2040,
    platforms: [
      { x: 320, y: g - 70, w: 52 },
      { x: 620, y: g - 70, w: 52 },
      { x: 920, y: g - 74, w: 50 },
      { x: 1220, y: g - 70, w: 52 },
      { x: 1520, y: g - 74, w: 50 },
    ],
    spikes: [{ x: 480, y: g - 6, w: 500, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }],
    moving: { x: 620, y: g - 70, w: 52, h: 16, minX: 480, maxX: 760, speed: hard ? 88 : 68 },
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function stormGale(groundY, height, hard) {
  const g = groundY;
  return pack(4, 3, g, height, hard, {
    worldW: 2300,
    shrineX: 2190,
    platforms: [
      { x: 260, y: g - 52, w: 58 },
      { x: 500, y: g - 68, w: 54 },
      { x: 760, y: g - 54, w: 56 },
      { x: 1020, y: g - 72, w: 52 },
      { x: 1280, y: g - 58, w: 54 },
      { x: 1540, y: g - 70, w: 52 },
      { x: 1800, y: g - 56, w: 56 },
    ],
    spikes: [
      { x: 400, y: g - 6, w: 120, h: 12 },
      { x: 900, y: g - 6, w: 140, h: 12 },
      { x: 1400, y: g - 6, w: 130, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 110, cpY: g }, { x: 1280, cpY: g - 58 }],
    moving: null,
    crumble: { x: 1020, y: g - 72, w: 52, h: 16 },
    barrier: null,
    switch: null,
    patrol: { x: 1700, y: g - 90, w: 12, h: 42, minY: g - 140, maxY: g - 60, speed: hard ? 65 : 48 },
  });
}

/** —— DUNES (20–23) —— */
function duneWalk(groundY, height, hard) {
  const g = groundY;
  return pack(5, 0, g, height, hard, {
    worldW: 1950,
    shrineX: 1840,
    platforms: [
      { x: 500, y: g - 56, w: 85 },
      { x: 950, y: g - 56, w: 82 },
      { x: 1400, y: g - 58, w: 80 },
    ],
    spikes: [
      { x: 350, y: g - 6, w: 180, h: 12 },
      { x: 1150, y: g - 6, w: 200, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }, { x: 950, cpY: g - 56 }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function duneBuried(groundY, height, hard) {
  const g = groundY;
  return pack(5, 1, g, height, hard, {
    worldW: 2100,
    shrineX: 1990,
    platforms: [
      { x: 350, y: g - 50, w: 70 },
      { x: 600, y: g - 72, w: 65 },
      { x: 880, y: g - 48, w: 68 },
      { x: 1150, y: g - 76, w: 64 },
      { x: 1420, y: g - 52, w: 66 },
    ],
    spikes: [{ x: 750, y: g - 6, w: 280, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 110, cpY: g }, { x: 1150, cpY: g - 76 }],
    moving: { x: 880, y: g - 48, w: 68, h: 16, minX: 720, maxX: 1040, speed: hard ? 62 : 48 },
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function duneScarab(groundY, height, hard) {
  const g = groundY;
  const wallX = 1080;
  return pack(5, 2, g, height, hard, {
    worldW: 2080,
    shrineX: 1970,
    platforms: [
      { x: 380, y: g - 56, w: 80 },
      { x: 700, y: g - 74, w: 68 },
      { x: wallX + 200, y: g - 60, w: 92 },
    ],
    spikes: [{ x: 500, y: g - 6, w: 350, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 120, cpY: g }],
    moving: null,
    crumble: null,
    barrier: { x: wallX, y: height - 205, w: 22, h: 290, switchId: "gate" },
    switch: { x: 820, y: g - 56, r: 17, id: "gate" },
    patrol: null,
  });
}

function duneSunken(groundY, height, hard) {
  const g = groundY;
  return pack(5, 3, g, height, hard, {
    worldW: 2250,
    shrineX: 2140,
    platforms: [
      { x: 280, y: g - 54, w: 56 },
      { x: 520, y: g - 70, w: 52 },
      { x: 800, y: g - 56, w: 54 },
      { x: 1080, y: g - 74, w: 50 },
      { x: 1360, y: g - 58, w: 52 },
      { x: 1640, y: g - 72, w: 50 },
    ],
    spikes: [
      { x: 400, y: g - 6, w: 100, h: 12 },
      { x: 950, y: g - 6, w: 120, h: 12 },
      { x: 1500, y: g - 6, w: 110, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }, { x: 1360, cpY: g - 58 }],
    moving: null,
    crumble: { x: 1080, y: g - 74, w: 50, h: 16 },
    barrier: null,
    switch: null,
    patrol: { x: 1800, y: g - 55, w: 12, h: 40, minY: g - 95, maxY: g - 35, speed: hard ? 55 : 40 },
  });
}

/** —— VOID (24–27) —— */
function voidHollow(groundY, height, hard) {
  const g = groundY;
  return pack(6, 0, g, height, hard, {
    worldW: 1880,
    shrineX: 1770,
    platforms: [{ x: 550, y: g - 60, w: 95 }, { x: 1150, y: g - 60, w: 92 }],
    spikes: [
      { x: 250, y: g - 6, w: 250, h: 12 },
      { x: 900, y: g - 6, w: 260, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }, { x: 1150, cpY: g - 60 }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function voidRift(groundY, height, hard) {
  const g = groundY;
  return pack(6, 1, g, height, hard, {
    worldW: 2050,
    shrineX: 1940,
    platforms: [
      { x: 340, y: g - 54, w: 78 },
      { x: 620, y: g - 78, w: 72 },
      { x: 900, y: g - 52, w: 74 },
      { x: 1180, y: g - 80, w: 70 },
      { x: 1460, y: g - 54, w: 72 },
    ],
    spikes: [{ x: 750, y: g - 6, w: 90, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 110, cpY: g }, { x: 1180, cpY: g - 80 }],
    moving: { x: 900, y: g - 52, w: 74, h: 16, minX: 760, maxX: 1040, speed: hard ? 70 : 52 },
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function voidShadow(groundY, height, hard) {
  const g = groundY;
  const wallX = 1020;
  return pack(6, 2, g, height, hard, {
    worldW: 2120,
    shrineX: 2010,
    platforms: [
      { x: 400, y: g - 58, w: 84 },
      { x: wallX + 190, y: g - 64, w: 90 },
    ],
    spikes: [{ x: 550, y: g - 6, w: 380, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 120, cpY: g }],
    moving: null,
    crumble: null,
    barrier: { x: wallX, y: height - 205, w: 22, h: 290, switchId: "gate" },
    switch: { x: 780, y: g - 58, r: 17, id: "gate" },
    patrol: { x: 1500, y: g - 50, w: 12, h: 44, minY: g - 88, maxY: g - 28, speed: hard ? 60 : 44 },
  });
}

function voidAbyss(groundY, height, hard) {
  const g = groundY;
  const plats = [];
  let cx = 250;
  for (let i = 0; i < 13; i++) {
    cx += 92 + (i % 3) * 12;
    plats.push({ x: cx, y: g - 48 - (i % 5) * 9, w: 40 + (i % 2) * 6 });
  }
  const secretPlat = { x: 1780, y: g - 102, w: 72, h: 16 };
  plats.push(secretPlat);
  return pack(6, 3, g, height, hard, {
    worldW: 2280,
    shrineX: 2170,
    platforms: plats,
    spikes: [
      { x: 420, y: g - 6, w: 90, h: 12 },
      { x: 1000, y: g - 6, w: 100, h: 12 },
      { x: 1580, y: g - 6, w: 95, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }, { x: 1100, cpY: g }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
    secretExit: { x: secretPlat.x, y: secretPlat.y - 48, w: 56, h: 80 },
  });
}

/** —— SECRET Eclipse Veil (40–43) —— */
function eclipseEntry(groundY, height, hard) {
  const g = groundY;
  return pack(SECRET_BIOME_INDEX, 0, g, height, hard, {
    worldW: 1900,
    shrineX: 1780,
    platforms: [
      { x: 320, y: g - 58, w: 90 },
      { x: 720, y: g - 72, w: 86 },
      { x: 1120, y: g - 58, w: 88 },
    ],
    spikes: [],
    pickups: null,
    checkpoints: [{ x: 110, cpY: g }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function eclipseBridge(groundY, height, hard) {
  const g = groundY;
  return pack(SECRET_BIOME_INDEX, 1, g, height, hard, {
    worldW: 2050,
    shrineX: 1940,
    platforms: [
      { x: 280, y: g - 68, w: 80 },
      { x: 520, y: g - 88, w: 76 },
      { x: 760, y: g - 68, w: 78 },
      { x: 1000, y: g - 90, w: 76 },
      { x: 1240, y: g - 70, w: 80 },
    ],
    spikes: [{ x: 620, y: g - 6, w: 120, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }, { x: 760, cpY: g - 68 }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function eclipseHall(groundY, height, hard) {
  const g = groundY;
  return pack(SECRET_BIOME_INDEX, 2, g, height, hard, {
    worldW: 2150,
    shrineX: 2040,
    platforms: [
      { x: 340, y: g - 55, w: 88 },
      { x: 900, y: g - 78, w: 84 },
      { x: 1460, y: g - 55, w: 86 },
    ],
    spikes: [
      { x: 600, y: g - 6, w: 100, h: 12 },
      { x: 1200, y: g - 6, w: 110, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 110, cpY: g }],
    moving: { x: 900, y: g - 78, w: 84, h: 16, minX: 720, maxX: 1080, speed: hard ? 70 : 52 },
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function eclipseMoons(groundY, height, hard) {
  const g = groundY;
  const steps = [];
  for (let i = 0; i < 8; i++) {
    steps.push({ x: 240 + i * 210, y: g - 44 - (i % 4) * 11, w: 58 });
  }
  return pack(SECRET_BIOME_INDEX, 3, g, height, hard, {
    worldW: 2180,
    shrineX: 2080,
    platforms: steps,
    spikes: [{ x: 900, y: g - 6, w: 140, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }, { x: 1350, cpY: g - 66 }],
    moving: null,
    crumble: { x: 1100, y: g - 64, w: 56, h: 16 },
    barrier: null,
    switch: null,
    patrol: { x: 1600, y: g - 95, w: 12, h: 36, minY: g - 140, maxY: g - 65, speed: hard ? 48 : 36 },
  });
}

const SECRET_LEVEL_BUILDERS = [eclipseEntry, eclipseBridge, eclipseHall, eclipseMoons];

/** —— REEF (28–31) —— */
function reefPool(groundY, height, hard) {
  const g = groundY;
  return pack(7, 0, g, height, hard, {
    worldW: 1850,
    shrineX: 1740,
    platforms: [
      { x: 420, y: g - 55, w: 95 },
      { x: 900, y: g - 68, w: 88 },
      { x: 1280, y: g - 55, w: 90 },
    ],
    spikes: [],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }, { x: 900, cpY: g - 68 }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function reefCoral(groundY, height, hard) {
  const g = groundY;
  return pack(7, 1, g, height, hard, {
    worldW: 2000,
    shrineX: 1890,
    platforms: [
      { x: 310, y: g - 76, w: 86 },
      { x: 560, y: g - 48, w: 84 },
      { x: 840, y: g - 80, w: 82 },
      { x: 1120, y: g - 50, w: 86 },
      { x: 1400, y: g - 78, w: 80 },
    ],
    spikes: [{ x: 680, y: g - 6, w: 110, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 110, cpY: g }, { x: 840, cpY: g - 80 }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function reefCurrent(groundY, height, hard) {
  const g = groundY;
  return pack(7, 2, g, height, hard, {
    worldW: 2180,
    shrineX: 2070,
    platforms: [
      { x: 300, y: g - 58, w: 54 },
      { x: 560, y: g - 58, w: 54 },
      { x: 820, y: g - 62, w: 52 },
      { x: 1080, y: g - 58, w: 54 },
      { x: 1340, y: g - 62, w: 52 },
    ],
    spikes: [{ x: 450, y: g - 6, w: 480, h: 12 }],
    pickups: null,
    checkpoints: [{ x: 100, cpY: g }],
    moving: { x: 820, y: g - 62, w: 52, h: 16, minX: 660, maxX: 980, speed: hard ? 82 : 62 },
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
  });
}

function reefSpiral(groundY, height, hard) {
  const g = groundY;
  const steps = [];
  for (let i = 0; i < 9; i++) {
    steps.push({ x: 220 + i * 200, y: g - 46 - (i % 4) * 10, w: 60 });
  }
  return pack(7, 3, g, height, hard, {
    worldW: 2200,
    shrineX: 2090,
    platforms: steps,
    spikes: [
      { x: 600, y: g - 6, w: 150, h: 12 },
      { x: 1200, y: g - 6, w: 160, h: 12 },
    ],
    pickups: null,
    checkpoints: [{ x: 110, cpY: g }, { x: 1400, cpY: g - 76 }],
    moving: null,
    crumble: { x: 1000, y: g - 66, w: 58, h: 16 },
    barrier: null,
    switch: null,
    patrol: { x: 1650, y: g - 100, w: 12, h: 38, minY: g - 150, maxY: g - 70, speed: hard ? 52 : 38 },
  });
}

export const LEVEL_BUILDERS = [
  ruinAwakening,
  ruinTowers,
  ruinVault,
  ruinCrumbleShuttle,
  emberAshWalk,
  emberStair,
  emberShuttle,
  emberVolcanoClimb,
  frostRime,
  frostZigzag,
  frostHall,
  frostPits,
  bloomRoots,
  bloomCanopy,
  bloomThornGate,
  bloomSporeFieldFixed,
  stormStatic,
  stormLadder,
  stormBridge,
  stormGale,
  duneWalk,
  duneBuried,
  duneScarab,
  duneSunken,
  voidHollow,
  voidRift,
  voidShadow,
  voidAbyss,
  reefPool,
  reefCoral,
  reefCurrent,
  reefSpiral,
];

export function buildStandardLevel(levelIndex, groundY, height, hard) {
  const { biomeIndex, levelInBiome } = splitLevelIndex(levelIndex);
  if (biomeIndex === FINAL_BIOME_INDEX) return null;
  if (levelInBiome >= 4) return null;

  const builder =
    biomeIndex === SECRET_BIOME_INDEX
      ? SECRET_LEVEL_BUILDERS[levelInBiome]
      : LEVEL_BUILDERS[biomeIndex * 4 + levelInBiome];

  const layout = builder(groundY, height, hard);
  if (!layout.pickups) {
    layout.pickups = spreadPickups(groundY, layout.platforms, layout.worldW);
  }
  layout.shrineX = layout.shrineX ?? layout.worldW - 110;
  return layout;
}
