/** World-map regions — 8 main worlds + secret Eclipse Veil + final Primordial Core. */

export const LEVELS_PER_BIOME = 5;
export const MAIN_BIOME_COUNT = 8;
export const SECRET_BIOME_INDEX = 8;
export const FINAL_BIOME_INDEX = 9;
export const BIOME_COUNT = 10;

/** Global level index for the hidden rift in Void Crypt — Abyss Hop. */
export const SECRET_EXIT_LEVEL_INDEX = 33;

export const MAIN_LEVEL_COUNT = MAIN_BIOME_COUNT * LEVELS_PER_BIOME;
export const SECRET_LEVEL_START = MAIN_LEVEL_COUNT;
export const FINAL_BOSS_LEVEL_INDEX = SECRET_LEVEL_START + LEVELS_PER_BIOME;
export const MAX_LEVEL = FINAL_BOSS_LEVEL_INDEX + 1;

export const BIOMES = [
  {
    id: "ruins",
    name: "Ruin Plaza",
    tagline: "Forgotten stone & cold wind",
    mapX: 130,
    mapY: 228,
    bg: 0x081018,
    ground: 0x121c2e,
    platform: 0x1e3344,
    spike: 0xdc2626,
    spikeStroke: 0xfca5a5,
    moving: 0x64748b,
    fragment: 0x2dd4bf,
    shrine: 0xfbbf24,
    mapTint: 0x334155,
    mapGlow: 0x5eead4,
  },
  {
    id: "ember",
    name: "Ember Caverns",
    tagline: "Ash floors & molten gaps",
    mapX: 310,
    mapY: 228,
    bg: 0x140605,
    ground: 0x2a100c,
    platform: 0x451a14,
    spike: 0xea580c,
    spikeStroke: 0xfdba74,
    moving: 0x78716c,
    fragment: 0xfbbf24,
    shrine: 0xf97316,
    mapTint: 0x7c2d12,
    mapGlow: 0xfb923c,
  },
  {
    id: "frost",
    name: "Frost Hollow",
    tagline: "Ice ledges & quiet dread",
    mapX: 490,
    mapY: 228,
    bg: 0x040c14,
    ground: 0x0c1a28,
    platform: 0x1a3348,
    spike: 0x0284c7,
    spikeStroke: 0x7dd3fc,
    moving: 0x475569,
    fragment: 0x38bdf8,
    shrine: 0x67e8f9,
    mapTint: 0x164e63,
    mapGlow: 0x22d3ee,
  },
  {
    id: "bloom",
    name: "Verdant Depths",
    tagline: "Overgrown ruins & spores",
    mapX: 670,
    mapY: 228,
    bg: 0x061a0e,
    ground: 0x122a18,
    platform: 0x1a3d24,
    spike: 0x65a30d,
    spikeStroke: 0xbef264,
    moving: 0x4d7c0f,
    fragment: 0x4ade80,
    shrine: 0xa3e635,
    mapTint: 0x365314,
    mapGlow: 0x86efac,
  },
  {
    id: "storm",
    name: "Storm Peaks",
    tagline: "Static cliffs & violet gales",
    mapX: 130,
    mapY: 398,
    bg: 0x0f0a1e,
    ground: 0x1e1b4b,
    platform: 0x312e81,
    spike: 0x7c3aed,
    spikeStroke: 0xc4b5fd,
    moving: 0x6366f1,
    fragment: 0xa78bfa,
    shrine: 0xe9d5ff,
    mapTint: 0x4338ca,
    mapGlow: 0x818cf8,
  },
  {
    id: "dunes",
    name: "Sand Shifts",
    tagline: "Buried arches & sun-scorched stone",
    mapX: 310,
    mapY: 398,
    bg: 0x1c1008,
    ground: 0x3d2814,
    platform: 0x5c3d1a,
    spike: 0xb45309,
    spikeStroke: 0xfcd34d,
    moving: 0x92400e,
    fragment: 0xfbbf24,
    shrine: 0xf59e0b,
    mapTint: 0x78350f,
    mapGlow: 0xfbbf24,
  },
  {
    id: "void",
    name: "Void Crypt",
    tagline: "Whispers below the world",
    mapX: 490,
    mapY: 398,
    bg: 0x08040f,
    ground: 0x1a0a2e,
    platform: 0x2e1065,
    spike: 0x6b21a8,
    spikeStroke: 0xd8b4fe,
    moving: 0x4c1d95,
    fragment: 0xa855f7,
    shrine: 0xc084fc,
    mapTint: 0x3b0764,
    mapGlow: 0xa855f7,
    secretExitHint: "Abyss Hop hides a rift",
  },
  {
    id: "reef",
    name: "Crystal Reef",
    tagline: "Tide pools & luminous coral",
    mapX: 670,
    mapY: 398,
    bg: 0x041a1a,
    ground: 0x0c3535,
    platform: 0x115e59,
    spike: 0x0d9488,
    spikeStroke: 0x5eead4,
    moving: 0x0f766e,
    fragment: 0x2dd4bf,
    shrine: 0x67e8f9,
    mapTint: 0x134e4a,
    mapGlow: 0x2dd4bf,
  },
  {
    id: "eclipse",
    name: "Eclipse Veil",
    tagline: "A hidden realm between stars",
    mapX: 480,
    mapY: 313,
    page2MapX: 300,
    page2MapY: 320,
    isSecret: true,
    bg: 0x12081f,
    ground: 0x2d1b4e,
    platform: 0x4c1d6e,
    spike: 0xd946ef,
    spikeStroke: 0xf0abfc,
    moving: 0x7e22ce,
    fragment: 0xfbbf24,
    shrine: 0xfde047,
    mapTint: 0x581c87,
    mapGlow: 0xe879f9,
  },
  {
    id: "prime",
    name: "Primordial Core",
    tagline: "Where evolution began",
    mapX: 480,
    mapY: 118,
    page2MapX: 660,
    page2MapY: 200,
    isFinal: true,
    bg: 0x0a0612,
    ground: 0x1c1917,
    platform: 0x44403c,
    spike: 0xf43f5e,
    spikeStroke: 0xfda4af,
    moving: 0xa8a29e,
    fragment: 0xffffff,
    shrine: 0xfbbf24,
    mapTint: 0x57534e,
    mapGlow: 0xfef08a,
  },
];

