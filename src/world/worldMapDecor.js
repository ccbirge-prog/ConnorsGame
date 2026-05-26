/** Visual dressing for the campaign world map — colored territories + biome flavor from levels. */

import {
  BIOMES,
  FINAL_BIOME_INDEX,
  getBiomeMapPosition,
  globalLevelIndex,
  LEVELS_PER_BIOME,
  SECRET_BIOME_INDEX,
} from "./biomes.js";
import { isFinalBossUnlocked as checkFinalBossUnlocked } from "./progress.js";
import {
  CAMPAIGN_EDGES,
  MAP_BIOME_TERRITORY,
  MAP_FLAVOR_SPOTS,
  trailControlPoint,
} from "./mapLayout.js";

function hexColor(n) {
  return `#${(n & 0xffffff).toString(16).padStart(6, "0")}`;
}

function drawMonument(scene, biome, x, y, unlocked) {
  const g = scene.add.graphics();
  const a = unlocked ? 1 : 0.8;
  const glow = biome.mapGlow;
  const tint = biome.mapTint;

  switch (biome.id) {
    case "ruins": {
      g.fillStyle(tint, 0.7 * a);
      g.fillRect(-6, -28, 12, 36);
      g.fillStyle(glow, 0.5 * a);
      g.fillCircle(0, -32, 5);
      g.lineStyle(2, glow, 0.8 * a);
      g.strokeCircle(0, -18, 10);
      break;
    }
    case "ember": {
      g.fillStyle(tint, 0.75 * a);
      g.fillTriangle(0, -38, -14, 0, 14, 0);
      g.fillStyle(glow, 0.85 * a);
      g.fillTriangle(0, -28, -8, -4, 8, -4);
      break;
    }
    case "frost": {
      g.fillStyle(0xe0f2fe, 0.8 * a);
      g.fillTriangle(0, -36, -7, 0, 7, 0);
      g.fillStyle(tint, 0.6 * a);
      g.fillRect(-10, -8, 20, 12);
      break;
    }
    case "bloom": {
      g.fillStyle(tint, 0.65 * a);
      g.fillCircle(0, -8, 16);
      g.fillStyle(glow, 0.75 * a);
      for (let i = -2; i <= 2; i++) {
        g.fillCircle(i * 9, -22, 7);
        g.fillTriangle(i * 9, -28, i * 9 - 5, -14, i * 9 + 5, -14);
      }
      break;
    }
    case "storm": {
      g.fillStyle(glow, 0.9 * a);
      g.fillTriangle(0, -40, -6, -12, 6, -12);
      g.fillTriangle(2, -18, 5, 4, -1, -6);
      g.lineStyle(2, 0xc4b5fd, 0.7 * a);
      g.strokeCircle(0, -8, 14);
      break;
    }
    case "dunes": {
      g.fillStyle(tint, 0.7 * a);
      g.fillTriangle(-22, 0, 0, -32, 22, 0);
      g.fillStyle(glow, 0.55 * a);
      g.fillTriangle(-14, 0, 0, -20, 14, 0);
      break;
    }
    case "void": {
      g.fillStyle(tint, 0.8 * a);
      g.fillCircle(0, -12, 22);
      g.fillStyle(0x1a0a2e, 0.95 * a);
      g.fillCircle(-8, -14, 4);
      g.fillCircle(8, -14, 4);
      g.lineStyle(2, glow, 0.75 * a);
      g.strokeCircle(0, -12, 24);
      break;
    }
    case "eclipse": {
      g.fillStyle(tint, 0.75 * a);
      g.fillCircle(0, -12, 26);
      g.fillStyle(glow, 0.85 * a);
      g.fillCircle(-12, -16, 12);
      g.fillCircle(14, -14, 10);
      g.fillStyle(0xfbbf24, 0.9 * a);
      g.fillCircle(0, -14, 6);
      break;
    }
    case "prime": {
      g.fillStyle(tint, 0.8 * a);
      g.fillRect(-28, -8, 56, 40);
      g.fillStyle(0xfef08a, 0.95 * a);
      g.fillRect(-12, -32, 24, 16);
      g.fillStyle(0xfbbf24, 0.9 * a);
      g.fillTriangle(0, -48, -10, -24, 10, -24);
      break;
    }
    case "reef": {
      g.fillStyle(tint, 0.7 * a);
      g.fillCircle(0, 2, 14);
      g.fillStyle(glow, 0.8 * a);
      g.fillTriangle(0, -34, -12, -6, 12, -6);
      for (let i = -2; i <= 2; i++) {
        g.fillStyle(0xf472b6, 0.5 * a);
        g.fillTriangle(i * 10, 2, i * 10 + 4, 18, i * 10 - 4, 18);
      }
      break;
    }
    default:
      g.fillStyle(tint, 0.6 * a);
      g.fillCircle(0, -10, 18);
  }

  g.setPosition(x, y - 6);
  g.setDepth(5);
  return g;
}

