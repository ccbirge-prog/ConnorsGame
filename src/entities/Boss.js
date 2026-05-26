import Phaser from "phaser";

/** Eight visually distinct biome bosses. */
export default class Boss extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type, biome) {
    super(scene, x, y);
    scene.add.existing(this);

    this.bossType = type;
    this.hp = 8;
    this.maxHp = 8;
    this.defeated = false;
    this.dashTimer = 0;
    this.slamTimer = 0;
    this.sporeTimer = 0;
    this.spores = [];
    this.parts = [];
    this.animPhase = 0;
    this.slamming = false;
    this.dashing = false;
    this.baseY = y;
    this.attackPulse = 0;
    this.submerged = false;
    this.emerging = false;
    this.emerged = true;
    this.combatY = y;
    this.mouthY = y;
    this.bounds = null;

    if (type === "warden") this.buildWarden();
    else if (type === "cinder") this.buildCinder();
    else if (type === "rime") this.buildRime();
    else if (type === "thorn") this.buildThorn();
    else if (type === "storm") this.buildStorm();
    else if (type === "sand") this.buildSand();
    else if (type === "void") this.buildVoid();
    else if (type === "eclipse") this.buildEclipse();
    else if (type === "prime") this.buildPrime();
    else this.buildReef();

    if (type === "prime") {
      this.hp = 12;
      this.maxHp = 12;
    }

