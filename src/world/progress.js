import {
  BIOME_COUNT,
  FINAL_BIOME_INDEX,
  FINAL_BOSS_LEVEL_INDEX,
  globalLevelIndex,
  isBossLevelIndex,
  LEVELS_PER_BIOME,
  MAIN_BIOME_COUNT,
  MAIN_LEVEL_COUNT,
  MAX_LEVEL,
  SECRET_BIOME_INDEX,
  SECRET_LEVEL_START,
  splitLevelIndex,
} from "./biomes.js";

const STORAGE_KEY = "evolution3d_progress_v2";

function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem("evolution3d_progress_v1");
      if (legacy) {
        const data = JSON.parse(legacy);
        return { cleared: Array.isArray(data.cleared) ? data.cleared : [], secretUnlocked: false };
      }
      return { cleared: [], secretUnlocked: false };
    }
    const data = JSON.parse(raw);
    return {
      cleared: Array.isArray(data.cleared) ? data.cleared : [],
      secretUnlocked: !!data.secretUnlocked,
    };
  } catch {
    return { cleared: [], secretUnlocked: false };
  }
}

function saveRaw(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

export function getClearedLevels() {
  return new Set(loadRaw().cleared);
}

export function isSecretWorldUnlocked() {
  return loadRaw().secretUnlocked;
}

export function unlockSecretWorld() {
  const data = loadRaw();
  if (!data.secretUnlocked) {
    data.secretUnlocked = true;
    saveRaw(data);
    return true;
  }
  return false;
}

export function isLevelCleared(levelIndex) {
  return getClearedLevels().has(levelIndex);
}

export function markLevelCleared(levelIndex) {
  const data = loadRaw();
  if (!data.cleared.includes(levelIndex)) {
    data.cleared.push(levelIndex);
    data.cleared.sort((a, b) => a - b);
    saveRaw(data);
  }
}

export function isLevelUnlocked(levelIndex) {
  const { biomeIndex, levelInBiome } = splitLevelIndex(levelIndex);

  if (biomeIndex === FINAL_BIOME_INDEX) {
    return isFinalBossUnlocked();
  }

  if (biomeIndex === SECRET_BIOME_INDEX) {
    if (!isSecretWorldUnlocked()) return false;
    if (levelInBiome === 0) return true;
    return isLevelCleared(levelIndex - 1);
  }

  if (levelIndex <= 0) return true;
  return isLevelCleared(levelIndex - 1);
}

export function isBiomeUnlocked(biomeIndex) {
  if (biomeIndex === SECRET_BIOME_INDEX) return isSecretWorldUnlocked();
  if (biomeIndex === FINAL_BIOME_INDEX) return isFinalBossUnlocked();
  if (biomeIndex <= 0) return true;
  const lastOfPrev = globalLevelIndex(biomeIndex - 1, LEVELS_PER_BIOME - 1);
  return isLevelCleared(lastOfPrev);
}

export function getBiomeProgress(biomeIndex) {
  const cleared = getClearedLevels();
  const count = levelsInBiomeForProgress(biomeIndex);
  let n = 0;
  for (let i = 0; i < count; i++) {
    const idx =
      biomeIndex === FINAL_BIOME_INDEX
        ? FINAL_BOSS_LEVEL_INDEX
        : biomeIndex === SECRET_BIOME_INDEX
          ? SECRET_LEVEL_START + i
          : biomeIndex * LEVELS_PER_BIOME + i;
    if (cleared.has(idx)) n += 1;
  }
  return n;
}

function levelsInBiomeForProgress(biomeIndex) {
  if (biomeIndex === FINAL_BIOME_INDEX) return 1;
  return LEVELS_PER_BIOME;
}

export function isBiomeComplete(biomeIndex) {
  return getBiomeProgress(biomeIndex) >= levelsInBiomeForProgress(biomeIndex);
}

export function getNextPlayableInBiome(biomeIndex) {
  const count = levelsInBiomeForProgress(biomeIndex);
  for (let i = 0; i < count; i++) {
    const idx =
      biomeIndex === FINAL_BIOME_INDEX
        ? FINAL_BOSS_LEVEL_INDEX
        : biomeIndex === SECRET_BIOME_INDEX
          ? SECRET_LEVEL_START + i
          : globalLevelIndex(biomeIndex, i);
    if (!isLevelCleared(idx) && isLevelUnlocked(idx)) return idx;
  }
  return biomeIndex === FINAL_BIOME_INDEX
    ? FINAL_BOSS_LEVEL_INDEX
    : biomeIndex === SECRET_BIOME_INDEX
      ? SECRET_LEVEL_START
      : globalLevelIndex(biomeIndex, 0);
}

export function resetProgress() {
  saveRaw({ cleared: [], secretUnlocked: false });
}

export function countClearedTotal() {
  return getClearedLevels().size;
}

/** Main eight worlds cleared (Reef boss). */
export function isCampaignComplete() {
  return isLevelCleared(globalLevelIndex(MAIN_BIOME_COUNT - 1, LEVELS_PER_BIOME - 1));
}

export function isSecretBiomeComplete() {
  return isLevelCleared(SECRET_LEVEL_START + LEVELS_PER_BIOME - 1);
}

export function isFinalBossUnlocked() {
  return isCampaignComplete() && isSecretBiomeComplete();
}

/** Secret + main campaign + final boss defeated. */
export function isTrueEndingComplete() {
  return isLevelCleared(FINAL_BOSS_LEVEL_INDEX);
}

export { BIOME_COUNT, MAX_LEVEL, MAIN_BIOME_COUNT, SECRET_BIOME_INDEX, FINAL_BIOME_INDEX };
