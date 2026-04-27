'use client';

import { useEffect, useRef, useState } from 'react';

// Shared bridge: React D-pad buttons write here; Phaser reads every frame
const mobileCtrl = { up: false, down: false, left: false, right: false };

type Zone = {
  name: string;
  description: string;
  emoji: string;
  route: string;
  x: number; y: number; w: number; h: number;
  floorColor: number;
  glowColor: string;
};

const ZONES: Zone[] = [
  { name: 'Math Kingdom',    description: 'Defeat Shadow Wizards & earn tokens!', emoji: '🧙‍♂️', route: '/play',   x: 80,   y: 90,  w: 310, h: 280, floorColor: 0x2e1065, glowColor: '#a78bfa' },
  { name: 'Token Emporium',  description: 'Spend your tokens on epic rewards!',   emoji: '🏪',    route: '/shop',   x: 1210, y: 90,  w: 310, h: 280, floorColor: 0x431407, glowColor: '#fbbf24' },
  { name: 'Quest Board',     description: 'Check your daily quest progress!',     emoji: '📋',    route: '/world',  x: 580,  y: 920, w: 440, h: 190, floorColor: 0x052e16, glowColor: '#34d399' },
  { name: 'Heroes Hall',     description: 'Switch champion or invite new heroes!',emoji: '⚔️',    route: '/family', x: 60,   y: 470, w: 280, h: 270, floorColor: 0x082f49, glowColor: '#06b6d4' },
];

const MAP_W = 1600;
const MAP_H = 1200;
const PLAYER_SPEED = 185;

function DpadButton({ dir, label }: { dir: keyof typeof mobileCtrl; label: string }) {
  return (
    <button
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-600/50 bg-violet-900/70 text-base font-bold text-violet-200 active:bg-violet-700/80 select-none"
      onPointerDown={(e) => { e.preventDefault(); mobileCtrl[dir] = true; }}
      onPointerUp={() => { mobileCtrl[dir] = false; }}
      onPointerLeave={() => { mobileCtrl[dir] = false; }}
    >
      {label}
    </button>
  );
}