/** Full-bleed colored map — overlapping biome fields cover the canvas. */
function drawColorField(scene, width, height) {
  scene.add.rectangle(width / 2, 188, width, 210, 0x0c4a6e, 0.35).setDepth(0);
  scene.add.rectangle(width / 2, 358, width, 210, 0x2e1065, 0.32).setDepth(0);

  for (const t of MAP_BIOME_TERRITORY) {
    scene.add.ellipse(t.x, t.y, t.rx + 36, t.ry + 28, t.sky, 0.72).setDepth(0);
    scene.add.ellipse(t.x, t.y, t.rx + 8, t.ry + 4, t.ground, 0.58).setDepth(0);
    scene.add.ellipse(t.x, t.y + 12, t.rx * 0.9, t.ry * 0.55, t.glow, 0.45).setDepth(0);
    scene.add.ellipse(t.x, t.y - 6, 36, 24, t.fragment, 0.4).setDepth(0);
  }

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const i = row * 4 + col;
      const j = i + 1;
      const a = BIOMES[i];
      const b = BIOMES[j];
      const mx = (a.mapX + b.mapX) / 2;
      const my = (a.mapY + b.mapY) / 2;
      scene.add.ellipse(mx, my, 100, 75, a.mapGlow, 0.32).setDepth(0);
      scene.add.ellipse(mx, my, 80, 60, b.ground, 0.28).setDepth(0);
    }
  }

  scene.add.ellipse(400, 313, 140, 90, BIOMES[3].mapGlow, 0.28).setDepth(0);
  scene.add.ellipse(400, 313, 110, 70, BIOMES[4].ground, 0.25).setDepth(0);
}

/** Colored territory wash under each world (uses level palette). */
export function drawBiomeTerritory(scene, biome, unlocked) {
  const t = MAP_BIOME_TERRITORY.find((entry) => entry.sky === biome.bg);
  if (!t) return;

  const boost = unlocked ? 1 : 0.82;

  scene.add.ellipse(t.x, t.y, t.rx * 0.85, t.ry * 0.85, t.sky, 0.45 * boost).setDepth(1);
  scene.add.ellipse(t.x, t.y, t.rx * 0.6, t.ry * 0.58, t.glow, 0.38 * boost).setDepth(1);
  scene.add.ellipse(t.x, t.y + 16, t.rx * 0.7, t.ry * 0.38, t.ground, 0.5 * boost).setDepth(1);
  scene.add.ellipse(t.x, t.y - 6, 32, 20, t.fragment, 0.42 * boost).setDepth(2);
}

