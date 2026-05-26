import Phaser from "phaser";
import GameScene from "./scenes/GameScene.js";
import WorldMapScene from "./scenes/WorldMapScene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#0a1220",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540,
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [WorldMapScene, GameScene],
};

try {
  const game = new Phaser.Game(config);
  window.__evoGame = game;
  const hideLoader = () => {
    const el = document.getElementById("loading");
    if (el) el.style.display = "none";
  };
  game.events.once("ready", hideLoader);
  setTimeout(hideLoader, 3000);
} catch (err) {
  console.error(err);
  const el = document.getElementById("loading");
  if (el) {
    el.textContent = `Game failed to start: ${err.message}`;
    el.style.color = "#f87171";
  }
}