    scene.physics.add.existing(this, false);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.fitBody();
    this.setDepth(8);
  }

  fitBody() {
    const w =
      this.bossType === "warden"
        ? 72
        : this.bossType === "sand"
          ? 76
          : this.bossType === "rime" || this.bossType === "reef"
            ? 64
            : 60;
    const h =
      this.bossType === "rime" || this.bossType === "sand"
        ? 100
        : this.bossType === "storm"
          ? 92
          : this.bossType === "prime"
            ? 108
            : 88;
    this.body.setSize(w, h);
    this.body.setOffset(-w / 2, -h + 20);
  }

  bossHalfWidth() {
    if (this.bossType === "warden" || this.bossType === "prime") return 40;
    if (this.bossType === "sand") return 40;
    if (this.bossType === "rime" || this.bossType === "reef") return 34;
    if (this.bossType === "storm" || this.bossType === "eclipse") return 34;
    return 32;
  }

  /** Keep movement inside arena walls (from buildBossLevel arena). */
  setArenaBounds(arena, groundY) {
    const halfW = this.bossHalfWidth();
    const padX = 18;
    this.bounds = {
      minX: arena.innerLeft + halfW + padX,
      maxX: arena.innerRight - halfW - padX,
      minY: arena.bossMinY ?? 72,
      maxY: arena.bossMaxY ?? groundY - 86,
    };
    this.clampToArena();
  }

  clampToArena() {
    if (!this.bounds) return;
    const b = this.bounds;
    const prevX = this.x;

    if (this.x < b.minX) {
      this.x = b.minX;
      if (this.body?.velocity?.x < 0) {
        this.body.setVelocityX(Math.abs(this.body.velocity.x) * 0.8);
      }
    } else if (this.x > b.maxX) {
      this.x = b.maxX;
      if (this.body?.velocity?.x > 0) {
        this.body.setVelocityX(-Math.abs(this.body.velocity.x) * 0.8);
      }
    }

    this.y = Phaser.Math.Clamp(this.y, b.minY, b.maxY);

    if (this.body) {
      if (this.x !== prevX && Math.abs(this.body.velocity?.x ?? 0) > 0) {
        const stuck =
          (prevX <= b.minX && this.body.velocity.x < 0) || (prevX >= b.maxX && this.body.velocity.x > 0);
        if (stuck) this.body.setVelocityX(0);
      }
      this.body.updateFromGameObject();
    }
  }

  clampX(x) {
    if (!this.bounds) return x;
    return Phaser.Math.Clamp(x, this.bounds.minX, this.bounds.maxX);
  }

  /** Hide in volcano caldera until emergeFromVolcano(). */
  setSubmerged(mouthY, combatY) {
    this.submerged = true;
    this.emerging = false;
    this.emerged = false;
    this.mouthY = mouthY;
    this.combatY = this.bounds ? Phaser.Math.Clamp(combatY, this.bounds.minY, this.bounds.maxY) : combatY;
    this.y = mouthY;
    this.setAlpha(0);
    this.setScale(0.5);
    if (this.body) {
      this.body.checkCollision.none = true;
      this.body.setVelocity(0, 0);
    }
  }

  emergeFromVolcano() {
    if (this.emerged || this.emerging || this.defeated) {
      return false;
    }
    this.emerging = true;
    this.submerged = false;
    this.setAlpha(1);
    this.setScale(0.7);
    this.scene.tweens.add({
      targets: this,
      y: this.combatY,
      scaleX: 1,
      scaleY: 1,
      duration: 950,
      ease: "Back.easeOut",
      onComplete: () => {
        this.emerging = false;
        this.emerged = true;
        if (this.body) {
          this.body.checkCollision.none = false;
        }
        this.clampToArena();
      },
    });
    return true;
  }

  /** Blocky stone golem with rune eyes. */
  buildWarden() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x64748b, 1);
    g.fillRect(-34, -10, 68, 56);
    g.fillStyle(0x475569, 1);
    g.fillRect(-28, -48, 56, 42);
    g.lineStyle(3, 0x5eead4, 0.9);
    g.strokeRect(-34, -10, 68, 56);
    g.strokeRect(-28, -48, 56, 42);
    g.fillStyle(0x22d3ee, 0.9);
    g.fillRect(-16, -36, 10, 10);
    g.fillRect(6, -36, 10, 10);
    g.fillStyle(0x334155, 1);
    g.fillRect(-40, 20, 18, 28);
    g.fillRect(22, 20, 18, 28);
    this.add(g);
    this.core = g;
    this.footL = this.scene.add.rectangle(-40, 34, 18, 28, 0x334155, 1).setOrigin(0.5, 0);
    this.footR = this.scene.add.rectangle(22, 34, 18, 28, 0x334155, 1).setOrigin(0.5, 0);
    this.add([this.footL, this.footR]);
    this.parts.push(g, this.footL, this.footR);
  }

  /** Floating flame spirit — sharp crown, no legs. */
  buildCinder() {
    const g = this.scene.add.graphics();
    g.fillStyle(0xf97316, 0.95);
    g.fillTriangle(0, -58, -38, 18, 38, 18);
    g.fillStyle(0xfbbf24, 0.85);
    g.fillTriangle(0, -48, -24, 8, 24, 8);
    g.fillStyle(0x1a0a08, 1);
    g.fillCircle(-10, -18, 6);
    g.fillCircle(10, -18, 6);
    g.fillStyle(0xfef08a, 1);
    g.fillCircle(-10, -18, 2);
    g.fillCircle(10, -18, 2);
    const wispL = this.scene.add.ellipse(-42, 0, 14, 36, 0xea580c, 0.7);
    const wispR = this.scene.add.ellipse(42, 0, 14, 36, 0xea580c, 0.7);
    this.add([wispL, wispR, g]);
    this.core = g;
    this.wispL = wispL;
    this.wispR = wispR;
    this.parts.push(g, wispL, wispR);
  }

  /** Ice colossus — crystal shards + hex core. */
  buildRime() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x38bdf8, 0.35);
    g.fillCircle(0, -20, 26);
    g.lineStyle(3, 0x7dd3fc, 1);
    g.strokeCircle(0, -20, 26);
    g.fillStyle(0xbae6fd, 0.9);
    g.fillTriangle(0, -62, -12, -32, 12, -32);
    g.fillTriangle(-36, -8, -20, 28, -48, 20);
    g.fillTriangle(36, -8, 20, 28, 48, 20);
    g.fillStyle(0x0ea5e9, 0.8);
    g.fillRect(-8, -28, 16, 16);
    const shardL = this.scene.add.triangle(-52, -30, 0, 40, 10, 0, -10, 0, 0x7dd3fc, 0.5);
    const shardR = this.scene.add.triangle(52, -30, 0, 40, -10, 0, 10, 0, 0x7dd3fc, 0.5);
    this.add([shardL, shardR, g]);
    this.core = g;
    this.shardL = shardL;
    this.shardR = shardR;
    this.parts.push(g, shardL, shardR);
  }

  /** Thorn matron — vine arms, flower core, crown. */
  buildThorn() {
    const g = this.scene.add.graphics();
    g.lineStyle(5, 0x4d7c0f, 1);
    g.lineBetween(-48, 10, -20, -20);
    g.lineBetween(48, 10, 20, -20);
    g.lineBetween(-30, 25, 0, -5);
    g.lineBetween(30, 25, 0, -5);
    g.fillStyle(0x86efac, 0.9);
    g.fillCircle(0, -8, 22);
    g.fillStyle(0x166534, 1);
    g.fillCircle(0, -8, 12);
    g.fillStyle(0xf472b6, 0.85);
    g.fillCircle(0, -32, 10);
    for (let i = -2; i <= 2; i++) {
      g.fillTriangle(i * 14, -48, i * 14 - 6, -36, i * 14 + 6, -36, 0x65a30d);
    }
    const podL = this.scene.add.ellipse(-55, 5, 16, 28, 0x4ade80, 0.6);
    const podR = this.scene.add.ellipse(55, 5, 16, 28, 0x4ade80, 0.6);
    this.add([podL, podR, g]);
    this.core = g;
    this.podL = podL;
    this.podR = podR;
    this.parts.push(g, podL, podR);
  }

  buildStorm() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x6366f1, 0.9);
    g.fillCircle(0, -25, 28);
    g.lineStyle(3, 0xc4b5fd, 1);
    g.strokeCircle(0, -25, 28);
    g.fillStyle(0xe9d5ff, 0.85);
    g.fillTriangle(0, -58, -8, -35, 8, -35);
    const arcL = this.scene.add.ellipse(-38, -10, 12, 32, 0x818cf8, 0.6);
    const arcR = this.scene.add.ellipse(38, -10, 12, 32, 0x818cf8, 0.6);
    this.add([arcL, arcR, g]);
    this.core = g;
    this.arcL = arcL;
    this.arcR = arcR;
    this.parts.push(g, arcL, arcR);
  }

  buildSand() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x78350f, 1);
    g.fillRect(-38, 0, 76, 48);
    g.fillStyle(0xb45309, 0.9);
    g.fillRect(-30, -42, 60, 46);
    g.fillStyle(0xfbbf24, 0.9);
    g.fillRect(-12, -32, 24, 12);
    g.lineStyle(3, 0xfcd34d, 0.8);
    g.strokeRect(-38, 0, 76, 48);
    const moundL = this.scene.add.ellipse(-44, 28, 22, 14, 0xd97706, 0.7);
    const moundR = this.scene.add.ellipse(44, 28, 22, 14, 0xd97706, 0.7);
    this.add([moundL, moundR, g]);
    this.core = g;
    this.moundL = moundL;
    this.moundR = moundR;
    this.parts.push(g, moundL, moundR);
  }

  buildVoid() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x2e1065, 0.95);
    g.fillCircle(0, -15, 30);
    g.fillStyle(0x4c1d95, 0.8);
    g.fillCircle(0, -15, 22);
    g.fillStyle(0xa855f7, 1);
    g.fillCircle(-9, -18, 5);
    g.fillCircle(9, -18, 5);
    g.fillStyle(0x1a0a2e, 1);
    g.fillCircle(-9, -18, 2);
    g.fillCircle(9, -18, 2);
    const ring = this.scene.add.circle(0, -15, 38, 0x7c3aed, 0.25);
    this.add([ring, g]);
    this.core = g;
    this.voidRing = ring;
    this.parts.push(g, ring);
  }

  buildReef() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x0f766e, 0.9);
    g.fillCircle(0, 0, 28);
    g.fillStyle(0x2dd4bf, 0.85);
    g.fillTriangle(0, -50, -20, -10, 20, -10);
    g.fillStyle(0x5eead4, 0.7);
    g.fillTriangle(-28, 5, -40, 30, -16, 30);
    g.fillTriangle(28, 5, 16, 30, 40, 30);
    const finL = this.scene.add.triangle(-48, 8, 0, 24, 12, 0, 0x14b8a6, 0.55);
    const finR = this.scene.add.triangle(48, 8, -12, 0, 0, 24, 0x14b8a6, 0.55);
    this.add([finL, finR, g]);
    this.core = g;
    this.finL = finL;
    this.finR = finR;
    this.parts.push(g, finL, finR);
  }

  buildEclipse() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x581c87, 0.9);
    g.fillCircle(0, -18, 32);
    g.fillStyle(0xe879f9, 0.85);
    g.fillCircle(-14, -22, 18);
    g.fillCircle(18, -20, 14);
    g.fillStyle(0xfbbf24, 0.9);
    g.fillCircle(0, -20, 8);
    const halo = this.scene.add.circle(0, -18, 42, 0xf0abfc, 0.2);
    this.add([halo, g]);
    this.core = g;
    this.eclipseHalo = halo;
    this.parts.push(g, halo);
  }

  buildPrime() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x44403c, 1);
    g.fillRect(-42, -8, 84, 52);
    g.fillStyle(0x292524, 0.95);
    g.fillRect(-34, -52, 68, 48);
    g.fillStyle(0xfef08a, 0.95);
    g.fillRect(-16, -38, 32, 20);
    g.lineStyle(3, 0xfbbf24, 0.9);
    g.strokeRect(-42, -8, 84, 52);
    const crown = this.scene.add.triangle(0, -62, 0, 0, 14, 22, -14, 22, 0xfbbf24, 0.8);
    this.add([crown, g]);
    this.core = g;
    this.crown = crown;
    this.parts.push(g, crown);
  }

  updateAnimation(time, delta) {
    if (this.defeated) {
      this.angle = Math.sin(time / 200) * 4;
      return;
    }

    this.animPhase += delta * 0.001;
    const breathe = 1 + Math.sin(time / 420) * 0.035;
    const pulse = 1 + this.attackPulse * 0.12;
    this.attackPulse = Math.max(0, this.attackPulse - delta * 0.004);

    if (this.bossType === "warden") {
      const step = Math.sin(time / 280) * 5;
      this.core.y = Math.sin(time / 500) * 2;
      this.core.angle = Math.sin(time / 900) * 1.5;
      if (this.footL) {
        this.footL.y = 34 + (step > 0 ? step * 0.5 : 0);
        this.footR.y = 34 + (step < 0 ? -step * 0.5 : 0);
      }
      const eyePulse = 0.75 + Math.sin(time / 220) * 0.25;
      this.core.setAlpha(eyePulse);
      this.setScale(breathe * pulse, breathe);
    } else if (this.bossType === "cinder") {
      const bob = Math.sin(time / 320) * 4;
      this.core.y = bob;
      this.core.angle = Math.sin(time / 400) * 6 + (this.dashing ? 8 : 0);
      const flicker = 0.88 + Math.sin(time / 90) * 0.12;
      this.core.setScale(flicker * (this.dashing ? 1.15 : 1), flicker);
      if (this.wispL) {
        this.wispL.y = Math.sin(time / 350) * 6;
        this.wispR.y = Math.cos(time / 350) * 6;
        this.wispL.angle = Math.sin(time / 280) * 12;
        this.wispR.angle = -Math.sin(time / 280) * 12;
      }
      this.setScale(breathe, breathe);
    } else if (this.bossType === "rime") {
      const sway = Math.sin(time / 600) * 3;
      this.core.y = sway;
      if (this.shardL) {
        this.shardL.angle = -8 + Math.sin(time / 450) * 10;
        this.shardR.angle = 8 - Math.sin(time / 450) * 10;
        this.shardL.y = -30 + Math.sin(time / 380) * 4;
        this.shardR.y = -30 + Math.cos(time / 380) * 4;
      }
      const chill = 0.85 + Math.sin(time / 300) * 0.15;
      this.core.setAlpha(chill);
      const slamScale = this.slamming ? 1.22 : 1;
      this.setScale(breathe * slamScale, (this.slamming ? 0.88 : breathe) * pulse);
    } else if (this.bossType === "storm") {
      this.core.angle = Math.sin(time / 200) * 8;
      if (this.arcL) {
        this.arcL.angle = Math.sin(time / 300) * 18;
        this.arcR.angle = -Math.sin(time / 300) * 18;
      }
      this.setScale(breathe * (this.dashing ? 1.1 : 1), breathe);
    } else if (this.bossType === "sand") {
      this.core.y = Math.sin(time / 500) * 2;
      const grind = 0.9 + Math.sin(time / 150) * 0.08;
      this.setScale(grind * pulse, grind * (this.slamming ? 0.85 : 1));
    } else if (this.bossType === "void") {
      if (this.voidRing) {
        this.voidRing.scale = 1 + Math.sin(time / 400) * 0.08;
        this.voidRing.alpha = 0.2 + Math.sin(time / 350) * 0.15;
      }
      this.core.angle = Math.sin(time / 800) * 4;
      this.setScale(breathe * pulse, breathe);
    } else if (this.bossType === "reef") {
      if (this.finL) {
        this.finL.angle = Math.sin(time / 400) * 12;
        this.finR.angle = -Math.sin(time / 400) * 12;
      }
      this.core.y = Math.sin(time / 450) * 4;
      this.setScale(breathe, breathe * (1 + Math.sin(time / 500) * 0.03));
    } else if (this.bossType === "eclipse") {
      if (this.eclipseHalo) {
        this.eclipseHalo.scale = 1 + Math.sin(time / 350) * 0.1;
        this.eclipseHalo.alpha = 0.15 + Math.sin(time / 280) * 0.12;
      }
      this.core.angle = Math.sin(time / 500) * 6;
      this.setScale(breathe * pulse, breathe);
    } else if (this.bossType === "prime") {
      this.core.y = Math.sin(time / 600) * 3;
      if (this.crown) this.crown.y = -62 + Math.sin(time / 400) * 4;
      this.setScale(breathe * (this.slamming ? 1.15 : 1), breathe * (this.slamming ? 0.88 : 1));
    } else {
      this.core.y = Math.sin(time / 480) * 3;
      this.core.angle = Math.sin(time / 700) * 2;
      if (this.podL) {
        const vine = Math.sin(time / 340) * 10;
        this.podL.x = -55 + vine;
        this.podR.x = 55 - vine;
        this.podL.angle = Math.sin(time / 400) * 15;
        this.podR.angle = -Math.sin(time / 400) * 15;
        this.podL.scaleY = 1 + Math.sin(time / 260) * 0.12;
        this.podR.scaleY = 1 + Math.cos(time / 260) * 0.12;
      }
      this.setScale(breathe * pulse, breathe);
    }
  }

  onPartCollected() {
    if (this.defeated || !this.emerged) return;
    this.hp -= 1;
    this.hitFlash();
    this.attackPulse = 1;
  }

  onStomp() {
    if (this.defeated || !this.emerged) return;
    this.hp -= 2;
    this.hitFlash();
    this.attackPulse = 1.2;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.25,
      scaleY: 0.75,
      duration: 100,
      yoyo: true,
      ease: "Quad.easeOut",
    });
  }

  hitFlash() {
    this.scene.tweens.add({
      targets: this.parts,
      alpha: 0.35,
      duration: 80,
      yoyo: true,
    });
  }

  checkDefeated() {
    if (this.hp <= 0 && !this.defeated) {
      this.defeated = true;
      this.body.setVelocity(0, 0);
      this.scene.tweens.add({
        targets: this,
        alpha: 0.35,
        angle: 12,
        scaleX: 0.85,
        scaleY: 0.85,
        duration: 600,
        ease: "Quad.easeOut",
      });
      this.destroySpores();
      return true;
    }
    return this.defeated;
  }

  updateBehavior(time, delta, player, worldW, groundY) {
    if (this.defeated) {
      this.updateAnimation(time, delta);
      return;
    }

    if (!this.emerged) {
      if (this.submerged) {
        this.y = this.mouthY + Math.sin(time / 280) * 4;
        this.setAlpha(0.08 + Math.sin(time / 350) * 0.06);
      }
      return;
    }

    const px = player.x;
    const innerL = this.bounds?.minX ?? 200;
    const innerR = this.bounds?.maxX ?? worldW - 200;

    if (this.bossType === "warden") {
      const target = Phaser.Math.Clamp(px, innerL, innerR);
      this.x = Phaser.Math.Linear(this.x, target, 0.018);
      this.y = groundY - 172 + Math.sin(time / 600) * 6;
    } else if (this.bossType === "cinder") {
      const hoverY = this.combatY || groundY - 160;
      this.y = hoverY + Math.sin(time / 350) * 10;
      this.dashTimer -= delta;
      this.dashing = false;
      if (this.dashTimer <= 0) {
        this.dashTimer = 2000;
        const dir = px > this.x ? 1 : -1;
        const nextX = this.x + dir * 8;
        if (nextX > innerR || nextX < innerL) {
          this.body.setVelocityX(-dir * 260);
        } else {
          this.body.setVelocityX(dir * 260);
        }
        this.dashing = true;
        this.attackPulse = 1;
        this.scene.tweens.add({
          targets: this,
          scaleX: 1.2 * dir,
          scaleY: 0.9,
          duration: 120,
          yoyo: true,
        });
      }
    } else if (this.bossType === "rime") {
      this.slamTimer -= delta;
      this.x = Phaser.Math.Linear(this.x, Phaser.Math.Clamp(px, innerL, innerR), 0.012);
      this.y = groundY - 176;
      if (this.slamTimer <= 0) {
        this.slamTimer = 2600;
        this.slamming = true;
        this.attackPulse = 1;
        const slamY = this.bounds ? Math.min(groundY - 92, this.bounds.maxY) : groundY - 92;
        this.scene.tweens.add({
          targets: this,
          y: slamY,
          duration: 160,
          yoyo: true,
          ease: "Quad.easeIn",
          onComplete: () => {
            this.slamming = false;
            this.clampToArena();
          },
        });
      }
    } else if (this.bossType === "thorn") {
      this.x = Phaser.Math.Linear(this.x, Phaser.Math.Clamp(px, innerL, innerR), 0.016);
      this.y = groundY - 166;
      this.sporeTimer -= delta;
      if (this.sporeTimer <= 0) {
        this.sporeTimer = 1300;
        this.spawnSpore(player, 0xa3e635, 0x4ade80);
        this.attackPulse = 0.8;
        this.scene.tweens.add({
          targets: this.core,
          scaleX: 1.15,
          scaleY: 0.9,
          duration: 150,
          yoyo: true,
        });
      }
    } else if (this.bossType === "storm") {
      const target = Phaser.Math.Clamp(px, innerL, innerR);
      this.x = Phaser.Math.Linear(this.x, target, 0.032);
      this.y = groundY - 168 + Math.sin(time / 280) * 14;
      this.dashTimer -= delta;
      if (this.dashTimer <= 0) {
        this.dashTimer = 1600;
        this.dashing = true;
        this.attackPulse = 0.9;
        this.body.setVelocityX((px > this.x ? 1 : -1) * 320);
      }
    } else if (this.bossType === "sand") {
      const target = Phaser.Math.Clamp(px, innerL, innerR);
      this.x = Phaser.Math.Linear(this.x, target, 0.01);
      this.y = groundY - 168;
      this.slamTimer -= delta;
      if (this.slamTimer <= 0) {
        this.slamTimer = 2800;
        this.slamming = true;
        this.attackPulse = 1;
        const slamY = this.bounds ? Math.min(groundY - 88, this.bounds.maxY) : groundY - 88;
        this.scene.tweens.add({
          targets: this,
          y: slamY,
          duration: 200,
          yoyo: true,
          ease: "Quad.easeIn",
          onComplete: () => {
            this.slamming = false;
          },
        });
      }
    } else if (this.bossType === "void") {
      this.x = Phaser.Math.Linear(this.x, Phaser.Math.Clamp(px, innerL, innerR), 0.014);
      this.y = groundY - 170 + Math.sin(time / 500) * 8;
      this.sporeTimer -= delta;
      if (this.sporeTimer <= 0) {
        this.sporeTimer = 1100;
        this.spawnSpore(player, 0xc084fc, 0x7c3aed);
        this.attackPulse = 0.85;
      }
    } else if (this.bossType === "eclipse") {
      this.x = Phaser.Math.Linear(this.x, Phaser.Math.Clamp(px, innerL, innerR), 0.02);
      this.y = groundY - 172 + Math.sin(time / 420) * 10;
      this.sporeTimer -= delta;
      if (this.sporeTimer <= 0) {
        this.sporeTimer = 900;
        this.spawnSpore(player, 0xf0abfc, 0xe879f9);
        this.attackPulse = 0.9;
      }
    } else if (this.bossType === "prime") {
      const target = Phaser.Math.Clamp(px, innerL, innerR);
      this.x = Phaser.Math.Linear(this.x, target, 0.012);
      this.y = groundY - 175;
      this.slamTimer -= delta;
      this.sporeTimer -= delta;
      if (this.slamTimer <= 0) {
        this.slamTimer = 2200;
        this.slamming = true;
        this.attackPulse = 1.1;
        const slamY = this.bounds ? Math.min(groundY - 90, this.bounds.maxY) : groundY - 90;
        this.scene.tweens.add({
          targets: this,
          y: slamY,
          duration: 180,
          yoyo: true,
          ease: "Quad.easeIn",
          onComplete: () => {
            this.slamming = false;
          },
        });
      }
      if (this.sporeTimer <= 0) {
        this.sporeTimer = 1500;
        this.spawnSpore(player, 0xfef08a, 0xfbbf24);
        this.attackPulse = 0.85;
      }
    } else {
      const wave = Math.sin(time / 700) * (innerR - innerL) * 0.22;
      const target = Phaser.Math.Clamp(px + wave, innerL, innerR);
      this.x = Phaser.Math.Linear(this.x, target, 0.015);
      this.y = groundY - 165 + Math.sin(time / 380) * 8;
      this.sporeTimer -= delta;
      if (this.sporeTimer <= 0) {
        this.sporeTimer = 1400;
        this.spawnSpore(player, 0x67e8f9, 0x2dd4bf);
        this.attackPulse = 0.75;
      }
    }

    this.clampToArena();

    this.updateSpores(delta, player);
    this.updateAnimation(time, delta);
  }

  spawnSpore(player, fill = 0xa3e635, stroke = 0x4ade80) {
    const spore = this.scene.add.circle(this.x, this.y + 8, 9, fill, 0.95);
    spore.setStrokeStyle(1, stroke, 1);
    spore.setDepth(7);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    const speed = 170;
    this.spores.push({ obj: spore, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed * 0.3 });
    this.scene.tweens.add({
      targets: spore,
      scale: 1.35,
      duration: 200,
      yoyo: true,
      repeat: -1,
    });
  }

  updateSpores(delta, player) {
    const dt = delta / 1000;
    this.spores = this.spores.filter((s) => {
      if (!s.obj.active) return false;
      s.obj.x += s.vx * dt;
      s.obj.y += s.vy * dt;
      if (Phaser.Math.Distance.Between(s.obj.x, s.obj.y, player.x, player.y - 30) < 26) {
        s.obj.destroy();
        if (this.scene.hitHazard) this.scene.hitHazard();
        return false;
      }
      if (s.obj.x < 0 || s.obj.x > 1400 || s.obj.y > 600) {
        s.obj.destroy();
        return false;
      }
      return true;
    });
  }

  destroySpores() {
    for (const s of this.spores) {
      if (s.obj?.active) s.obj.destroy();
    }
    this.spores = [];
  }
}