/** Small props from each world's in-game decor language. */
export function drawBiomeFlavor(scene, biomeIndex, unlocked) {
  const biome = BIOMES[biomeIndex];
  const spots = MAP_FLAVOR_SPOTS[biomeIndex] ?? [];
  const a = unlocked ? 1 : 0.72;
  const depth = 2;

  for (let i = 0; i < spots.length; i++) {
    const { dx, dy } = spots[i];
    const x = biome.mapX + dx;
    const y = biome.mapY + dy;
    const g = scene.add.graphics().setDepth(depth);

    switch (biome.id) {
      case "ruins": {
        if (i % 2 === 0) {
          scene.add.ellipse(x, y, 22, 8, 0x0e7490, 0.5 * a).setDepth(depth);
          scene.add.ellipse(x, y - 2, 14, 4, biome.fragment, 0.65 * a).setDepth(depth);
        } else {
          g.fillStyle(biome.mapTint, 0.55 * a);
          g.fillRect(-3, -14, 6, 18);
          g.lineStyle(1, biome.mapGlow, 0.8 * a);
          g.strokeCircle(0, -16, 6);
        }
        break;
      }
      case "ember": {
        scene.add.ellipse(x, y, 20, 7, 0x7c2d12, 0.55 * a).setDepth(depth);
        scene.add.ellipse(x, y - 1, 12, 4, 0xea580c, 0.7 * a).setDepth(depth);
        g.fillStyle(biome.mapGlow, 0.8 * a);
        g.fillTriangle(0, -12, -5, 0, 5, 0);
        break;
      }
      case "frost": {
        g.fillStyle(0xe0f2fe, 0.75 * a);
        g.fillTriangle(0, -16, -4, 0, 4, 0);
        scene.add.ellipse(x, y + 6, 18, 6, 0xe2e8f0, 0.4 * a).setDepth(depth);
        break;
      }
      case "bloom": {
        scene.add.ellipse(x, y + 4, 16, 9, biome.ground, 0.55 * a).setDepth(depth);
        g.fillStyle(biome.mapGlow, 0.7 * a);
        g.fillCircle(0, -6, 6);
        g.fillStyle(0xf472b6, 0.5 * a);
        g.fillTriangle(-6, -10, 0, -18, 6, -10);
        break;
      }
      case "storm": {
        scene.add.ellipse(x, y - 6, 28, 12, 0x4338ca, 0.35 * a).setDepth(depth);
        g.fillStyle(0xe9d5ff, 0.85 * a);
        g.fillTriangle(0, -14, -2, 0, 2, 0);
        g.fillTriangle(1, -6, 3, 4, 0, 2);
        break;
      }
      case "dunes": {
        scene.add.ellipse(x, y + 4, 26, 9, 0xd97706, 0.45 * a).setDepth(depth);
        g.fillStyle(biome.mapTint, 0.65 * a);
        g.fillTriangle(-10, 0, 0, -14, 10, 0);
        break;
      }
      case "void": {
        scene.add.ellipse(x, y, 8, 22, 0x4c1d95, 0.35 * a).setDepth(depth);
        g.lineStyle(2, biome.mapGlow, 0.65 * a);
        g.strokeCircle(0, 0, 10);
        g.fillStyle(0x1a0a2e, 0.9 * a);
        g.fillCircle(-3, -1, 2);
        g.fillCircle(3, -1, 2);
        break;
      }
      case "reef": {
        scene.add.ellipse(x, y + 3, 24, 8, 0x042f2e, 0.5 * a).setDepth(depth);
        scene.add.ellipse(x, y, 16, 5, biome.fragment, 0.55 * a).setDepth(depth);
        g.fillStyle(0xf472b6, 0.55 * a);
        g.fillTriangle(-5, 0, 0, -12, 5, 0);
        g.lineStyle(2, 0x0f766e, 0.6 * a);
        g.lineBetween(0, 4, 0, 14);
        break;
      }
      case "eclipse": {
        scene.add.ellipse(x, y, 20, 8, 0x581c87, 0.45 * a).setDepth(depth);
        g.fillStyle(biome.mapGlow, 0.8 * a);
        g.fillCircle(0, -8, 8);
        break;
      }
      case "prime": {
        g.fillStyle(0x57534e, 0.7 * a);
        g.fillRect(-8, -10, 16, 14);
        g.fillStyle(0xfbbf24, 0.85 * a);
        g.fillRect(-4, -6, 8, 6);
        break;
      }
      default:
        break;
    }
    g.setPosition(x, y);
  }
}

export function drawMapBackdrop(scene, width, height) {
  scene.add.rectangle(width / 2, height / 2, width, height, 0x0a1020, 1).setDepth(0);
  drawColorField(scene, width, height);

  const grid = scene.add.graphics().setDepth(0);
  grid.lineStyle(1, 0xffffff, 0.06);
  for (let x = 40; x < width; x += 48) {
    grid.lineBetween(x, 100, x, height - 40);
  }
  for (let y = 100; y < height - 40; y += 48) {
    grid.lineBetween(40, y, width - 40, y);
  }

  const compass = scene.add.graphics().setDepth(3);
  compass.lineStyle(2, 0x5eead4, 0.7);
  compass.lineBetween(width - 52, 118, width - 52, 148);
  compass.lineBetween(width - 67, 133, width - 37, 133);
  compass.fillStyle(0x67e8f9, 0.95);
  compass.fillTriangle(width - 52, 112, width - 56, 122, width - 48, 122);
  scene.add
    .text(width - 52, 156, "N", { fontSize: "10px", color: "#5eead4", fontStyle: "bold" })
    .setOrigin(0.5)
    .setDepth(3);

  const starColors = [0x5eead4, 0xfb923c, 0x22d3ee, 0xa855f7, 0xfbbf24];
  for (let i = 0; i < 32; i++) {
    const sx = 50 + (i * 41) % (width - 100);
    const sy = 105 + ((i * 47) % 320);
    scene.add.circle(sx, sy, 1 + (i % 2), starColors[i % starColors.length], 0.45).setDepth(1);
  }

  scene.add
    .text(52, height - 48, "Evolution Trail", {
      fontSize: "11px",
      color: "#5eead4",
      fontStyle: "italic",
    })
    .setDepth(3);
}

