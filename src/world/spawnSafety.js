import Phaser from "phaser";
import { volcanoSlopePoint } from "./emberDecor.js";

const PLAYER_W = 28;
const PLAYER_H = 74;
const PAD = 10;

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerBox(footX, footY) {
  return {
    x: footX - PLAYER_W / 2 - PAD,
    y: footY - PLAYER_H - PAD,
    w: PLAYER_W + PAD * 2,
    h: PLAYER_H + PAD * 2,
  };
}

/** Feet Y on main ground or boss arena floor. */
export function groundFootY(groundY, layout) {
  if (layout.isBossLevel) {
    return groundY - 6;
  }
  return groundY - 12;
}

/** Top of a platform (feet position). */
function platformFootY(plat) {
  return plat.y - 8;
}

function collectHazardRects(layout, groundY) {
  const rects = [];
  for (const s of layout.spikes ?? []) {
    rects.push({
      x: s.x - s.w / 2 - 6,
      y: s.y - s.h / 2 - 6,
      w: s.w + 12,
      h: s.h + 12,
    });
  }
  if (layout.patrol) {
    const p = layout.patrol;
    rects.push({
      x: p.x - p.w / 2 - 20,
      y: p.minY - 12,
      w: p.w + 40,
      h: p.maxY - p.minY + 24,
    });
  }
  if (layout.bossSpawn && !layout.bossVolcano) {
    const b = layout.bossSpawn;
    rects.push({
      x: b.x - 50,
      y: b.y - 60,
      w: 100,
      h: 80,
    });
  }
  return rects;
}

function footYOnVolcano(x, volcano) {
  const { footX, peakX } = volcano;
  if (x < footX - 40) {
    return null;
  }
  const t = Phaser.Math.Clamp((x - footX) / (peakX - footX - 40), 0, 1);
  return volcanoSlopePoint(volcano, t).y + 26;
}

/**
 * Best feet Y at x: platform top, volcano slope, or open ground.
 */
export function snapFootY(x, preferredY, layout, groundY) {
  const floor = groundFootY(groundY, layout);
  let bestY = floor;
  let bestDist = Math.abs(preferredY - floor);

  for (const p of layout.platforms ?? []) {
    if (Math.abs(x - p.x) > p.w / 2 + 18) {
      continue;
    }
    const top = platformFootY(p);
    const dist = Math.abs(preferredY - top);
    if (dist < bestDist + 8) {
      bestDist = dist;
      bestY = top;
    }
  }

  if (layout.volcano?.footX) {
    const vY = footYOnVolcano(x, layout.volcano);
    if (vY != null && Math.abs(preferredY - vY) < bestDist + 16) {
      bestY = vY;
    }
  }

  return bestY;
}

export function isSafeSpawn(footX, footY, layout, groundY) {
  const box = playerBox(footX, footY);
  for (const h of collectHazardRects(layout, groundY)) {
    if (overlaps(box, h)) {
      return false;
    }
  }
  return true;
}

/**
 * Find feet position clear of spikes, patrol lanes, and boss overlap.
 */
export function resolveSpawnPosition(layout, groundY) {
  const cp = layout.checkpoints?.[0];
  const startX = cp?.x ?? 120;
  const preferredY = cp?.cpY ?? groundY;

  const xOffsets = [0, 40, 80, 120, -40, -80, 160, 200, -120, 240, -160, 280];
  for (const dx of xOffsets) {
    const x = startX + dx;
    const y = snapFootY(x, preferredY, layout, groundY);
    if (isSafeSpawn(x, y, layout, groundY)) {
      return { x, y };
    }
  }

  for (let x = 100; x < (layout.worldW ?? 1600); x += 60) {
    const y = groundFootY(groundY, layout);
    if (isSafeSpawn(x, y, layout, groundY)) {
      return { x, y };
    }
  }

  return { x: Math.max(100, startX + 100), y: groundFootY(groundY, layout) };
}

/** Sanitize a checkpoint the player just touched. */
export function resolveCheckpointPosition(x, cpY, layout, groundY) {
  const y = snapFootY(x, cpY, layout, groundY);
  if (isSafeSpawn(x, y, layout, groundY)) {
    return { x, y };
  }
  return resolveSpawnPosition(
    { ...layout, checkpoints: [{ x, cpY: y }] },
    groundY,
  );
}
