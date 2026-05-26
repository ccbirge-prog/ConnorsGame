/** MVP body-part chain (same story as the 3D prototype). */
export const UNLOCK_ORDER = [
  "spine",
  "torso",
  "arms",
  "hands",
  "legs",
  "feet",
  "eyes",
  "heart",
];

export const PART_META = {
  spine: { label: "Spine", lore: "Balance returns. The world stops spinning." },
  torso: { label: "Torso", lore: "A core. Weight. Purpose." },
  arms: { label: "Arms", lore: "Reach. Pull. Strike." },
  hands: { label: "Hands", lore: "Grip. Craft. Remember how to hold." },
  legs: { label: "Legs", lore: "Stand. Run. Leave the ground behind." },
  feet: { label: "Feet", lore: "Wall. Dash. Momentum becomes language." },
  eyes: { label: "Eyes", lore: "See what was hidden." },
  heart: { label: "Heart", lore: "Rage. Regeneration. The shrine stirs." },
};

/** Light penalties — small body stays agile; hazards stay the real threat. */
export function getEvolutionStats(collected) {
  let moveMult = 1;
  let jumpMult = 1.08;
  let extraHp = 0;
  if (collected.has("torso")) moveMult *= 0.97;
  if (collected.has("arms")) jumpMult *= 1.02;
  if (collected.has("legs")) {
    moveMult *= 1.1;
    jumpMult *= 1.05;
  }
  if (collected.has("feet")) jumpMult *= 1.15;
  if (collected.has("heart")) {
    extraHp = 1;
    moveMult *= 1.04;
  }
  return { moveMult, jumpMult, extraHp };
}
