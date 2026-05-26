import Phaser from "phaser";
import { readDebugFlags } from "../debug.js";
import Boss from "../entities/Boss.js";
import StickFigure, { STAGE } from "../entities/StickFigure.js";
import { buildLevelLayout, MAX_LEVEL } from "../layout/levelLayout.js";
import { levelsInBiome } from "../world/biomes.js";
import { getEvolutionStats, PART_META, UNLOCK_ORDER } from "../progression.js";
import { createBossArena } from "../world/createBossArena.js";
import {
  createClimbableVolcano,
  createDistantVolcano,
  createEmberArenaVolcano,
  createEmberBossVolcano,
  createEmberVolcano,
  playVolcanoEruption,
} from "../world/emberDecor.js";
import { createFrostArenaDetails, createFrostDetails } from "../world/frostDecor.js";
import {
  resolveCheckpointPosition,
  resolveSpawnPosition,
} from "../world/spawnSafety.js";
import {
  createDuneArenaDetails,
  createDuneDetails,
  createEclipseArenaDetails,
  createEclipseDetails,
  createPrimeArenaDetails,
  createReefArenaDetails,
  createReefDetails,
  createStormArenaDetails,
  createStormDetails,
  createVoidArenaDetails,
  createVoidDetails,
} from "../world/extraBiomeDecor.js";
import { createRuinArenaFeatures, createRuinFeatures } from "../world/ruinDecor.js";
import { createVerdantArenaGreenery, createVerdantGreenery } from "../world/verdantDecor.js";
import {
  isCampaignComplete,
  isFinalBossUnlocked,
  isSecretBiomeComplete,
  isSecretWorldUnlocked,
  isTrueEndingComplete,
  markLevelCleared,
  unlockSecretWorld,
} from "../world/progress.js";

