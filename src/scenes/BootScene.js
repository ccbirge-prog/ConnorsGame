import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create() {
    // Legacy scene — main.js starts WorldMapScene directly.
    this.scene.start("WorldMapScene");
  }
}
