import Phaser from "phaser";
import {
  BIOMES,
  FINAL_BIOME_INDEX,
  getBiomeForMapPage,
  getLevelDisplayName,
  globalLevelIndex,
  isBossLevelIndex,
  levelsInBiome,
  MAIN_BIOME_COUNT,
  MAX_LEVEL,
  SECRET_BIOME_INDEX,
  splitLevelIndex,
} from "../world/biomes.js";
import { levelMapPosition } from "../world/mapLayout.js";
import {
  getBiomeProgress,
  getClearedLevels,
  isBiomeComplete,
  isBiomeUnlocked,
  isCampaignComplete,
  isFinalBossUnlocked,
  isLevelCleared,
  isLevelUnlocked,
  isSecretWorldUnlocked,
  isTrueEndingComplete,
  resetProgress,
} from "../world/progress.js";
import {
  biomeLabelColor,
  biomeTaglineColor,
  drawBiomeFlavor,
  drawBiomeIndexBadge,
  drawBiomeMonument,
  drawBiomeRegionRing,
  drawBiomeTerritory,
  drawCampaignTrail,
  drawEpilogueMapBackdrop,
  drawEpilogueMapGuides,
  drawEpiloguePageTrail,
  drawMapBackdrop,
  drawMapGuides,
} from "../world/worldMapDecor.js";