const ORB_COLORS = {
  eyes: 0x22d3ee,
  heart: 0xfb7185,
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  createPickup(x, y, id) {
    const color = ORB_COLORS[id] ?? this.biome?.fragment ?? 0x2dd4bf;
    const container = this.add.container(x, y);
    const glow = this.add.circle(0, 0, 26, color, 0.18);
    const ring = this.add.circle(0, 0, 18, 0x000000, 0);
    ring.setStrokeStyle(3, color, 1);
    const core = this.add.star(0, 0, 6, 14, 7, color, 1);
    core.setStrokeStyle(2, 0xffffff, 0.9);
    container.add([glow, ring, core]);
    container.setData("partId", id);
    container.setData("color", color);
    container.setData("glow", glow);
    container.setData("ring", ring);
    container.setDepth(this.layout?.volcanoColliders ? 14 : 5);

    this.tweens.add({
      targets: glow,
      scale: 1.2,
      alpha: 0.28,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });
    this.tweens.add({
      targets: core,
      angle: 360,
      duration: 8000,
      repeat: -1,
    });

    return container;
  }

  init(data = {}) {
    this.launchData = data;
  }

  create() {
    const data = this.launchData ?? this.sys.settings?.data ?? {};
    const { width, height } = this.scale;
    const groundY = height - 48;
    this.groundY = groundY;

    const flags = readDebugFlags();
    this.hardMode = flags.hard;
    this.returnMapPage =
      typeof data.returnMapPage === "number" ? data.returnMapPage : 0;
    this.openEpilogueOnMap = false;
    this.levelIndex = this.parseLevelIndex(data);
    this.layout = buildLevelLayout(this.levelIndex, groundY, height, this.hardMode);
    if (!this.layout?.biome) {
      throw new Error(`No layout for level ${this.levelIndex + 1}`);
    }
    this.biome = this.layout.biome;
    const { worldW, shrineX } = this.layout;

    this.cameras.main.setBackgroundColor(this.biome.bg);

    if (this.biome.id === "ruins" && !this.layout.isBossLevel) {
      createRuinFeatures(this, worldW, groundY, height, {
        platforms: this.layout.platforms,
      });
    }
    if (this.biome.id === "ember" && !this.layout.isBossLevel) {
      const emberOpts = {
        platforms: this.layout.platforms,
        xMax:
          this.layout.emberVolcano === "climb" && this.layout.volcano
            ? this.layout.volcano.footX - 60
            : undefined,
      };
      createEmberVolcano(this, worldW, groundY, height, emberOpts);
      if (this.layout.emberVolcano === "distant") {
        createDistantVolcano(this, worldW, groundY, height, this.layout.volcano);
      }
      if (this.layout.emberVolcano === "climb") {
        createClimbableVolcano(this, worldW, groundY, height, this.layout.volcano);
      }
    }
    if (this.biome.id === "frost" && !this.layout.isBossLevel) {
      createFrostDetails(this, worldW, groundY, height, {
        platforms: this.layout.platforms,
      });
    }
    if (this.biome.id === "bloom" && !this.layout.isBossLevel) {
      createVerdantGreenery(this, worldW, groundY, height, {
        platforms: this.layout.platforms,
      });
    }
    if (this.biome.id === "storm" && !this.layout.isBossLevel) {
      createStormDetails(this, worldW, groundY, height, {
        platforms: this.layout.platforms,
      });
    }
    if (this.biome.id === "dunes" && !this.layout.isBossLevel) {
      createDuneDetails(this, worldW, groundY, height, {
        platforms: this.layout.platforms,
      });
    }
    if (this.biome.id === "void" && !this.layout.isBossLevel) {
      createVoidDetails(this, worldW, groundY, height, {
        platforms: this.layout.platforms,
      });
    }
    if (this.biome.id === "reef" && !this.layout.isBossLevel) {
      createReefDetails(this, worldW, groundY, height, {
        platforms: this.layout.platforms,
      });
    }
    if (this.biome.id === "eclipse" && !this.layout.isBossLevel) {
      createEclipseDetails(this, worldW, groundY, height, {
        platforms: this.layout.platforms,
      });
    }

    this.physics.world.setBounds(0, 0, worldW, height);
    this.physics.world.gravity.y = this.layout.gravityY;
    this.physics.world.TILE_BIAS = 8;

    this.arenaWalls = null;
    let ground;
    if (this.layout.isBossLevel && this.layout.arena) {
      const arenaBuild = createBossArena(this, this.layout, this.biome, groundY, height);
      this.arenaWalls = arenaBuild.wallGroup;
      const f = arenaBuild.arenaFloor;
      ground = this.add.rectangle(f.x, f.y, f.w, f.h, this.layout.arena.ringColor, 1);
      ground.setStrokeStyle(2, this.layout.arena.ringAccent, 1);
    } else {
      ground = this.add.rectangle(worldW / 2, groundY + 24, worldW + 200, 64, this.biome.ground);
      if (this.biome.id === "ruins") {
        this.add.ellipse(worldW / 2, groundY + 8, worldW + 80, 20, 0x0e7490, 0.35).setDepth(1);
        for (let x = 80; x < worldW; x += 100) {
          this.add.ellipse(x, groundY + 4, 40, 10, 0x22d3ee, 0.25).setDepth(1);
        }
      }
      if (this.biome.id === "ember") {
        this.add.ellipse(worldW / 2, groundY + 10, worldW + 100, 26, 0x7c2d12, 0.4).setDepth(1);
        for (let x = 90; x < worldW; x += 110) {
          this.add.ellipse(x, groundY + 5, 44, 12, 0xea580c, 0.3).setDepth(1);
        }
      }
      if (this.biome.id === "frost") {
        this.add.ellipse(worldW / 2, groundY + 9, worldW + 100, 24, 0xe2e8f0, 0.3).setDepth(1);
        for (let x = 85; x < worldW; x += 105) {
          this.add.ellipse(x, groundY + 4, 42, 11, 0xbae6fd, 0.28).setDepth(1);
        }
      }
      if (this.biome.id === "bloom") {
        this.add.ellipse(worldW / 2, groundY + 10, worldW + 100, 28, 0x14532d, 0.45).setDepth(1);
        for (let x = 100; x < worldW; x += 120) {
          this.add.ellipse(x, groundY + 6, 50, 16, 0x166534, 0.35).setDepth(1);
        }
      }
      if (this.biome.id === "storm") {
        this.add.ellipse(worldW / 2, groundY + 9, worldW + 100, 24, 0x312e81, 0.4).setDepth(1);
        for (let i = 0, x = 90; x < worldW; x += 115, i++) {
          this.add.ellipse(x, groundY + 5, 44, 12, 0x6366f1, 0.28).setDepth(1);
          if (i % 2 === 0) this.add.ellipse(x + 30, groundY + 2, 8, 4, 0xc4b5fd, 0.35).setDepth(2);
        }
      }
      if (this.biome.id === "dunes") {
        this.add.ellipse(worldW / 2, groundY + 10, worldW + 100, 28, 0x78350f, 0.45).setDepth(1);
        for (let x = 95; x < worldW; x += 118) {
          this.add.ellipse(x, groundY + 6, 48, 14, 0xd97706, 0.32).setDepth(1);
          this.add.rectangle(x - 20, groundY + 3, 36, 3, 0xfbbf24, 0.2).setDepth(2);
        }
      }
      if (this.biome.id === "void") {
        this.add.ellipse(worldW / 2, groundY + 9, worldW + 100, 24, 0x2e1065, 0.38).setDepth(1);
        for (let i = 0, x = 88; x < worldW; x += 112, i++) {
          this.add.ellipse(x, groundY + 5, 42, 11, 0x7c3aed, 0.26).setDepth(1);
          if (i % 2 === 1) this.add.rectangle(x, groundY + 1, 2, 14, 0x1a0a2e, 0.5).setDepth(2);
        }
      }
      if (this.biome.id === "reef") {
        this.add.ellipse(worldW / 2, groundY + 10, worldW + 100, 28, 0x0f766e, 0.42).setDepth(1);
        for (let x = 92; x < worldW; x += 116) {
          this.add.ellipse(x, groundY + 6, 46, 13, 0x14b8a6, 0.3).setDepth(1);
          this.add.ellipse(x + 22, groundY + 2, 28, 6, 0x67e8f9, 0.22).setDepth(2);
        }
      }
    }
    this.physics.add.existing(ground, true);

    this.platforms = this.physics.add.staticGroup();
    this.volcanoBodies = null;
    for (const p of this.layout.platforms) {
      const plat = this.add.rectangle(p.x, p.y, p.w, 16, this.biome.platform);
      if (p.arena) plat.setStrokeStyle(2, this.layout.arena?.ringAccent ?? this.biome.mapGlow, 0.85);
      this.physics.add.existing(plat, true);
      this.platforms.add(plat);
    }

    if (this.layout.volcanoColliders?.length) {
      this.volcanoBodies = this.physics.add.staticGroup();
      const rock = 0x44403c;
      for (const seg of this.layout.volcanoColliders) {
        const body = this.add.rectangle(seg.x, seg.y, seg.w, seg.h, rock, 1);
        body.setAngle(seg.angle ?? 0);
        body.setStrokeStyle(2, 0x57534e, 0.95);
        body.setDepth(6);
        body.setAlpha(seg.kind === "ridge" ? 0.85 : 1);
        this.physics.add.existing(body, true);
        this.volcanoBodies.add(body);
      }
    }

    if (this.biome.id === "ruins" && this.layout.isBossLevel && this.layout.arena) {
      createRuinArenaFeatures(this, this.layout.arena, groundY, height, this.layout.platforms);
    }
    if (this.biome.id === "ember" && this.layout.isBossLevel && this.layout.arena) {
      if (this.layout.bossVolcano) {
        this.emberBossVolcano = createEmberBossVolcano(
          this,
          this.layout.arena.centerX,
          groundY,
          this.layout.arena,
        );
        createEmberVolcano(this, worldW, groundY, height, {
          xMin: this.layout.arena.innerLeft,
          xMax: this.layout.arena.innerRight,
          platforms: this.layout.platforms,
          dense: true,
        });
      } else {
        createEmberArenaVolcano(this, this.layout.arena, groundY, height, this.layout.platforms);
      }
    }
    if (this.biome.id === "frost" && this.layout.isBossLevel && this.layout.arena) {
      createFrostArenaDetails(this, this.layout.arena, groundY, height, this.layout.platforms);
    }
    if (this.biome.id === "bloom" && this.layout.isBossLevel && this.layout.arena) {
      createVerdantArenaGreenery(this, this.layout.arena, groundY, height, this.layout.platforms);
    }
    if (this.biome.id === "storm" && this.layout.isBossLevel && this.layout.arena) {
      createStormArenaDetails(this, this.layout.arena, groundY, height, this.layout.platforms);
    }
    if (this.biome.id === "dunes" && this.layout.isBossLevel && this.layout.arena) {
      createDuneArenaDetails(this, this.layout.arena, groundY, height, this.layout.platforms);
    }
    if (this.biome.id === "void" && this.layout.isBossLevel && this.layout.arena) {
      createVoidArenaDetails(this, this.layout.arena, groundY, height, this.layout.platforms);
    }
    if (this.biome.id === "reef" && this.layout.isBossLevel && this.layout.arena) {
      createReefArenaDetails(this, this.layout.arena, groundY, height, this.layout.platforms);
    }
    if (this.biome.id === "eclipse" && this.layout.isBossLevel && this.layout.arena) {
      createEclipseArenaDetails(this, this.layout.arena, groundY, height, this.layout.platforms);
    }
    if (this.biome.id === "prime" && this.layout.isBossLevel && this.layout.arena) {
      createPrimeArenaDetails(this, this.layout.arena, groundY, height, this.layout.platforms);
    }

    this.spikes = this.physics.add.staticGroup();
    for (const s of this.layout.spikes) {
      const spike = this.add.rectangle(s.x, s.y, s.w, s.h, this.biome.spike);
      spike.setStrokeStyle(1, this.biome.spikeStroke, 0.8);
      this.physics.add.existing(spike, true);
      this.spikes.add(spike);
    }

    this.unlockedSwitches = new Set();
    this.barrierGroup = this.physics.add.staticGroup();
    this.gateSwitch = null;
    this.movingPlat = null;
    this.crumblePlat = null;
    this.patrolBlade = null;

    if (this.layout.barrier && this.layout.switch) {
      const b = this.layout.barrier;
      const wall = this.add.rectangle(b.x, b.y, b.w, b.h, 0x0f172a, 0.95);
      wall.setStrokeStyle(2, 0x475569, 1);
      this.physics.add.existing(wall, true);
      wall.setData("switchId", b.switchId);
      this.barrierGroup.add(wall);

      const sw = this.layout.switch;
      this.gateSwitch = this.add.circle(sw.x, sw.y, sw.r, 0xfacc15, 1);
      this.gateSwitch.setStrokeStyle(2, 0xfde047, 1);
      this.physics.add.existing(this.gateSwitch, false);
      this.gateSwitch.body.setAllowGravity(false);
      this.gateSwitch.body.moves = false;
      this.gateSwitch.setData("switchId", sw.id);
    }

    if (this.layout.moving) {
      const m = this.layout.moving;
      this.movingPlat = this.add.rectangle(m.x, m.y, m.w, m.h, this.biome.moving);
      this.physics.add.existing(this.movingPlat, false);
      this.movingPlat.body.setAllowGravity(false);
      this.movingPlat.body.setImmovable(true);
      this.movingPlat.body.setVelocityX(m.speed);
      this.movingPlat.setData("minX", m.minX);
      this.movingPlat.setData("maxX", m.maxX);
    }

    if (this.layout.crumble) {
      const c = this.layout.crumble;
      this.crumblePlat = this.add.rectangle(c.x, c.y, c.w, c.h, 0x57534e);
      this.crumblePlat.setStrokeStyle(2, 0xfca5a5, 0.65);
      this.physics.add.existing(this.crumblePlat, true);
      this.crumblePlat.setData("crumbled", false);
      this.crumblePlat.setData("crumblePending", false);
    }

    if (this.layout.patrol) {
      const p = this.layout.patrol;
      this.patrolBlade = this.add.rectangle(p.x, p.y, p.w, p.h, 0xf97316, 0.92);
      this.patrolBlade.setStrokeStyle(2, 0xfca5a5, 1);
      this.physics.add.existing(this.patrolBlade, false);
      this.patrolBlade.body.setAllowGravity(false);
      this.patrolBlade.body.setImmovable(true);
      this.patrolBlade.body.setVelocityY(p.speed);
      this.patrolBlade.setData("minY", p.minY);
      this.patrolBlade.setData("maxY", p.maxY);
    }

    this.collected = new Set();
    this.jumpsLeft = 0;
    this.lastLore = "";
    this.collectRadius = 100;
    this.nearOrb = null;
    this.shrineUnlocked = false;
    this.gameFrozen = false;
    this.deaths = 0;
    this.invulnMs = 0;
    this.coyoteMs = 160;
    this.coyoteLeft = 0;
    this.playerWasOnGround = false;

    const spawn = resolveSpawnPosition(this.layout, groundY);
    this.checkpointX = spawn.x;
    this.checkpointY = spawn.y;

    this.player = new StickFigure(this, spawn.x, spawn.y);
    this.physics.add.existing(this.player, false);
    this.player.body.setCollideWorldBounds(true);
    this.syncBody();
    this.player.setDepth(10);
    this.invulnMs = 1500;

    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, this.platforms);
    if (this.volcanoBodies) {
      this.physics.add.collider(this.player, this.volcanoBodies);
    }
    if (this.arenaWalls) this.physics.add.collider(this.player, this.arenaWalls);
    if (this.movingPlat) this.physics.add.collider(this.player, this.movingPlat);
    if (this.crumblePlat) {
      this.physics.add.collider(this.player, this.crumblePlat, () => {
        this.queueCrumbleIfStanding(this.crumblePlat);
      });
    }
    this.physics.add.collider(this.player, this.barrierGroup);
    this.physics.add.overlap(this.player, this.spikes, () => this.hitHazard());
    if (this.gateSwitch) {
      this.physics.add.overlap(this.player, this.gateSwitch, () => this.hitSwitch(this.gateSwitch));
    }
    if (this.patrolBlade) {
      this.physics.add.overlap(this.player, this.patrolBlade, () => this.hitHazard());
    }

    this.checkpoints = this.physics.add.group();
    for (const cp of this.layout.checkpoints) {
      const pole = this.add.rectangle(cp.x, cp.cpY - 22, 4, 26, 0x94a3b8);
      const flag = this.add.rectangle(cp.x + 12, cp.cpY - 30, 16, 10, 0x22c55e, 0.85);
      this.physics.add.existing(pole, false);
      pole.body.setSize(30, 36);
      pole.body.setOffset(-12, -18);
      pole.body.setAllowGravity(false);
      pole.body.moves = false;
      pole.setData("cpX", cp.x);
      pole.setData("cpY", cp.cpY);
      this.checkpoints.add(pole);
      flag.setDepth(this.layout.volcanoColliders ? 14 : 2);
    }
    this.physics.add.overlap(this.player, this.checkpoints, (_, pole) => {
      const safe = resolveCheckpointPosition(
        pole.getData("cpX"),
        pole.getData("cpY"),
        this.layout,
        groundY,
      );
      this.checkpointX = safe.x;
      this.checkpointY = safe.y;
    });

    this.pickupOrbs = [];
    for (const spot of this.layout.pickups) {
      this.pickupOrbs.push(this.createPickup(spot.x, spot.y, spot.id));
    }

    this.createShrine(groundY, shrineX);

    this.secretRiftZone = null;
    this.secretRiftFound = isSecretWorldUnlocked();
    if (this.layout.secretExit) {
      this.createSecretRift(this.layout.secretExit);
    }

    this.boss = null;
    this.bossHpText = null;
    this.emberBossVolcano = this.emberBossVolcano ?? null;
    this.emberBossEmerged = false;
    this.volcanoMouthZone = null;

    if (this.layout.isBossLevel && this.layout.bossSpawn) {
      this.boss = new Boss(
        this,
        this.layout.bossSpawn.x,
        this.layout.bossSpawn.y,
        this.layout.bossType,
        this.biome,
      );

      if (this.layout.arena) {
        this.boss.setArenaBounds(this.layout.arena, groundY);
      }
      if (this.arenaWalls) {
        this.physics.add.collider(this.boss, this.arenaWalls);
      }

      if (this.layout.bossVolcano) {
        const v = this.layout.bossVolcano;
        this.boss.setSubmerged(v.mouthY, v.emergeY);
        this.shrineHint.setText("The caldera churns… approach or claim Spine to awaken it");
        const zone = this.add.circle(v.x, v.mouthY, v.triggerRadius ?? 90, 0x000000, 0);
        zone.setDepth(3);
        this.physics.add.existing(zone, false);
        zone.body.setAllowGravity(false);
        zone.body.moves = false;
        zone.body.setCircle(v.triggerRadius ?? 90);
        this.volcanoMouthZone = zone;
        this.physics.add.overlap(this.player, zone, () => this.tryEmergeEmberBoss());
      } else {
        this.physics.add.overlap(this.player, this.boss, () => this.onBossOverlap());
        this.shrinePortal.setAlpha(0.35);
        this.shrineHint.setText("Defeat the boss & collect Heart");
      }

      this.bossHpText = this.add
        .text(width / 2, 58, "", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          color: "#fca5a5",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(55);
    }

    this.nextLabel = this.add
      .text(0, 0, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
        color: "#fbbf24",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 1)
      .setDepth(25);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey("A");
    this.keyD = this.input.keyboard.addKey("D");
    this.keyW = this.input.keyboard.addKey("W");
    this.keySpace = this.input.keyboard.addKey("SPACE");
    this.keyShift = this.input.keyboard.addKey("SHIFT");
    this.keyE = this.input.keyboard.addKey("E");
    this.keyM = this.input.keyboard.addKey("M");

    this.hud = this.add
      .text(12, 10, "", {
        fontFamily: "system-ui, Segoe UI, sans-serif",
        fontSize: "13px",
        color: "#e2e8f0",
        lineSpacing: 4,
      })
      .setScrollFactor(0)
      .setDepth(50);

    const mode = this.hardMode ? "HARD" : "Normal";
    this.hint = this.add
      .text(
        width / 2,
        height - 16,
        `${this.biome.name} · ${this.layout.isFinalBoss ? "FINAL BOSS" : this.layout.isBossLevel ? "BOSS" : `Stage ${this.layout.levelInBiome + 1}/${levelsInBiome(this.biomeIndex)}`} · ${this.layout.name} · M=map · ${mode}`,
        {
          fontFamily: "system-ui, sans-serif",
          fontSize: "10px",
          color: "#64748b",
        },
      )
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(50);

    this.cameras.main.setBounds(0, 0, worldW, height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    if (!this.collected.has("spine")) {
      this.cameras.main.setLerp(0.04, 0.04);
    }

    this.hp = this.getMaxHp();
    this.setupDebug(width, height);
    this.updateHud();
  }

  parseLevelIndex(data = {}) {
    if (typeof data.levelIndex === "number") {
      return Phaser.Math.Clamp(data.levelIndex, 0, MAX_LEVEL - 1);
    }

    const url = new URLSearchParams(window.location.search).get("level");
    let fromUrl = null;
    if (url !== null && url !== "") {
      const parsed = parseInt(url, 10);
      if (Number.isFinite(parsed)) {
        const idx = parsed <= 0 ? 0 : parsed - 1;
        fromUrl = Phaser.Math.Clamp(idx, 0, MAX_LEVEL - 1);
      }
    }
    if (fromUrl !== null) return fromUrl;
    return 0;
  }

  getEvo() {
    return getEvolutionStats(this.collected);
  }

  getMaxHp() {
    return 4 + this.getEvo().extraHp;
  }

  hitSwitch(sw) {
    if (this.gameFrozen || !sw?.active) return;
    const id = sw.getData("switchId");
    if (!id || this.unlockedSwitches.has(id)) return;
    this.unlockedSwitches.add(id);
    sw.setFillStyle(0x22c55e, 1);
    for (const bar of this.barrierGroup.getChildren()) {
      if (!bar.active) continue;
      if (bar.getData("switchId") === id) {
        if (bar.body) {
          bar.body.checkCollision.none = true;
          bar.body.enable = false;
        }
        bar.setVisible(false);
      }
    }
    this.lastLore = "The gate yields.";
    this.updateHud();
  }

  tryEmergeEmberBoss() {
    if (this.emberBossEmerged || !this.boss || this.boss.defeated) return;
    if (!this.boss.emergeFromVolcano()) return;

    this.emberBossEmerged = true;
    playVolcanoEruption(this, this.emberBossVolcano);
    this.physics.add.overlap(this.player, this.boss, () => this.onBossOverlap());
    this.lastLore = "The Cinder Wraith erupts from the volcano!";
    this.shrineHint.setText("Defeat the boss & collect Heart");
    this.shrinePortal.setAlpha(0.35);
    this.updateHud();
  }

  onBossOverlap() {
    if (!this.boss || !this.boss.emerged || this.boss.defeated || this.gameFrozen || this.invulnMs > 0) {
      return;
    }
    const stomp = this.player.body.velocity.y > 70 && this.player.y < this.boss.y - 10;
    if (stomp) {
      this.boss.onStomp();
      this.player.body.setVelocityY(-340);
      this.boss.checkDefeated();
      this.updateHud();
      return;
    }
    this.hitHazard();
  }

  hitHazard() {
    if (this.gameFrozen || this.invulnMs > 0) return;
    this.hp -= 1;
    this.invulnMs = 900;
    this.cameras.main.shake(120, 0.004);
    if (this.hp <= 0) {
      this.deaths += 1;
      this.respawn();
    } else {
      this.updateHud();
    }
  }

  respawn() {
    const safe = resolveCheckpointPosition(
      this.checkpointX,
      this.checkpointY,
      this.layout,
      this.groundY,
    );
    this.checkpointX = safe.x;
    this.checkpointY = safe.y;
    this.player.setPosition(safe.x, safe.y);
    this.player.body.setVelocity(0, 0);
    this.playerWasOnGround = true;
    this.hp = this.getMaxHp();
    this.invulnMs = 1500;
    this.updateHud();
  }

  queueCrumbleIfStanding(plat) {
    if (!plat?.active || plat.getData("crumbled") || plat.getData("crumblePending")) return;
    const body = this.player.body;
    const onThis =
      body.touching.down &&
      body.velocity.y >= -40 &&
      this.player.y <= plat.y + 14 &&
      Math.abs(this.player.x - plat.x) < plat.width * 0.55;
    if (!onThis) return;
    plat.setData("crumblePending", true);
    this.tweens.add({
      targets: plat,
      alpha: { from: 1, to: 0.35 },
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        plat.setData("crumbled", true);
        if (plat.body) {
          plat.body.checkCollision.none = true;
          plat.body.enable = false;
        }
        plat.setVisible(false);
      },
    });
  }

  updateMovingPlat() {
    const plat = this.movingPlat;
    if (!plat?.body) return;
    const minX = plat.getData("minX");
    const maxX = plat.getData("maxX");
    if (plat.x <= minX) plat.body.setVelocityX(Math.abs(plat.body.velocity.x));
    if (plat.x >= maxX) plat.body.setVelocityX(-Math.abs(plat.body.velocity.x));
  }

  updatePatrolBlade() {
    const blade = this.patrolBlade;
    if (!blade?.body) return;
    const minY = blade.getData("minY");
    const maxY = blade.getData("maxY");
    if (blade.y <= minY) blade.body.setVelocityY(Math.abs(blade.body.velocity.y));
    if (blade.y >= maxY) blade.body.setVelocityY(-Math.abs(blade.body.velocity.y));
  }

  grantPartsThrough(partId) {
    const idx = UNLOCK_ORDER.indexOf(partId);
    if (idx < 0) return false;

    for (let i = 0; i <= idx; i++) {
      const id = UNLOCK_ORDER[i];
      if (!this.collected.has(id)) {
        this.collected.add(id);
        this.applyPart(id);
        if (id === "spine" && this.layout.bossVolcano) {
          this.tryEmergeEmberBoss();
        }
      }
    }

    this.pickupOrbs = this.pickupOrbs.filter((orb) => {
      const id = orb.getData("partId");
      if (!this.collected.has(id)) return true;
      if (orb.active) orb.destroy();
      return false;
    });

    if (this.collected.has("spine")) {
      this.cameras.main.setLerp(0.1, 0.1);
    }
    if (this.collected.has("heart")) {
      this.unlockShrine();
    }
    if (this.boss) {
      this.boss.hp = 0;
      this.boss.checkDefeated();
    }
    if (
      this.gateSwitch &&
      (partId === "hands" || UNLOCK_ORDER.indexOf(partId) >= UNLOCK_ORDER.indexOf("hands"))
    ) {
      this.hitSwitch(this.gateSwitch);
    }
    this.hp = this.getMaxHp();
    this.syncBody();
    return true;
  }

  applyDebugComplete({ teleport = true } = {}) {
    this.grantPartsThrough("heart");
    this.tryEmergeEmberBoss();
    this.lastLore = "[debug] All parts granted.";
    if (teleport) {
      const safe = resolveCheckpointPosition(
        this.layout.shrineX - 100,
        this.layout.shrineAnchorY ?? this.groundY,
        this.layout,
        this.groundY,
      );
      this.player.setPosition(safe.x, safe.y);
      this.invulnMs = 1500;
    }
    this.updateHud();
  }

  setupDebug(width, height) {
    const flags = readDebugFlags();
    this.debugMode = flags.debug || flags.complete;

    if (flags.complete) {
      this.applyDebugComplete({ teleport: true });
    } else if (flags.part && this.grantPartsThrough(flags.part)) {
      this.lastLore = `[debug] Granted through ${PART_META[flags.part]?.label ?? flags.part}.`;
    }

    if (!this.debugMode) return;

    this.keyK = this.input.keyboard.addKey("K");
    this.add
      .text(width - 10, 10, "DEBUG", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "10px",
        color: "#f97316",
        fontStyle: "bold",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(51);

    this.hint.setText("DEBUG · K = all parts + open shrine · ?complete=1 · ?part=legs · ?hard=1");
  }

  createShrine(groundY, shrineX) {
    const anchorY = this.layout.shrineAnchorY ?? groundY;
    this.shrineEnterX = shrineX;
    this.shrineEnterY = anchorY - 52;

    this.shrineGroup = this.add.container(shrineX, anchorY);
    const leftPillar = this.add.rectangle(-38, -58, 16, 116, 0x334155);
    const rightPillar = this.add.rectangle(38, -58, 16, 116, 0x334155);
    const lintel = this.add.rectangle(0, -114, 92, 14, 0x334155);
    this.shrinePortal = this.add.rectangle(0, -58, 56, 100, 0x1e293b, 0.85);
    this.shrinePortal.setStrokeStyle(2, 0x475569, 0.9);
    this.shrineLabel = this.add
      .text(0, -132, "Sealed shrine", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "10px",
        color: "#64748b",
      })
      .setOrigin(0.5);
    this.shrineHint = this.add
      .text(0, 8, "Collect Heart to open", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "9px",
        color: "#475569",
      })
      .setOrigin(0.5);
    this.shrineGroup.add([leftPillar, rightPillar, lintel, this.shrinePortal, this.shrineLabel, this.shrineHint]);
    this.shrineGroup.setDepth(this.layout.volcanoColliders ? 14 : 4);
  }

  unlockShrine() {
    if (this.shrineUnlocked) return;
    if (this.boss && !this.boss.defeated) return;
    this.shrineUnlocked = true;

    const shrine = this.biome?.shrine ?? 0xfbbf24;
    this.shrinePortal.setFillStyle(shrine, 0.32);
    this.shrinePortal.setStrokeStyle(3, shrine, 1);
    this.shrineLabel.setText("Sanctuary");
    this.shrineLabel.setColor("#fbbf24");
    this.shrineHint.setText("Walk inside to leave");

    this.tweens.add({
      targets: this.shrinePortal,
      alpha: { from: 0.32, to: 0.52 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    const burst = this.add.circle(this.shrineEnterX, this.shrineEnterY, 6, shrine, 0.8);
    burst.setDepth(20);
    this.tweens.add({
      targets: burst,
      scale: 12,
      alpha: 0,
      duration: 700,
      onComplete: () => burst.destroy(),
    });

    this.updateHud();
  }

  createSecretRift(exit) {
    const { x, y, w, h } = exit;
    this.secretRiftZone = { x, y, w, h };

    this.secretRiftGroup = this.add.container(x, y);
    const outer = this.add.circle(0, 0, 32, 0x4c1d95, 0.35);
    outer.setStrokeStyle(3, 0xe879f9, 0.95);
    const inner = this.add.circle(0, 0, 14, 0xa855f7, 0.9);
    const label = this.add
      .text(0, -46, this.secretRiftFound ? "Rift — Eclipse Veil" : "Hidden rift", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "10px",
        color: "#f0abfc",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.secretRiftGroup.add([outer, inner, label]);
    this.secretRiftGroup.setDepth(12);

    this.tweens.add({
      targets: inner,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  checkSecretRift() {
    if (!this.secretRiftZone || this.secretRiftFound || this.gameFrozen) return;

    const z = this.secretRiftZone;
    const px = this.player.x;
    const py = this.player.getCollectAnchorY();
    if (Math.abs(px - z.x) < z.w / 2 && Math.abs(py - z.y) < z.h / 2) {
      this.secretRiftFound = true;
      const first = unlockSecretWorld();
      if (first) {
        this.openEpilogueOnMap = true;
        this.secretToast = this.add
          .text(this.scale.width / 2, 72, "Page 2 unlocked on the World Map — press →", {
            fontFamily: "system-ui, sans-serif",
            fontSize: "13px",
            color: "#f0abfc",
            fontStyle: "bold",
            backgroundColor: "#1e1b4bcc",
            padding: { x: 10, y: 6 },
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(150);
      }
      if (this.secretRiftGroup) {
        const label = this.secretRiftGroup.list.find((c) => c.type === "Text");
        if (label) label.setText("Rift — Eclipse Veil");
      }
    }
  }

  checkShrineEntry() {
    if (!this.shrineUnlocked || this.gameFrozen) return;

    const dx = Math.abs(this.player.x - this.shrineEnterX);
    const dy = Math.abs(this.player.getCollectAnchorY() - this.shrineEnterY);
    if (dx < 48 && dy < 72) {
      this.promptVictory();
    }
  }

  promptVictory() {
    if (this.gameFrozen) return;
    this.gameFrozen = true;
    this.physics.pause();

    const { width, height } = this.scale;
    markLevelCleared(this.levelIndex);
    const trueEnd = isTrueEndingComplete();
    const campaignDone = isCampaignComplete();
    const secretDone = isSecretBiomeComplete();

    let title = "Level clear";
    if (trueEnd) title = "Evolution complete!";
    else if (this.layout.isFinalBoss) title = "Primordial Warden falls!";
    else if (this.levelIndex === 44 && secretDone) title = "Eclipse Veil cleared!";
    else if (campaignDone && this.levelIndex === 39) title = "Eight worlds restored!";

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x020617, 0.82)
      .setScrollFactor(0)
      .setDepth(200);

    this.add
      .text(width / 2, height / 2 - 36, title, {
        fontFamily: "system-ui, Segoe UI, sans-serif",
        fontSize: "26px",
        color: "#fbbf24",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    let sub = `${this.biome.name} — ${this.layout.name}\nDeaths: ${this.deaths}`;
    if (trueEnd) {
      sub += "\n\nEvery realm conquered — press Enter for World Map";
    } else if (this.layout.isFinalBoss) {
      sub += "\n\nThe evolution is complete.\nPress Enter for World Map";
    } else if (this.levelIndex === 44 && secretDone && isFinalBossUnlocked()) {
      sub += "\n\nPrimordial Core unlocked on World Map Page 2.\nPress Enter for World Map";
    } else if (campaignDone && this.levelIndex === 39) {
      sub +=
        "\n\nFind the hidden rift on the high ledge in\nVoid Crypt · Abyss Hop (World 7, Stage 4).\nPress Enter for World Map";
    } else {
      sub += "\n\nPress Enter for World Map";
    }

    this.add
      .text(width / 2, height / 2 + 12, sub, {
        fontFamily: "system-ui, Segoe UI, sans-serif",
        fontSize: "14px",
        color: "#e2e8f0",
        align: "center",
        lineSpacing: 6,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    this.input.keyboard.once("keydown-ENTER", () => {
      this.physics.resume();
      const mapPage = this.openEpilogueOnMap ? 1 : this.returnMapPage;
      this.scene.start("WorldMapScene", {
        justBeat: this.levelIndex,
        mapPage,
        openEpilogue: this.openEpilogueOnMap,
      });
    });
  }

  nextPartId() {
    return UNLOCK_ORDER.find((id) => !this.collected.has(id)) ?? null;
  }

  hasLegs() {
    return this.collected.has("legs");
  }

  hasFeet() {
    return this.collected.has("feet");
  }

  getNextOrb() {
    const next = this.nextPartId();
    if (!next) return null;
    return this.pickupOrbs.find((o) => o.active && o.getData("partId") === next) ?? null;
  }

  distToOrb(orb) {
    const dx = this.player.x - orb.x;
    const dy = this.player.getCollectAnchorY() - orb.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  setOrbHighlight(orb, on) {
    if (!orb?.active) return;
    orb.setScale(on ? 1.18 : 1);
    const glow = orb.getData("glow");
    const ring = orb.getData("ring");
    if (glow) glow.setAlpha(on ? 0.45 : 0.18);
    if (ring) ring.setStrokeStyle(on ? 4 : 3, on ? 0xffffff : orb.getData("color"), 1);
  }

  tryCollect(orb) {
    if (!orb || !orb.active) return false;
    const id = orb.getData("partId");
    const next = this.nextPartId();
    if (!id || id !== next) return false;

    this.collected.add(id);
    this.lastLore = PART_META[id].lore;
    this.applyPart(id);
    const ox = orb.x;
    const oy = orb.y;
    orb.destroy();
    this.pickupOrbs = this.pickupOrbs.filter((o) => o !== orb);
    this.nearOrb = null;
    this.syncBody();
    this.hp = Math.min(this.hp + 1, this.getMaxHp());

    this.flashCollect(ox, oy);

    if (id === "spine") {
      this.cameras.main.setLerp(0.1, 0.1);
      if (this.layout.bossVolcano) {
        this.tryEmergeEmberBoss();
      }
    }
    if (this.boss && !this.boss.defeated) {
      this.boss.onPartCollected();
      this.boss.checkDefeated();
    }
    if (id === "heart") {
      this.unlockShrine();
    }
    this.updateHud();
    return true;
  }

  flashCollect(x, y) {
    const burst = this.add.circle(x, y, 8, 0xffffff, 0.9);
    burst.setDepth(30);
    this.tweens.add({
      targets: burst,
      scale: 4,
      alpha: 0,
      duration: 350,
      onComplete: () => burst.destroy(),
    });
  }

  checkPickups() {
    const orb = this.getNextOrb();
    if (!orb) {
      this.nearOrb = null;
      return;
    }

    const dist = this.distToOrb(orb);
    const inRange = dist < this.collectRadius;

    if (this.nearOrb && this.nearOrb !== orb) {
      this.setOrbHighlight(this.nearOrb, false);
    }
    this.nearOrb = inRange ? orb : null;
    this.setOrbHighlight(orb, inRange);

    if (inRange && (Phaser.Input.Keyboard.JustDown(this.keyE) || dist < this.collectRadius * 0.55)) {
      this.tryCollect(orb);
    }
  }

  applyPart(id) {
    if (id === "torso") this.player.setBodyStage(STAGE.TORSO);
    if (id === "arms" || id === "hands") this.player.setBodyStage(Math.max(this.player.bodyStage, STAGE.ARMS));
    if (id === "legs" || id === "feet") this.player.setBodyStage(STAGE.LEGS);
    if (id === "eyes") this.player.hasEyes = true;
    if (id === "heart") this.player.hasHeart = true;
  }

  syncBody() {
    const { w, h } = this.player.getColliderSize();
    const bodyH = Math.floor(h * 0.88);
    this.player.body.setSize(w, bodyH);
    this.player.body.setOffset(-w / 2, -bodyH + 2);
  }

  updateHud() {
    const evo = this.getEvo();
    const lines = UNLOCK_ORDER.map((id) => {
      const mark = this.collected.has(id) ? "◆" : "◇";
      return `${mark} ${PART_META[id].label}`;
    });
    const next = this.nextPartId();
    const move = this.hasLegs() ? "walk / sprint" : "roll / hop";
    const jump = this.hasLegs() ? (this.hasFeet() ? "double jump" : "jump") : "hop";
    const stageLine = this.layout.isBossLevel
      ? `BOSS — ${this.layout.bossName ?? this.layout.name}`
      : `Stage ${this.layout.levelInBiome + 1}/${LEVELS_PER_BIOME} — ${this.layout.name}`;
    let text = `Evolution · ${this.biome.name}\n${stageLine}\n` + lines.join("\n");
    text += `\n\nHP ${this.hp}/${this.getMaxHp()} · Deaths ${this.deaths}`;
    if (this.boss && !this.boss.defeated) {
      if (!this.boss.emerged) {
        text += "\nBoss dormant in the volcano — approach the caldera or collect Spine";
      } else {
        text += `\nBoss HP ${this.boss.hp}/${this.boss.maxHp} · jump on head or collect parts`;
      }
    }
    if (next) text += `\n\n► Next: ${PART_META[next].label}`;
    else if (this.shrineUnlocked) text += "\n\n► Enter the golden shrine →";
    if (this.lastLore) text += `\n\n“${this.lastLore}”`;
    text += `\n\n${move} · ${jump} · move×${evo.moveMult.toFixed(2)} jump×${evo.jumpMult.toFixed(2)}`;
    this.hud.setText(text);
  }

  update(time, delta) {
    if (this.gameFrozen) return;

    if (Phaser.Input.Keyboard.JustDown(this.keyM)) {
      this.scene.start("WorldMapScene", { mapPage: this.returnMapPage });
      return;
    }

    if (this.debugMode && this.keyK && Phaser.Input.Keyboard.JustDown(this.keyK)) {
      this.applyDebugComplete({ teleport: false });
    }

    if (this.invulnMs > 0) {
      this.invulnMs -= delta;
      this.player.alpha = Math.sin(time / 50) > 0 ? 0.45 : 1;
    } else {
      this.player.alpha = 1;
    }

    this.updateMovingPlat();
    this.updatePatrolBlade();

    if (this.boss && !this.boss.defeated) {
      this.boss.updateBehavior(time, delta, this.player, this.layout.worldW, this.groundY);
      if (this.bossHpText) {
        if (this.boss.emerged) {
          this.bossHpText.setText(`${this.layout.bossName} · ${this.boss.hp}/${this.boss.maxHp} HP`);
        } else {
          this.bossHpText.setText("…something moves in the magma");
        }
      }
    }

    const body = this.player.body;
    const onGround = body.blocked.down || body.touching.down;

    if (onGround) {
      this.coyoteLeft = this.coyoteMs;
    } else if (this.coyoteLeft > 0) {
      this.coyoteLeft -= delta;
    }

    const evo = this.getEvo();
    let vx = 0;
    if (this.cursors.left.isDown || this.keyA.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.keyD.isDown) vx += 1;

    const baseWalk = this.hardMode ? 230 : 250;
    const baseSprint = this.hardMode ? 310 : 335;
    const baseRoll = this.hardMode ? 170 : 190;

    if (this.hasLegs()) {
      const sprint = this.keyShift.isDown;
      const speed = (sprint ? baseSprint : baseWalk) * evo.moveMult;
      body.setVelocityX(vx * speed);
    } else {
      body.setVelocityX(vx !== 0 ? vx * baseRoll * evo.moveMult : body.velocity.x * 0.9);
    }

    if (onGround) {
      this.jumpsLeft = this.hasLegs() ? (this.hasFeet() ? 2 : 1) : 1;
    }

    const wantJump =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keyW) ||
      Phaser.Input.Keyboard.JustDown(this.keySpace);

    const canCoyote = this.coyoteLeft > 0;
    if (wantJump && (this.jumpsLeft > 0 || canCoyote)) {
      if (this.jumpsLeft <= 0 && canCoyote) this.jumpsLeft = 1;
      const jumpV = (this.hasLegs() ? this.layout.baseJump : this.layout.hopJump) * evo.jumpMult;
      body.setVelocityY(jumpV);
      this.jumpsLeft -= 1;
      this.coyoteLeft = 0;
    }

    const landed = onGround && !this.playerWasOnGround && body.velocity.y >= 0;
    this.player.updateAnimation(delta, {
      vx: body.velocity.x,
      vy: body.velocity.y,
      onGround,
      landed,
    });
    this.playerWasOnGround = onGround;

    if (this.player.y > this.groundY + 100) {
      this.deaths += 1;
      this.respawn();
    }

    if (!this.collected.has("spine")) {
      this.cameras.main.scrollX += Math.sin(time / 400) * 0.4;
    }

    this.checkPickups();
    this.checkSecretRift();
    this.checkShrineEntry();

    const orb = this.getNextOrb();
    if (orb) {
      const inRange = this.distToOrb(orb) < this.collectRadius;
      this.nextLabel.setVisible(true);
      this.nextLabel.setText(
        inRange ? `▼ ${PART_META[orb.getData("partId")].label} — press E` : `▼ ${PART_META[orb.getData("partId")].label}`,
      );
      this.nextLabel.x = orb.x;
      this.nextLabel.y = orb.y - 34 + Math.sin(time / 220) * 3;
    } else if (this.secretRiftZone && !this.secretRiftFound) {
      const z = this.secretRiftZone;
      const near =
        Math.abs(this.player.x - z.x) < z.w &&
        Math.abs(this.player.getCollectAnchorY() - z.y) < z.h + 20;
      this.nextLabel.setVisible(true);
      this.nextLabel.setText(near ? "▼ Secret rift — step inside" : "▼ Hidden rift");
      this.nextLabel.x = z.x;
      this.nextLabel.y = z.y - 56 + Math.sin(time / 220) * 3;
    } else if (this.shrineUnlocked) {
      const nearShrine =
        Math.abs(this.player.x - this.shrineEnterX) < 80 &&
        Math.abs(this.player.getCollectAnchorY() - this.shrineEnterY) < 90;
      this.nextLabel.setVisible(true);
      this.nextLabel.setText(nearShrine ? "▼ Sanctuary — step inside" : "▼ Sanctuary");
      this.nextLabel.x = this.shrineEnterX;
      this.nextLabel.y = this.shrineEnterY - 88 + Math.sin(time / 220) * 3;
    } else {
      this.nextLabel.setVisible(false);
    }
  }
}
