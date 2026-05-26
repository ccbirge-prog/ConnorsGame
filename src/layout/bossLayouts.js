import { FINAL_BIOME_INDEX, getBiome, getLevelDisplayName, globalLevelIndex } from "../world/biomes.js";

const BOSS_TYPES = [
  "warden",
  "cinder",
  "rime",
  "thorn",
  "storm",
  "sand",
  "void",
  "reef",
  "eclipse",
  "prime",
];
const BOSS_NAMES = [
  "Stone Warden",
  "Cinder Wraith",
  "Rime Colossus",
  "Thorn Matron",
  "Storm Herald",
  "Sand Tyrant",
  "Void Watcher",
  "Tide Matron",
  "Eclipse Matron",
  "Primordial Warden",
];

const ARENA_THEMES = [
  {
    decorType: "ruins",
    skyTint: 0x0c4a6e,
    floorTint: 0x1e3a4f,
    ringColor: 0x334155,
    ringAccent: 0x22d3ee,
    wallColor: 0x1e293b,
    wallStroke: 0x64748b,
    banner: "RUIN COLOSSEUM",
    bannerColor: "#94a3b8",
    decor: [
      { x: 200, y: 0, w: 24, h: 120, color: 0x334155, alpha: 0.4, depth: 0 },
      { x: 980, y: 0, w: 24, h: 120, color: 0x334155, alpha: 0.4, depth: 0 },
    ],
  },
  {
    decorType: "ember",
    skyTint: 0x450a0a,
    floorTint: 0x7c2d12,
    ringColor: 0x9a3412,
    ringAccent: 0xfbbf24,
    wallColor: 0x292524,
    wallStroke: 0xea580c,
    banner: "EMBER PIT",
    bannerColor: "#fdba74",
    decor: [
      { x: 300, y: 0, w: 18, h: 90, color: 0x44403c, alpha: 0.5, depth: 0 },
      { x: 880, y: 0, w: 18, h: 90, color: 0x44403c, alpha: 0.5, depth: 0 },
    ],
  },
  {
    decorType: "frost",
    skyTint: 0x0c4a6e,
    floorTint: 0x164e63,
    ringColor: 0x1e3a5f,
    ringAccent: 0x38bdf8,
    wallColor: 0x0f172a,
    wallStroke: 0x7dd3fc,
    banner: "FROST SANCTUM",
    bannerColor: "#bae6fd",
    decor: [
      { x: 250, y: 0, w: 20, h: 100, color: 0x1e3a52, alpha: 0.45, depth: 0 },
      { x: 930, y: 0, w: 20, h: 100, color: 0x1e3a52, alpha: 0.45, depth: 0 },
    ],
  },
  {
    decorType: "bloom",
    skyTint: 0x14532d,
    floorTint: 0x166534,
    ringColor: 0x15803d,
    ringAccent: 0x86efac,
    wallColor: 0x14532d,
    wallStroke: 0x4ade80,
    banner: "THORN GROVE",
    bannerColor: "#bbf7d0",
    decor: [
      { x: 220, y: 0, w: 16, h: 110, color: 0x365314, alpha: 0.5, depth: 0 },
      { x: 960, y: 0, w: 16, h: 110, color: 0x365314, alpha: 0.5, depth: 0 },
    ],
  },
  {
    decorType: "storm",
    skyTint: 0x1e1b4b,
    floorTint: 0x312e81,
    ringColor: 0x4338ca,
    ringAccent: 0xc4b5fd,
    wallColor: 0x1e1b4b,
    wallStroke: 0x818cf8,
    banner: "STORM SPIRE",
    bannerColor: "#c4b5fd",
    decor: [
      { x: 280, y: 0, w: 18, h: 95, color: 0x4338ca, alpha: 0.45, depth: 0 },
      { x: 900, y: 0, w: 18, h: 95, color: 0x4338ca, alpha: 0.45, depth: 0 },
    ],
  },
  {
    decorType: "dunes",
    skyTint: 0x451a03,
    floorTint: 0x78350f,
    ringColor: 0x92400e,
    ringAccent: 0xfcd34d,
    wallColor: 0x3d2814,
    wallStroke: 0xd97706,
    banner: "SAND COLOSSEUM",
    bannerColor: "#fcd34d",
    decor: [
      { x: 260, y: 0, w: 20, h: 88, color: 0x78350f, alpha: 0.5, depth: 0 },
      { x: 920, y: 0, w: 20, h: 88, color: 0x78350f, alpha: 0.5, depth: 0 },
    ],
  },
  {
    decorType: "void",
    skyTint: 0x1a0a2e,
    floorTint: 0x2e1065,
    ringColor: 0x3b0764,
    ringAccent: 0xa855f7,
    wallColor: 0x1a0a2e,
    wallStroke: 0x7c3aed,
    banner: "VOID PIT",
    bannerColor: "#d8b4fe",
    decor: [
      { x: 240, y: 0, w: 18, h: 100, color: 0x2e1065, alpha: 0.5, depth: 0 },
      { x: 940, y: 0, w: 18, h: 100, color: 0x2e1065, alpha: 0.5, depth: 0 },
    ],
  },
  {
    decorType: "reef",
    skyTint: 0x042f2e,
    floorTint: 0x0f766e,
    ringColor: 0x115e59,
    ringAccent: 0x5eead4,
    wallColor: 0x0c3535,
    wallStroke: 0x2dd4bf,
    banner: "REEF SANCTUM",
    bannerColor: "#99f6e4",
    decor: [
      { x: 270, y: 0, w: 16, h: 92, color: 0x115e59, alpha: 0.45, depth: 0 },
      { x: 910, y: 0, w: 16, h: 92, color: 0x115e59, alpha: 0.45, depth: 0 },
    ],
  },
  {
    decorType: "eclipse",
    skyTint: 0x2e1065,
    floorTint: 0x581c87,
    ringColor: 0x6b21a8,
    ringAccent: 0xf0abfc,
    wallColor: 0x1a0a2e,
    wallStroke: 0xe879f9,
    banner: "ECLIPSE SANCTUM",
    bannerColor: "#f0abfc",
    decor: [
      { x: 260, y: 0, w: 18, h: 100, color: 0x581c87, alpha: 0.5, depth: 0 },
      { x: 920, y: 0, w: 18, h: 100, color: 0x581c87, alpha: 0.5, depth: 0 },
    ],
  },
  {
    decorType: "prime",
    skyTint: 0x1c1917,
    floorTint: 0x44403c,
    ringColor: 0x78716c,
    ringAccent: 0xfef08a,
    wallColor: 0x0a0612,
    wallStroke: 0xfbbf24,
    banner: "PRIMORDIAL CORE",
    bannerColor: "#fef08a",
    decor: [
      { x: 240, y: 0, w: 22, h: 110, color: 0x57534e, alpha: 0.55, depth: 0 },
      { x: 940, y: 0, w: 22, h: 110, color: 0x57534e, alpha: 0.55, depth: 0 },
    ],
  },
];

