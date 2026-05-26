/** Builds a compact colosseum + biome backdrop for boss fights. */

export function createBossArena(scene, layout, biome, groundY, height) {
  const { arena } = layout;
  const g = groundY;
  const worldW = layout.worldW;
  const depthBg = 0;
  const depthMid = 1;

  const wallGroup = scene.physics.add.staticGroup();

  scene.add.rectangle(worldW / 2, height * 0.38, worldW + 400, height * 0.85, arena.skyTint, 0.35).setDepth(depthBg);

  const arenaW = arena.innerRight - arena.innerLeft;
  const decorTop = Math.round(height * 0.14);
  scene.add.rectangle(worldW / 2, height * 0.32, arenaW + 80, height * 0.45, arena.floorTint, 0.22).setDepth(depthBg);
  scene.add.rectangle(worldW / 2, g + 8, arenaW, 22, arena.ringColor, 0.95).setDepth(depthMid);
  scene.add.rectangle(worldW / 2, g - 2, arenaW - 50, 6, arena.ringAccent, 0.65).setDepth(depthMid);

  const wallH = height + 80;
  const leftWall = scene.add.rectangle(arena.innerLeft - 28, height / 2, 56, wallH, arena.wallColor, 1);
  const rightWall = scene.add.rectangle(arena.innerRight + 28, height / 2, 56, wallH, arena.wallColor, 1);
  leftWall.setStrokeStyle(3, arena.wallStroke, 1);
  rightWall.setStrokeStyle(3, arena.wallStroke, 1);
  scene.physics.add.existing(leftWall, true);
  scene.physics.add.existing(rightWall, true);
  wallGroup.add(leftWall);
  wallGroup.add(rightWall);

  for (const d of arena.decor) {
    const dy = d.y > 0 ? d.y : decorTop + 18;
    scene.add.rectangle(d.x, dy, d.w, d.h, d.color, d.alpha ?? 0.7).setDepth(d.depth ?? depthBg);
  }

  scene.add
    .text(worldW / 2, 28, arena.banner ?? "BOSS ARENA", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      color: arena.bannerColor ?? "#94a3b8",
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(60);

  return { wallGroup, arenaFloor: { x: worldW / 2, y: g + 14, w: arenaW, h: 36 } };
}