export default class WorldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: "WorldMapScene" });
  }

  create(data = {}) {
    try {
      this._startingLevel = false;
      const { width, height } = this.scale;
      const cleared = getClearedLevels();
      const total = MAX_LEVEL;
      const hasPage2 = isSecretWorldUnlocked();
      const maxPage = hasPage2 ? 1 : 0;
      let page = typeof data.mapPage === "number" ? data.mapPage : 0;
      if (data.openEpilogue && hasPage2) page = 1;
      this.mapPage = Phaser.Math.Clamp(page, 0, maxPage);

      this.cameras.main.setBackgroundColor(this.mapPage === 0 ? 0x0a1020 : 0x08040f);

      if (this.mapPage === 0) {
        this.buildCampaignPage(cleared, data, width, height);
      } else {
        this.buildEpiloguePage(cleared, data, width, height);
      }

      this.buildSharedUi(cleared, data, width, height, hasPage2, total);
      this.createPageArrows(width, height, hasPage2);
      this.bindMapKeyboard(hasPage2);
    } catch (err) {
      console.error("WorldMapScene create failed:", err);
      this.cameras.main.setBackgroundColor(0x0a1020);
      this.add
        .text(this.scale.width / 2, this.scale.height / 2, `Map error:\n${err.message}`, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          color: "#f87171",
          align: "center",
        })
        .setOrigin(0.5);
    }
  }

  bindMapKeyboard(hasPage2) {
    const kb = this.input.keyboard;
    if (!kb) return;

    if (this._onMapKeyR) kb.off("keydown-R", this._onMapKeyR);
    if (this._onMapKeyLeft) kb.off("keydown-LEFT", this._onMapKeyLeft);
    if (this._onMapKeyRight) kb.off("keydown-RIGHT", this._onMapKeyRight);

    this._onMapKeyR = () => {
      resetProgress();
      this.scene.restart({ mapPage: 0 });
    };
    kb.on("keydown-R", this._onMapKeyR);

    if (hasPage2) {
      this._onMapKeyLeft = () => {
        if (this.mapPage > 0) this.goToPage(0);
      };
      this._onMapKeyRight = () => {
        if (this.mapPage < 1) this.goToPage(1);
      };
      kb.on("keydown-LEFT", this._onMapKeyLeft);
      kb.on("keydown-RIGHT", this._onMapKeyRight);
    } else {
      this._onMapKeyLeft = null;
      this._onMapKeyRight = null;
    }
  }

  goToPage(page) {
    this.scene.restart({ mapPage: page });
  }

  buildCampaignPage(cleared, data, width, height) {
    drawMapBackdrop(this, width, height);
    drawCampaignTrail(this, cleared);

    for (let b = 0; b < MAIN_BIOME_COUNT; b++) {
      this.createBiomeNode(b, 0);
    }

    drawMapGuides(this, width, height);
    this.addCampaignStatusLine(width, data);
  }

  buildEpiloguePage(cleared, data, width, height) {
    drawEpilogueMapBackdrop(this, width, height);
    drawEpiloguePageTrail(this);

    this.createBiomeNode(SECRET_BIOME_INDEX, 1);
    this.createBiomeNode(FINAL_BIOME_INDEX, 1);

    drawEpilogueMapGuides(this, width);
    this.addEpilogueStatusLine(width, data);
  }

  buildSharedUi(cleared, data, width, height, hasPage2, total) {
    const pageLabel = this.mapPage === 0 ? "Page 1 · Campaign" : "Page 2 · Beyond the Veil";

    this.add
      .text(width / 2, 36, "World Map", {
        fontFamily: "system-ui, Segoe UI, sans-serif",
        fontSize: "28px",
        color: "#f8fafc",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(width / 2, 62, pageLabel, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
        color: this.mapPage === 0 ? "#64748b" : "#e879f9",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(width / 2, 82, `Progress ${cleared.size}/${total}`, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: "#94a3b8",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.levelTooltip = this.add
      .text(width / 2, 148, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: "#f8fafc",
        fontStyle: "bold",
        backgroundColor: "#1e293bcc",
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(12)
      .setVisible(false);

    const footer =
      hasPage2 && this.mapPage === 0
        ? "Hover a stage · Click to play · → Page 2 · R resets"
        : hasPage2 && this.mapPage === 1
          ? "Hover a stage · Click to play · ← Page 1 · R resets"
          : "Hover a stage for its name · Click to play · R resets progress";

    this.add
      .text(width / 2, height - 8, footer, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "10px",
        color: "#475569",
      })
      .setOrigin(0.5)
      .setDepth(10);
  }

  addCampaignStatusLine(width, data) {
    let msg = null;
    let color = "#64748b";

    if (isTrueEndingComplete()) {
      msg = "True ending complete — visit Page 2 to replay the epilogue.";
      color = "#fef08a";
    } else if (isCampaignComplete() && !isSecretWorldUnlocked()) {
      msg = "Campaign complete! Find the rift on Void Crypt · Abyss Hop (high ledge).";
      color = "#fbbf24";
    } else if (isSecretWorldUnlocked() && !isFinalBossUnlocked()) {
      msg = "Secret world found — press → to open Page 2 (Eclipse Veil).";
      color = "#e879f9";
    } else if (data.justBeat !== undefined) {
      msg = "Stage cleared — follow the glowing trail to your next world";
      color = "#4ade80";
    }

    if (msg) {
      this.add
        .text(width / 2, 102, msg, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "11px",
          color,
        })
        .setOrigin(0.5)
        .setDepth(10);
    }
  }

  addEpilogueStatusLine(width, data) {
    let msg = null;
    let color = "#e879f9";

    if (isTrueEndingComplete()) {
      msg = "Every realm conquered — Primordial Warden defeated.";
      color = "#fef08a";
    } else if (isFinalBossUnlocked()) {
      msg = "Primordial Core unlocked — defeat the Warden when ready.";
      color = "#fde047";
    } else if (isSecretWorldUnlocked()) {
      msg = "Clear Eclipse Matron and the main Reef boss to unlock the Core.";
      color = "#e879f9";
    }

    if (msg) {
      this.add
        .text(width / 2, 102, msg, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "11px",
          color,
        })
        .setOrigin(0.5)
        .setDepth(10);
    } else if (data.justBeat !== undefined) {
      this.add
        .text(width / 2, 102, "Stage cleared on Page 2", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "11px",
          color: "#4ade80",
        })
        .setOrigin(0.5)
        .setDepth(10);
    }
  }

  createPageArrows(width, height, hasPage2) {
    if (!hasPage2) return;

    const cy = height / 2;
    const style = {
      fontFamily: "system-ui, Segoe UI, sans-serif",
      fontSize: "36px",
      color: "#f8fafc",
      fontStyle: "bold",
      backgroundColor: "#1e293bcc",
      padding: { x: 10, y: 4 },
    };

    if (this.mapPage === 0) {
      const next = this.add
        .text(width - 28, cy, "›", style)
        .setOrigin(0.5)
        .setDepth(20)
        .setInteractive({ useHandCursor: true });
      next.on("pointerover", () => next.setColor("#e879f9"));
      next.on("pointerout", () => next.setColor("#f8fafc"));
      next.on("pointerdown", () => this.goToPage(1));
      this.add
        .text(width - 28, cy + 36, "Page 2", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "9px",
          color: "#e879f9",
        })
        .setOrigin(0.5)
        .setDepth(20);
    } else {
      const prev = this.add
        .text(28, cy, "‹", style)
        .setOrigin(0.5)
        .setDepth(20)
        .setInteractive({ useHandCursor: true });
      prev.on("pointerover", () => prev.setColor("#5eead4"));
      prev.on("pointerout", () => prev.setColor("#f8fafc"));
      prev.on("pointerdown", () => this.goToPage(0));
      this.add
        .text(28, cy + 36, "Page 1", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "9px",
          color: "#94a3b8",
        })
        .setOrigin(0.5)
        .setDepth(20);
    }

    this.add
      .text(width / 2, height - 28, `${this.mapPage + 1} / 2`, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "10px",
        color: "#64748b",
      })
      .setOrigin(0.5)
      .setDepth(20);
  }

  showLevelTooltip(biomeIndex, levelInBiome) {
    const name = getLevelDisplayName(biomeIndex, levelInBiome);
    const biome = BIOMES[biomeIndex];
    this.levelTooltip.setText(`${biome.name} — ${name}`);
    this.levelTooltip.setColor(biomeLabelColor(biome, true));
    this.levelTooltip.setPosition(this.scale.width / 2, 148);
    this.levelTooltip.setVisible(true);
  }

  hideLevelTooltip() {
    this.levelTooltip.setVisible(false);
  }

  createBiomeNode(biomeIndex, mapPage) {
    const biome = getBiomeForMapPage(biomeIndex, mapPage);
    const unlocked = isBiomeUnlocked(biomeIndex);
    const complete = isBiomeComplete(biomeIndex);
    const progress = getBiomeProgress(biomeIndex);
    const stageCount = levelsInBiome(biomeIndex);
    const isEpilogue =
      biomeIndex === SECRET_BIOME_INDEX || biomeIndex === FINAL_BIOME_INDEX;

    if (isEpilogue && !unlocked) {
      this.createLockedEpilogueNode(biome, biomeIndex);
      return;
    }

    drawBiomeTerritory(this, biome, unlocked);
    drawBiomeFlavor(this, biomeIndex, unlocked);
    drawBiomeRegionRing(this, biome, unlocked, complete);

    const core = this.add.circle(biome.mapX, biome.mapY, 30, biome.ground, 0.95);
    core.setStrokeStyle(3, biome.mapGlow, unlocked ? 1 : 0.7);
    core.setDepth(4);

    drawBiomeMonument(this, biome, unlocked);
    const badgeLabel =
      biomeIndex === SECRET_BIOME_INDEX ? "★" : biomeIndex === FINAL_BIOME_INDEX ? "☀" : `W${biomeIndex + 1}`;
    this.add
      .text(biome.mapX - 38, biome.mapY - 38, badgeLabel, {
        fontSize: "9px",
        color: biomeLabelColor(biome, unlocked),
        fontStyle: "bold",
        backgroundColor: "#0f172acc",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(6);

    if (complete) {
      this.add
        .text(biome.mapX + 38, biome.mapY - 38, "✓", {
          fontSize: "18px",
          color: "#fbbf24",
        })
        .setOrigin(0.5)
        .setDepth(6);
    }

    this.add
      .text(biome.mapX, biome.mapY - 56, biome.name, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: biomeLabelColor(biome, unlocked),
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.add
      .text(biome.mapX, biome.mapY + 40, biome.tagline, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "8px",
        color: biomeTaglineColor(biome, unlocked),
        align: "center",
        wordWrap: { width: 120 },
      })
      .setOrigin(0.5, 0)
      .setDepth(6);

    const barW = 52;
    const barY = biome.mapY + 62;
    this.add.rectangle(biome.mapX, barY, barW, 5, biome.bg, 0.85).setDepth(5);
    if (progress > 0) {
      const fillW = (barW * progress) / stageCount;
      this.add.rectangle(biome.mapX - barW / 2 + fillW / 2, barY, fillW, 5, biome.mapGlow, 1).setDepth(5);
    }
    this.add
      .text(biome.mapX, barY + 12, `${progress}/${stageCount}`, {
        fontSize: "10px",
        color: unlocked ? "#cbd5e1" : "#475569",
      })
      .setOrigin(0.5, 0)
      .setDepth(6);

    const spokes = this.add.graphics().setDepth(2);

    for (let l = 0; l < stageCount; l++) {
      const globalIdx = globalLevelIndex(biomeIndex, l);
      const isBoss = isBossLevelIndex(globalIdx);
      const pos = levelMapPosition(biomeIndex, l, mapPage);
      const cleared = isLevelCleared(globalIdx);
      const playable = unlocked && isLevelUnlocked(globalIdx);

      spokes.lineStyle(1, biome.mapGlow, playable ? 0.28 : 0.1);
      spokes.lineBetween(biome.mapX, biome.mapY + 20, pos.x, pos.y);

      const dotColor = isBoss ? biome.spike : cleared ? biome.mapGlow : biome.platform;
      const radius = isBoss ? 11 : 9;
      const dot = this.add.circle(0, 0, radius, dotColor, cleared ? 1 : 0.6);
      dot.setStrokeStyle(2, playable ? biome.fragment : biome.mapTint, playable ? 1 : 0.4);

      const label = this.add
        .text(0, 0, isBoss ? "B" : String(l + 1), {
          fontSize: isBoss ? "11px" : "10px",
          color: playable ? (isBoss ? "#fef2f2" : "#0f172a") : "#64748b",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      const btn = this.add.container(pos.x, pos.y, [dot, label]);
      btn.setDepth(7);

      if (playable) {
        const hitR = isBoss ? 16 : 14;
        btn.setInteractive({
          hitArea: new Phaser.Geom.Circle(0, 0, hitR),
          hitAreaCallback: Phaser.Geom.Circle.Contains,
          useHandCursor: true,
        });

        btn.on("pointerover", () => {
          btn.setScale(1.15);
          this.showLevelTooltip(biomeIndex, l);
        });
        btn.on("pointerout", () => {
          btn.setScale(1);
          this.hideLevelTooltip();
        });
        btn.on("pointerup", () => this.startLevel(globalIdx));
      }
    }
  }

  createLockedEpilogueNode(biome, biomeIndex) {
    const isSecret = biomeIndex === SECRET_BIOME_INDEX;

    this.add.circle(biome.mapX, biome.mapY, 26, biome.ground, 0.45).setDepth(3);
    this.add
      .text(biome.mapX, biome.mapY - 48, isSecret ? "???" : "Primordial Core", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: "#64748b",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(6);

    const hint = isSecret
      ? "Hidden rift on Void Crypt\n· Abyss Hop (high ledge)"
      : "Beat Reef boss + Eclipse Matron";
    this.add
      .text(biome.mapX, biome.mapY + 28, hint, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "8px",
        color: "#475569",
        align: "center",
        wordWrap: { width: 130 },
      })
      .setOrigin(0.5, 0)
      .setDepth(6);
  }

  startLevel(levelIndex) {
    if (this._startingLevel) return;
    if (!isLevelUnlocked(levelIndex)) return;
    const { biomeIndex } = splitLevelIndex(levelIndex);
    if (!isBiomeUnlocked(biomeIndex)) return;

    this._startingLevel = true;
    this.hideLevelTooltip();
    this.input.enabled = false;

    const mapPage = biomeIndex >= MAIN_BIOME_COUNT ? 1 : 0;
    // Defer — calling scene.start inside a pointer handler can freeze Phaser input.
    this.time.delayedCall(0, () => {
      this.scene.start("GameScene", { levelIndex, returnMapPage: mapPage });
    });
  }
}