export function WorldScene({
  playerName,
  tokenBalance,
}: {
  playerName: string;
  tokenBalance: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef      = useRef<{ destroy: (remove: boolean) => void } | null>(null);
  const [nearZone,   setNearZone]   = useState<Zone | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    let cancelled = false;

    (async () => {
      const Phaser = (await import('phaser')).default;
      if (cancelled || !containerRef.current) return;

      // ── Near-zone tracking (closured so Phaser scene can write to it) ──
      let trackedZone: Zone | null = null;

      class KingdomScene extends Phaser.Scene {
        private player!: Phaser.GameObjects.Container;
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
        private body!: Phaser.Physics.Arcade.Body;
        private zoneRects: { r: Phaser.Geom.Rectangle; zone: Zone }[] = [];
        private enterKey!: Phaser.Input.Keyboard.Key;

        constructor() { super('KingdomScene'); }

        create() {
          this.physics.world.setBounds(0, 0, MAP_W, MAP_H);
          this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);

          this.drawWorld();
          this.spawnPlayer();

          this.cameras.main.startFollow(this.player, true, 0.07, 0.07);
          this.cameras.main.setZoom(1);

          const kb = this.input.keyboard!;
          this.cursors = kb.createCursorKeys();
          this.wasd = {
            up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
          };
          this.enterKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
          kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on('down', () => trackedZone && (window.location.href = trackedZone.route));
          this.enterKey.on('down', () => trackedZone && (window.location.href = trackedZone.route));
        }

        // ── World drawing ────────────────────────────────────────────────
        drawWorld() {
          const g = this.add.graphics();

          // Base ground
          g.fillStyle(0x0e1f0e);
          g.fillRect(0, 0, MAP_W, MAP_H);

          // Subtle grass texture tiles
          g.lineStyle(1, 0x122012, 0.5);
          for (let x = 0; x < MAP_W; x += 48) g.lineBetween(x, 0, x, MAP_H);
          for (let y = 0; y < MAP_H; y += 48) g.lineBetween(0, y, MAP_W, y);

          // Zone floors
          ZONES.forEach((z) => {
            const zg = this.add.graphics();
            zg.fillStyle(z.floorColor, 0.55);
            zg.fillRoundedRect(z.x, z.y, z.w, z.h, 14);
            zg.lineStyle(2, parseInt(z.glowColor.replace('#', '0x')), 0.7);
            zg.strokeRoundedRect(z.x, z.y, z.w, z.h, 14);
            this.zoneRects.push({ r: new Phaser.Geom.Rectangle(z.x, z.y, z.w, z.h), zone: z });
          });

          // ── Central stone plaza ──
          g.fillStyle(0x3a3a4a);
          g.fillRoundedRect(550, 420, 500, 360, 18);
          // Plaza ring detail
          for (let i = 1; i <= 4; i++) {
            g.lineStyle(1, 0x5a5a6a, 0.25);
            g.strokeRoundedRect(550 + i * 18, 420 + i * 14, 500 - i * 36, 360 - i * 28, 14);
          }

          // ── Paths ──
          const pathColor = 0x5a5040;
          g.fillStyle(pathColor);
          g.fillRect(775, 220,  50, 200);   // N
          g.fillRect(775, 780,  50, 230);   // S
          g.fillRect(390, 570, 160, 48);    // W
          g.fillRect(1050, 570, 250, 48);   // E

          // Path edge lines
          g.lineStyle(1, 0x7a7060, 0.4);
          g.strokeRect(775, 220, 50, 200);
          g.strokeRect(775, 780, 50, 230);
          g.strokeRect(390, 570, 160, 48);
          g.strokeRect(1050, 570, 250, 48);

          // ── Fountain ──
          const fg = this.add.graphics();
          fg.fillStyle(0x0c2a3a);
          fg.fillCircle(800, 600, 72);
          fg.fillStyle(0x0f3e56);
          fg.fillCircle(800, 600, 55);
          fg.fillStyle(0x1a6e8c);
          fg.fillCircle(800, 600, 28);
          fg.fillStyle(0x7dd3fc, 0.9);
          fg.fillCircle(800, 600, 10);

          // Fountain ripple (animated)
          const ripple = this.add.graphics();
          ripple.lineStyle(2, 0x38bdf8, 0.5);
          ripple.strokeCircle(800, 600, 62);
          this.tweens.add({ targets: ripple, alpha: { from: 0.6, to: 0 }, scaleX: { from: 1, to: 1.4 }, scaleY: { from: 1, to: 1.4 }, duration: 2000, repeat: -1, ease: 'Sine.easeOut' });

          // Lanterns on plaza corners
          [[570, 440], [1030, 440], [570, 760], [1030, 760]].forEach(([lx, ly]) => {
            const lg = this.add.graphics();
            lg.fillStyle(0xfcd34d, 0.9);
            lg.fillCircle(lx!, ly!, 7);
            const glow = this.add.graphics();
            glow.fillStyle(0xfbbf24, 0.25);
            glow.fillCircle(lx!, ly!, 18);
            this.tweens.add({ targets: glow, alpha: { from: 0.15, to: 0.45 }, duration: 1200 + Math.random() * 600, yoyo: true, repeat: -1 });
          });

          // ── Buildings ──
          this.drawBuilding(135,  120, 200, 150, 0x5b21b6, 0x3b0764, '🧙‍♂️', 'MATH\nKINGDOM',    0xa78bfa);
          this.drawBuilding(1265, 120, 200, 150, 0xb45309, 0x451a03, '🏪',    'TOKEN\nEMPORIUM', 0xfbbf24);
          this.drawBuilding(90,   500, 170, 140, 0x0e7490, 0x082f49, '⚔️',   'HEROES\nHALL',    0x06b6d4);
          this.drawQuestBoard();

          // Mystery zone
          const myst = this.add.graphics();
          myst.fillStyle(0x0d0020, 0.75);
          myst.fillRoundedRect(1230, 720, 280, 280, 14);
          myst.lineStyle(1, 0x4c1d95, 0.5);
          myst.strokeRoundedRect(1230, 720, 280, 280, 14);
          this.add.text(1370, 860, '❓\nCOMING\nSOON', { fontSize: '15px', color: '#6d28d9', align: 'center', fontStyle: 'bold' }).setOrigin(0.5);

          // ── Trees ──
          const treeSpots = [
            [320,190],[420,220],[370,280],[480,170],[500,280],
            [1090,190],[1190,220],[1140,280],[1050,280],[1300,250],
            [260,780],[310,860],[350,930],[220,900],
            [1090,750],[1150,830],[1200,900],[1280,640],
            [600,1040],[680,1090],[730,1060],[860,1080],[950,1040],[1020,1090],
            [180,350],[150,420],[200,300],
            [1400,350],[1450,400],[1380,450],
          ];
          treeSpots.forEach(([tx, ty]) => this.drawTree(tx!, ty!));
        }

        drawBuilding(x: number, y: number, w: number, h: number, wall: number, roof: number, emoji: string, label: string, glow: number) {
          const g = this.add.graphics();
          // Drop shadow
          g.fillStyle(0x000000, 0.35);
          g.fillRoundedRect(x + 6, y + 6, w, h + 55, 10);
          // Wall
          g.fillStyle(wall);
          g.fillRoundedRect(x, y, w, h + 55, 10);
          // Roof
          g.fillStyle(roof);
          g.fillTriangle(x - 12, y + 14, x + w / 2, y - 36, x + w + 12, y + 14);
          // Window panes
          g.fillStyle(0xfef3c7, 0.85);
          g.fillRoundedRect(x + 16, y + 20, 34, 28, 5);
          g.fillRoundedRect(x + w - 50, y + 20, 34, 28, 5);
          // Door (slightly ajar visual)
          g.fillStyle(0x0a0618);
          g.fillRoundedRect(x + w / 2 - 19, y + h + 14, 38, 54, 5);
          // Animated glow on door
          const glowG = this.add.graphics();
          glowG.fillStyle(glow, 0.4);
          glowG.fillRoundedRect(x + w / 2 - 19, y + h + 14, 38, 54, 5);
          this.tweens.add({ targets: glowG, alpha: { from: 0.2, to: 0.8 }, duration: 1100 + Math.random() * 500, yoyo: true, repeat: -1 });

          this.add.text(x + w / 2, y + 8, emoji, { fontSize: '30px' }).setOrigin(0.5, 0);
          this.add.text(x + w / 2, y + h - 8, label, { fontSize: '11px', color: '#f1f5f9', align: 'center', fontStyle: 'bold', lineSpacing: 2 }).setOrigin(0.5, 0);
        }

        drawQuestBoard() {
          const x = 610, y = 940, w = 380, h = 130;
          const g = this.add.graphics();
          // Pavilion posts
          [[x + 20, y], [x + w - 20, y]].forEach(([px, py]) => {
            g.fillStyle(0x854d0e);
            g.fillRect(px! - 6, py!, 12, h + 20);
          });
          // Roof
          g.fillStyle(0x166534);
          g.fillTriangle(x - 10, y + 18, x + w / 2, y - 28, x + w + 10, y + 18);
          // Board face
          g.fillStyle(0x92400e);
          g.fillRoundedRect(x + 30, y + 10, w - 60, h - 10, 6);
          g.fillStyle(0xfef9c3, 0.9);
          g.fillRoundedRect(x + 38, y + 18, w - 76, h - 26, 4);
          this.add.text(x + w / 2, y + 55, '📋 QUEST BOARD\nDaily Challenges', { fontSize: '12px', color: '#1e3a1e', align: 'center', fontStyle: 'bold', lineSpacing: 4 }).setOrigin(0.5);
        }

        drawTree(x: number, y: number) {
          const g = this.add.graphics();
          g.fillStyle(0x5c3a1a);
          g.fillRect(x - 5, y, 10, 22);
          g.fillStyle(0x14532d, 0.9);
          g.fillTriangle(x - 20, y, x, y - 36, x + 20, y);
          g.fillStyle(0x166534);
          g.fillTriangle(x - 15, y - 16, x, y - 48, x + 15, y - 16);
          g.fillStyle(0x15803d);
          g.fillTriangle(x - 11, y - 30, x, y - 58, x + 11, y - 30);
        }

        // ── Player ──────────────────────────────────────────────────────
        spawnPlayer() {
          const g = this.add.graphics();
          // Shadow
          g.fillStyle(0x000000, 0.28);
          g.fillEllipse(0, 22, 38, 14);
          // Body
          g.fillStyle(0x0891b2);
          g.fillCircle(0, 0, 22);
          // Outer ring
          g.lineStyle(3, 0xa78bfa);
          g.strokeCircle(0, 0, 22);
          // Shine
          g.fillStyle(0x67e8f9, 0.55);
          g.fillCircle(-7, -8, 8);
          // Emoji face
          const face = this.add.text(0, 0, '🧙‍♂️', { fontSize: '20px' }).setOrigin(0.5, 0.55);

          const tag = this.add.text(0, 30, playerName, {
            fontSize: '10px', color: '#e2e8f0',
            backgroundColor: '#1a0a2ecc', padding: { x: 4, y: 2 },
          }).setOrigin(0.5, 0);

          this.player = this.add.container(800, 560, [g, face, tag]);
          this.physics.add.existing(this.player);
          this.body = this.player.body as Phaser.Physics.Arcade.Body;
          this.body.setCollideWorldBounds(true);
          this.body.setSize(40, 40);
          this.body.setOffset(-20, -20);
        }

        // ── Update loop ──────────────────────────────────────────────────
        update() {
          const up    = this.cursors.up.isDown    || this.wasd.up.isDown    || mobileCtrl.up;
          const down  = this.cursors.down.isDown  || this.wasd.down.isDown  || mobileCtrl.down;
          const left  = this.cursors.left.isDown  || this.wasd.left.isDown  || mobileCtrl.left;
          const right = this.cursors.right.isDown || this.wasd.right.isDown || mobileCtrl.right;

          this.body.setVelocity(0, 0);
          if (left)  this.body.setVelocityX(-PLAYER_SPEED);
          if (right) this.body.setVelocityX(PLAYER_SPEED);
          if (up)    this.body.setVelocityY(-PLAYER_SPEED);
          if (down)  this.body.setVelocityY(PLAYER_SPEED);
          if ((left || right) && (up || down)) this.body.velocity.scale(0.707);

          // Zone proximity (expand zone rect by 70px for "near" detection)
          const px = this.player.x, py = this.player.y;
          let found: Zone | null = null;
          for (const { r, zone } of this.zoneRects) {
            if (Phaser.Geom.Rectangle.Contains(
              new Phaser.Geom.Rectangle(r.x - 70, r.y - 70, r.width + 140, r.height + 140), px, py
            )) { found = zone; break; }
          }
          if (found !== trackedZone) {
            trackedZone = found;
            setNearZone(found);
          }
        }
      }

      const game = new Phaser.Game({
        type:            Phaser.AUTO,
        width:           containerRef.current!.clientWidth || 800,
        height:          520,
        parent:          containerRef.current!,
        backgroundColor: '#0e1f0e',
        physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
        scene:           KingdomScene,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      });

      gameRef.current = game;
    })();

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      // Reset mobile controls so they don't leak between mounts
      Object.keys(mobileCtrl).forEach((k) => { (mobileCtrl as Record<string, boolean>)[k] = false; });
    };
  }, [playerName]);

  return (
    <div className="relative">
      {/* Token HUD */}
      <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-xl border border-brand-gold/40 bg-black/70 px-3 py-2 backdrop-blur-sm">
        <span className="text-lg">✨</span>
        <span className="text-base font-black text-brand-gold">{tokenBalance}</span>
        <span className="text-xs text-brand-gold/60">tokens</span>
      </div>

      {/* Phaser canvas */}
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-2xl border border-violet-800/40 shadow-2xl"
        style={{ height: 520 }}
      />

      {/* Zone enter prompt */}
      {nearZone && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center z-20">
          <div className="animate-slide-up rounded-2xl border border-violet-600/60 bg-violet-950/95 px-6 py-3 text-center shadow-2xl backdrop-blur-md">
            <p className="text-base font-black text-white">{nearZone.emoji} {nearZone.name}</p>
            <p className="mt-0.5 text-xs text-violet-300/70">{nearZone.description}</p>
            <a
              href={nearZone.route}
              className="pointer-events-auto mt-2 inline-block rounded-lg bg-gradient-to-r from-violet-600 to-brand-neon px-4 py-1.5 text-xs font-black text-white shadow-md transition hover:scale-105"
            >
              ⚡ Enter (E / ENTER)
            </a>
          </div>
        </div>
      )}

      {/* Mobile D-pad */}
      <div className="absolute bottom-3 right-3 z-20 grid grid-cols-3 gap-1">
        <div /><DpadButton dir="up"    label="▲" /><div />
        <DpadButton dir="left"  label="◀" />
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-800/30 bg-violet-950/40 text-xs text-violet-500">ok</div>
        <DpadButton dir="right" label="▶" />
        <div /><DpadButton dir="down"  label="▼" /><div />
      </div>

      {/* Controls hint (desktop) */}
      <p className="mt-2 text-center text-xs text-violet-600/50">
        WASD / ↑↓←→ to move &nbsp;•&nbsp; E or ENTER to enter a zone
      </p>
    </div>
  );
}