const LEVEL_NAMES = [
  ["Awakening", "Spiral Towers", "Vault Gate", "Crumble Run", "Stone Warden"],
  ["Ash Walk", "Ember Stair", "Volcano Vista", "Volcano Ascent", "Cinder Wraith"],
  ["Rime Floor", "Ice Zigzag", "Frozen Hall", "Pit Crossing", "Rime Colossus"],
  ["Root Path", "Canopy Swap", "Thorn Gate", "Spore Field", "Thorn Matron"],
  ["Static Trail", "Cloud Ladder", "Bolt Bridge", "Gale Crossing", "Storm Herald"],
  ["Dune Walk", "Buried Steps", "Scarab Run", "Sunken Path", "Sand Tyrant"],
  ["Hollow Start", "Rift Walk", "Shadow Zig", "Abyss Hop", "Void Watcher"],
  ["Tide Pool", "Coral Hop", "Current Run", "Reef Spiral", "Tide Matron"],
  ["Veil Entry", "Star Bridge", "Eclipse Hall", "Twin Moons", "Eclipse Matron"],
  ["Primordial Warden"],
];

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function getBiome(biomeIndex) {
  return BIOMES[clamp(biomeIndex, 0, BIOMES.length - 1)];
}

/** Map node position — page 0 = campaign map, page 1 = epilogue map. */
export function getBiomeMapPosition(biomeIndex, page = 0) {
  const b = getBiome(biomeIndex);
  if (page === 1 && b.page2MapX != null && b.page2MapY != null) {
    return { mapX: b.page2MapX, mapY: b.page2MapY };
  }
  return { mapX: b.mapX, mapY: b.mapY };
}

/** Biome palette with map coordinates for the active map page. */
export function getBiomeForMapPage(biomeIndex, page = 0) {
  const b = getBiome(biomeIndex);
  const pos = getBiomeMapPosition(biomeIndex, page);
  return { ...b, mapX: pos.mapX, mapY: pos.mapY };
}

export function levelsInBiome(biomeIndex) {
  if (biomeIndex === FINAL_BIOME_INDEX) return 1;
  return LEVELS_PER_BIOME;
}

export function getLevelDisplayName(biomeIndex, levelInBiome) {
  const names = LEVEL_NAMES[biomeIndex] ?? LEVEL_NAMES[0];
  const max = levelsInBiome(biomeIndex) - 1;
  return names[clamp(levelInBiome, 0, max)] ?? `Stage ${levelInBiome + 1}`;
}

export function globalLevelIndex(biomeIndex, levelInBiome) {
  if (biomeIndex === FINAL_BIOME_INDEX) return FINAL_BOSS_LEVEL_INDEX;
  if (biomeIndex === SECRET_BIOME_INDEX) {
    return SECRET_LEVEL_START + clamp(levelInBiome, 0, LEVELS_PER_BIOME - 1);
  }
  return biomeIndex * LEVELS_PER_BIOME + clamp(levelInBiome, 0, LEVELS_PER_BIOME - 1);
}

export function splitLevelIndex(levelIndex) {
  const i = clamp(levelIndex, 0, MAX_LEVEL - 1);
  if (i >= FINAL_BOSS_LEVEL_INDEX) {
    return { biomeIndex: FINAL_BIOME_INDEX, levelInBiome: 0 };
  }
  if (i >= SECRET_LEVEL_START) {
    return { biomeIndex: SECRET_BIOME_INDEX, levelInBiome: i - SECRET_LEVEL_START };
  }
  return { biomeIndex: Math.floor(i / LEVELS_PER_BIOME), levelInBiome: i % LEVELS_PER_BIOME };
}

export function isBossLevelIndex(levelIndex) {
  const { biomeIndex, levelInBiome } = splitLevelIndex(levelIndex);
  if (biomeIndex === FINAL_BIOME_INDEX) return true;
  return levelInBiome === 4;
}