/** Page 2 backdrop — star veil between Eclipse Veil and Primordial Core. */
export function drawEpilogueMapBackdrop(scene, width, height) {
  scene.add.rectangle(width / 2, height / 2, width, height, 0x08040f, 1).setDepth(0);

  const eclipse = BIOMES[SECRET_BIOME_INDEX];
  const prime = BIOMES[FINAL_BIOME_INDEX];
  const ePos = getBiomeMapPosition(SECRET_BIOME_INDEX, 1);
  const pPos = getBiomeMapPosition(FINAL_BIOME_INDEX, 1);

  scene.add.ellipse(width / 2, height / 2, width * 0.9, height * 0.75, 0x2e1065, 0.4).setDepth(0);
  scene.add.ellipse(ePos.mapX, ePos.mapY, 200, 140, eclipse.mapGlow, 0.35).setDepth(0);
  scene.add.ellipse(pPos.mapX, pPos.mapY, 180, 120, prime.mapGlow, 0.28).setDepth(0);

  const grid = scene.add.graphics().setDepth(0);
  grid.lineStyle(1, 0xe879f9, 0.05);
  for (let x = 40; x < width; x += 48) {
    grid.lineBetween(x, 100, x, height - 40);
  }
  for (let y = 100; y < height - 40; y += 48) {
    grid.lineBetween(40, y, width - 40, y);
  }

  for (let i = 0; i < 48; i++) {
    const sx = 30 + (i * 37) % (width - 60);
    const sy = 90 + ((i * 53) % 360);
    scene.add.circle(sx, sy, 1 + (i % 2), i % 3 === 0 ? 0xfbbf24 : 0xe879f9, 0.5).setDepth(1);
  }

  scene.add
    .text(width / 2, height - 48, "Beyond the Veil", {
      fontSize: "11px",
      color: "#e879f9",
      fontStyle: "italic",
    })
    .setDepth(3);
}

/** Trail on epilogue map page between secret world and final boss. */
export function drawEpiloguePageTrail(scene) {
  const g = scene.add.graphics().setDepth(3);
  const glow = scene.add.graphics().setDepth(2);
  const secret = BIOMES[SECRET_BIOME_INDEX];
  const final = BIOMES[FINAL_BIOME_INDEX];
  const a = getBiomeMapPosition(SECRET_BIOME_INDEX, 1);
  const b = getBiomeMapPosition(FINAL_BIOME_INDEX, 1);
  const c = { x: (a.mapX + b.mapX) / 2, y: (a.mapY + b.mapY) / 2 - 40 };
  const active = checkFinalBossUnlocked();

  glow.lineStyle(10, secret.mapGlow, active ? 0.22 : 0.1);
  glow.lineBetween(a.mapX, a.mapY, c.x, c.y);
  glow.lineStyle(10, final.mapGlow, active ? 0.2 : 0.08);
  glow.lineBetween(c.x, c.y, b.mapX, b.mapY);

  g.lineStyle(3, secret.mapGlow, 0.85);
  g.lineBetween(a.mapX, a.mapY, c.x, c.y);
  g.lineStyle(3, final.mapGlow, active ? 0.9 : 0.35);
  g.lineBetween(c.x, c.y, b.mapX, b.mapY);

  scene.add.circle(c.x, c.y, 6, active ? final.mapGlow : 0x581c87, active ? 0.8 : 0.4).setDepth(3);
}

