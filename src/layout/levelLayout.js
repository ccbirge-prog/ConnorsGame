import { FINAL_BIOME_INDEX, isBossLevelIndex, splitLevelIndex } from "../world/biomes.js";
import { buildBossLevel } from "./bossLayouts.js";
import { buildStandardLevel } from "./levelBuilders.js";

export { MAX_LEVEL, LEVELS_PER_BIOME, FINAL_BIOME_INDEX, SECRET_BIOME_INDEX } from "../world/biomes.js";

export function buildLevelLayout(levelIndex, groundY, height, hard = false) {
  const { biomeIndex } = splitLevelIndex(levelIndex);
  if (isBossLevelIndex(levelIndex)) {
    return buildBossLevel(biomeIndex, groundY, height, hard);
  }
  return buildStandardLevel(levelIndex, groundY, height, hard);
}