/** Shared vertical layout for boss colosseums (open sky — no ceiling). */
export function bossArenaHeights(groundY, height = 600) {
  const topPad = 72;
  return {
    bossMinY: Math.max(topPad, groundY - height + topPad),
    bossMaxY: groundY - 86,
    platformY: groundY - 108,
    platformMid: groundY - 144,
    platformTop: groundY - 160,
    bossSpawnY: groundY - 182,
    volcanoMouthY: groundY - 212,
    volcanoEmergeY: groundY - 160,
  };
}

function bossPickups(g, cx) {
  const h = bossArenaHeights(g);
  return [
    { id: "spine", x: cx - 380, y: g - 36 },
    { id: "torso", x: cx - 260, y: h.platformMid },
    { id: "arms", x: cx - 130, y: h.platformMid },
    { id: "hands", x: cx + 130, y: h.platformMid },
    { id: "legs", x: cx + 260, y: h.platformMid },
    { id: "feet", x: cx - 200, y: h.platformY },
    { id: "eyes", x: cx + 200, y: h.platformY },
    { id: "heart", x: cx, y: h.platformTop - 8 },
  ];
}

export function buildBossLevel(biomeIndex, groundY, height, hard) {
  const biome = getBiome(biomeIndex);
  const worldW = 1180;
  const g = groundY;
  const cx = worldW / 2;
  const innerLeft = 140;
  const innerRight = worldW - 140;
  const theme = ARENA_THEMES[biomeIndex] ?? ARENA_THEMES[0];
  const bossStage = biomeIndex === FINAL_BIOME_INDEX ? 0 : 4;

  const ah = bossArenaHeights(g, height);
  const platforms = [
    { x: cx - 280, y: ah.platformY, w: 88, arena: true },
    { x: cx - 140, y: ah.platformMid, w: 72, arena: true },
    { x: cx + 140, y: ah.platformMid, w: 72, arena: true },
    { x: cx + 280, y: ah.platformY, w: 88, arena: true },
    { x: cx, y: ah.platformTop, w: 110, arena: true },
    { x: cx - 420, y: g - 58, w: 64, arena: true },
    { x: cx + 420, y: g - 58, w: 64, arena: true },
  ];

  const emberVolcano =
    biomeIndex === 1
      ? { x: cx, mouthY: ah.volcanoMouthY, emergeY: ah.volcanoEmergeY, triggerRadius: 95 }
      : null;

  return {
    levelIndex: globalLevelIndex(biomeIndex, bossStage),
    biomeIndex,
    levelInBiome: bossStage,
    biome,
    name: getLevelDisplayName(biomeIndex, bossStage),
    isBossLevel: true,
    bossType: BOSS_TYPES[biomeIndex],
    bossName: BOSS_NAMES[biomeIndex],
    isFinalBoss: biomeIndex === FINAL_BIOME_INDEX,
    worldW,
    shrineX: innerRight - 70,
    gravityY: hard ? 840 : 760,
    baseJump: hard ? -600 : -640,
    hopJump: hard ? -480 : -520,
    platforms,
    spikes: [
      { x: innerLeft + 40, y: g - 6, w: 80, h: 12 },
      { x: innerRight - 120, y: g - 6, w: 80, h: 12 },
    ],
    pickups: bossPickups(g, cx),
    checkpoints: [{ x: innerLeft + 130, cpY: g - 58 }],
    moving: null,
    crumble: null,
    barrier: null,
    switch: null,
    patrol: null,
    bossVolcano: emberVolcano,
    bossSpawn: emberVolcano
      ? { x: cx, y: emberVolcano.mouthY }
      : { x: cx, y: ah.bossSpawnY },
    arena: {
      ...theme,
      innerLeft,
      innerRight,
      centerX: cx,
      bossMinY: ah.bossMinY,
      bossMaxY: ah.bossMaxY,
      volcanoMouthY: emberVolcano ? ah.volcanoMouthY : undefined,
      volcanoEmergeY: emberVolcano ? ah.volcanoEmergeY : undefined,
    },
  };
}
