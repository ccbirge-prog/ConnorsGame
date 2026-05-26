import Phaser from "phaser";

export const STAGE = { HEAD: 0, TORSO: 1, ARMS: 2, LEGS: 3 };

/** Small, light stick figure — fits tight platforms; collider matches draw scale. */
const S = 0.58;
const LINE = 0xa5f3fc;
const LINE_W = 2;

export default class StickFigure extends Phaser.GameObjects.Graphics {
  constructor(scene, x, y) {
    super(scene);
    scene.add.existing(this);
    this.setPosition(x, y);

    this.bodyStage = STAGE.HEAD;
    this.hasEyes = false;
    this.hasHeart = false;

    this.HEAD_R = 14 * S;
    this.neckY = -108 * S;
    this.shoulderY = -98 * S;
    this.hipY = -68 * S;
    this.kneeY = -38 * S;
    this.footY = 0;

    this.facing = 1;
    this.animPhase = 0;
    this.walkSwing = 0;
    this.airborne = false;
    this.rising = false;
    this.landSquash = 0;
    this.idleBob = 0;

    this.redraw();
  }

  get hasLegs() {
    return this.bodyStage >= STAGE.LEGS;
  }

  setBodyStage(stage) {
    this.bodyStage = Phaser.Math.Clamp(stage, STAGE.HEAD, STAGE.LEGS);
    this.redraw();
  }

  getHeadCenterY() {
    return this.neckY - this.HEAD_R - 4 + this.idleBob;
  }

  /** Chest height for pickup / hazard tests. */
  getCollectAnchorY() {
    return this.y - 32 * S;
  }

  /**
   * @param {number} delta
   * @param {{ vx: number, vy: number, onGround: boolean, landed?: boolean }} motion
   */
  updateAnimation(delta, motion) {
    const { vx, vy, onGround, landed } = motion;

    if (Math.abs(vx) > 12) {
      this.facing = vx > 0 ? 1 : -1;
    }
    this.setScale(this.facing, 1);

    this.airborne = !onGround;
    this.rising = vy < -40;

    const moving = onGround && Math.abs(vx) > 20;
    if (moving) {
      this.animPhase += delta * 0.014;
    } else {
      this.animPhase += delta * 0.005;
    }

    const walkSpeed = moving ? 1 : 0.22;
    this.walkSwing = Math.sin(this.animPhase) * walkSpeed;
    this.idleBob = Math.sin(this.animPhase * 0.7) * (moving ? 1.5 : 2.5) * S;

    if (landed) {
      this.landSquash = 1;
    }
    if (this.landSquash > 0) {
      this.landSquash = Math.max(0, this.landSquash - delta * 0.006);
    }

    this.redraw();
  }

  redraw() {
    this.clear();
    const squash = this.landSquash;
    const stretchY = 1 - squash * 0.12;
    const stretchX = 1 + squash * 0.06;
    const headCy = this.getHeadCenterY();
    const armReach = 36 * S;
    const armDrop = 36 * S;
    const legSpread = 18 * S;
    const swing = this.walkSwing;
    const jumpTuck = this.airborne && this.rising ? 1 : 0;
    const fallSpread = this.airborne && !this.rising ? 0.65 : 0;

    this.lineStyle(LINE_W, LINE, 1);
    this.strokeCircle(0, headCy, this.HEAD_R * stretchX);

    if (this.bodyStage < STAGE.TORSO) {
      this.lineStyle(1.5, 0x64748b, 0.45);
      const spineLen = (this.footY - this.neckY) * stretchY;
      this.lineBetween(0, this.neckY + this.idleBob * 0.3, 0, this.neckY + spineLen);
    }

    if (this.hasEyes) {
      this.fillStyle(0x22d3ee, 1);
      this.fillCircle(4 * S, headCy - 2, 2.5);
      this.fillCircle(-4 * S, headCy - 2, 2.5);
    }

    if (this.bodyStage < STAGE.TORSO) return;

    const torsoTop = this.neckY + this.idleBob * 0.25;
    const torsoBot = this.hipY + jumpTuck * 10 * S;
    this.lineStyle(LINE_W, LINE, 1);
    this.lineBetween(0, torsoTop, 0, torsoBot);

    if (this.hasHeart) {
      const pulse = 1 + Math.sin(this.animPhase * 2) * 0.12;
      this.fillStyle(0xf472b6, 1);
      this.fillCircle(0, (torsoTop + torsoBot) / 2, 5 * S * pulse);
    }

    if (this.bodyStage < STAGE.ARMS) return;

    const sy = this.shoulderY + this.idleBob * 0.2;
    let armLiftL = 0;
    let armLiftR = 0;
    if (this.airborne) {
      armLiftL = this.rising ? -22 * S : 8 * S;
      armLiftR = this.rising ? -22 * S : 8 * S;
    } else {
      armLiftL = -swing * 14 * S;
      armLiftR = swing * 14 * S;
    }

    this.lineBetween(0, sy, -armReach, sy + armDrop + armLiftL);
    this.lineBetween(0, sy, armReach, sy + armDrop + armLiftR);

    if (this.bodyStage < STAGE.LEGS) return;

    const hip = torsoBot;
    let lx = -legSpread - swing * 12 * S + fallSpread * 6 * S;
    let rx = legSpread + swing * 12 * S - fallSpread * 6 * S;
    let ly = this.footY;
    let ry = this.footY;
    if (jumpTuck > 0) {
      lx = -legSpread * 0.55;
      rx = legSpread * 0.55;
      ly = this.kneeY + 8 * S;
      ry = this.kneeY + 8 * S;
      this.lineBetween(0, hip, lx, ly);
      this.lineBetween(lx, ly, lx * 0.7, this.footY - 4 * S);
      this.lineBetween(0, hip, rx, ry);
      this.lineBetween(rx, ry, rx * 0.7, this.footY - 4 * S);
    } else {
      ly += Math.abs(swing) * 4 * S * (1 - fallSpread);
      ry += Math.abs(swing) * 4 * S * (1 - fallSpread);
      this.lineBetween(0, hip, lx, ly);
      this.lineBetween(0, hip, rx, ry);
    }
  }

  getColliderSize() {
    if (this.bodyStage >= STAGE.LEGS) return { w: 30, h: 78 };
    if (this.bodyStage >= STAGE.ARMS) return { w: 28, h: 70 };
    if (this.bodyStage >= STAGE.TORSO) return { w: 20, h: 64 };
    return { w: 18, h: 34 };
  }
}
