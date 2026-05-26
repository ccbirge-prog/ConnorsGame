/**
 * Deterministic decoration placement (stable per slot index — not random).
 */

export function slotUnit(slot, channel = 0) {
  const n = ((slot + 1) * 374761393 + channel * 668265263) >>> 0;
  const x = (n ^ (n >>> 13)) >>> 0;
  return x / 4294967296;
}

export function slotRange(slot, min, max, channel = 0) {
  return min + slotUnit(slot, channel) * (max - min);
}

export function slotInt(slot, min, max, channel = 0) {
  return Math.round(slotRange(slot, min, max, channel));
}

/** Evenly spaced positions from xMin to xMax inclusive. */
export function fillSlots(count, xMin, xMax) {
  if (count <= 1) return [xMin];
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(xMin + ((xMax - xMin) * i) / (count - 1));
  }
  return out;
}

/** Even spacing with bounded stagger per slot (looks organic, stays predictable). */
export function staggeredSlots(count, xMin, xMax, amplitude, channel = 0) {
  return fillSlots(count, xMin, xMax).map((x, i) => {
    const t = slotUnit(i, channel) * 2 - 1;
    return x + t * amplitude;
  });
}

export function shouldPlace(slot, every, phase = 0) {
  return slot % every === phase;
}

/** Tween duration from slot — narrow band, no wild swings. */
export function slotDuration(slot, base, spread, channel = 0) {
  return base + slotInt(slot, 0, spread, channel);
}