export function drawCampaignTrail(scene, clearedLevels) {
  const trail = scene.add.graphics().setDepth(3);
  const glow = scene.add.graphics().setDepth(2);

  for (const [from, to] of CAMPAIGN_EDGES) {
    const a = BIOMES[from];
    const b = BIOMES[to];
    const c = trailControlPoint(from, to);
    const lastCleared = clearedLevels.has(globalLevelIndex(from, LEVELS_PER_BIOME - 1));
    const active = lastCleared || from === 0;

    const colorA = a.mapGlow;
    const colorB = b.mapGlow;

    glow.lineStyle(8, colorA, active ? 0.2 : 0.06);
    glow.lineBetween(a.mapX, a.mapY, c.x, c.y);
    glow.lineStyle(8, colorB, active ? 0.18 : 0.05);
    glow.lineBetween(c.x, c.y, b.mapX, b.mapY);

    trail.lineStyle(3, colorA, active ? 0.9 : 0.25);
    trail.lineBetween(a.mapX, a.mapY, c.x, c.y);
    trail.lineStyle(3, colorB, active ? 0.85 : 0.22);
    trail.lineBetween(c.x, c.y, b.mapX, b.mapY);

    const midX = (a.mapX + c.x + b.mapX) / 3;
    const midY = (a.mapY + c.y + b.mapY) / 3;
    scene.add.circle(midX, midY, 5, active ? colorB : 0x334155, active ? 0.75 : 0.25).setDepth(3);
    if (active) {
      scene.add.circle(midX, midY, 9, colorA, 0.15).setDepth(2);
    }
  }
}

export function drawBiomeRegionRing(scene, biome, unlocked, complete) {
  scene.add.circle(biome.mapX, biome.mapY, 62, biome.bg, 0.5).setDepth(2);
  const ring = scene.add.circle(biome.mapX, biome.mapY, 58, biome.mapGlow, unlocked ? 0.35 : 0.22);
  ring.setDepth(3);
  scene.add.circle(biome.mapX, biome.mapY, 52, biome.mapTint, 0.28).setDepth(3);
  if (complete) {
    scene.add.circle(biome.mapX, biome.mapY, 72, 0xfbbf24, 0.2).setDepth(3);
    scene.add.circle(biome.mapX, biome.mapY, 76, biome.shrine, 0.08).setDepth(2);
  }
  return ring;
}

export function drawBiomeMonument(scene, biome, unlocked) {
  return drawMonument(scene, biome, biome.mapX, biome.mapY, unlocked);
}

export function drawBiomeIndexBadge(scene, biomeIndex, x, y, biome) {
  scene.add
    .text(x, y, `W${biomeIndex + 1}`, {
      fontSize: "9px",
      color: hexColor(biome.mapGlow),
      fontStyle: "bold",
      backgroundColor: "#0f172acc",
      padding: { x: 4, y: 2 },
    })
    .setOrigin(0.5)
    .setDepth(6);
}

export function biomeLabelColor(biome, unlocked) {
  return hexColor(biome.mapGlow);
}

export function biomeTaglineColor(biome, unlocked) {
  return hexColor(biome.fragment);
}

/** Row guides + all-world legend so every biome is identifiable. */
export function drawMapGuides(scene, width, height) {
  scene.add
    .text(48, 200, "← Worlds 1–4", { fontSize: "10px", color: "#e2e8f0", fontStyle: "bold" })
    .setDepth(3);
  scene.add
    .text(48, 370, "← Worlds 5–8", { fontSize: "10px", color: "#e2e8f0", fontStyle: "bold" })
    .setDepth(3);
  let x = 52;
  const rowY = 468;
  for (let i = 0; i < 8; i++) {
    const b = BIOMES[i];
    scene.add.circle(x, rowY, 5, b.mapGlow, 1).setDepth(9);
    scene.add
      .text(x + 10, rowY, `W${i + 1} · ${b.name}`, {
        fontSize: "8px",
        color: hexColor(b.mapGlow),
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setDepth(9);
    x += i < 4 ? 118 : 130;
  }
}

/** Guides for epilogue map page (page 2). */
export function drawEpilogueMapGuides(scene, width) {
  scene.add
    .text(48, 200, "★ Eclipse Veil", { fontSize: "10px", color: "#e879f9", fontStyle: "bold" })
    .setDepth(3);
  scene.add
    .text(width - 168, 168, "☀ Primordial Core →", {
      fontSize: "10px",
      color: "#fef08a",
      fontStyle: "bold",
    })
    .setDepth(3);
}
