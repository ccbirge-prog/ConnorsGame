/** World map geometry — fixed positions, no procedural scatter. */

import { BIOMES, BIOME_COUNT, getBiomeMapPosition } from "./biomes.js";

/** Campaign unlock order (same as biome index). */
export const CAMPAIGN_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
];

/** Level picker offsets relative to each biome node (arc under the monument). */
const LEVEL_ARC = [
  { dx: -50, dy: 18 },
  { dx: -26, dy: 24 },
  { dx: 0, dy: 28 },
  { dx: 26, dy: 24 },
  { dx: 50, dy: 18 },
];

const FINAL_LEVEL_ARC = [{ dx: 0, dy: 32 }];

export const MAP_LEVEL_OFFSETS = [
  ...Array.from({ length: 8 }, () => LEVEL_ARC),
  LEVEL_ARC,
  FINAL_LEVEL_ARC,
];

export function levelMapPosition(biomeIndex, levelInBiome, page = 0) {
  const pos = getBiomeMapPosition(biomeIndex, page);
  const off = MAP_LEVEL_OFFSETS[biomeIndex]?.[levelInBiome] ?? { dx: 0, dy: 30 };
  return { x: pos.mapX + off.dx, y: pos.mapY + off.dy };
}

/** Midpoint control for curved trail between two biomes. */
export function trailControlPoint(fromIndex, toIndex) {
  const a = BIOMES[fromIndex];
  const b = BIOMES[toIndex];
  if (fromIndex === 3 && toIndex === 4) {
    return { x: 400, y: 313 };
  }
  const mx = (a.mapX + b.mapX) / 2;
  const my = (a.mapY + b.mapY) / 2;
  const sameRow = Math.abs(a.mapY - b.mapY) < 50;
  return { x: mx, y: my + (sameRow ? -18 : 0) };
}

/** Mini decor offsets around each world node (from in-level biome identity). */
const FLAVOR_RING = [
  { dx: -58, dy: 6 },
  { dx: 56, dy: 8 },
  { dx: -38, dy: -30 },
  { dx: 40, dy: -28 },
  { dx: -20, dy: 36 },
  { dx: 22, dy: 34 },
];

export const MAP_FLAVOR_SPOTS = Array.from({ length: BIOME_COUNT }, () => FLAVOR_RING);

export const MAP_BIOME_TERRITORY = BIOMES.map((b) => ({
  x: b.mapX,
  y: b.mapY,
  rx: 128,
  ry: 98,
  sky: b.bg,
  glow: b.mapGlow,
  ground: b.ground,
  fragment: b.fragment,
  shrine: b.shrine,
}));

export const MAP_WAYPOINTS = CAMPAIGN_EDGES.map(([from], i) => {
  const b = BIOMES[from];
  return { x: b.mapX, y: b.mapY, index: from };
});
