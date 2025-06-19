import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameLoop } from '../../../hooks/useGameLoop';
import { GameCanvas } from '../GameCanvas';
import { Player } from '../Player';
import { Bullet } from '../Bullet';
import { Orca } from '../Orca';
import { OrcaGuts } from '../OrcaGuts';
import { Tent } from '../Tent';
import { Tree } from '../Tree';
import { Scoreboard } from '../Scoreboard';
import { GameOver } from '../GameOver';
import type { Player as PlayerType, Bullet as BulletType, Orca as OrcaType, OrcaGuts as OrcaGutsType, Tree as TreeType, Tent as TentType } from '../../../types/game';
import { checkBulletOrcaCollision, checkPlayerOrcaCollision } from '../../../utils/collision';
import './styles.css';

const GAME_WIDTH = 1200;
const GAME_HEIGHT = 800;
const MAX_ORCAS = 3;
const ORCA_SPAWN_INTERVAL = 5000; // 5 seconds between spawns

export const Game = () => {
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameStateRef = useRef({
    score: 0,
    lastUpdate: 0,
    lastOrcaSpawn: 0
  });

  // Game entities
  const playerRef = useRef<PlayerType>({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    size: 20,
    speed: 5,
    lastShot: 0,
    shootCooldown: 250
  });
  const bulletsRef = useRef<BulletType[]>([]);
  const orcasRef = useRef<OrcaType[]>([]);
  const orcaGutsRef = useRef<OrcaGutsType[]>([]);
  const treesRef = useRef<TreeType[]>([
    { position: { x: 100, y: 100 }, size: 40 },
    { position: { x: 300, y: 200 }, size: 50 },
    { position: { x: 500, y: 150 }, size: 45 }
  ]);
  const tentRef = useRef<TentType>({
    x: GAME_WIDTH - 150,
    y: 100,
    width: 100,
    height: 80
  });

  // Input handling
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && gameOver) {
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [gameOver]);

  const handleRestart = useCallback(() => {
    setGameOver(false);
    gameStateRef.current = {
      score: 0,
      lastUpdate: 0,
      lastOrcaSpawn: 0
    };
    setScore(0);
    orcasRef.current = [];
    orcaGutsRef.current = [];
    bulletsRef.current = [];
    playerRef.current = {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      size: 20,
      speed: 5,
      lastShot: 0,
      shootCooldown: 250
    };
  }, []);

  const updateGame = useCallback(() => {
    if (gameOver) return;

    const now = Date.now();
    const player = playerRef.current;
    const bullets = bulletsRef.current;
    const orcas = orcasRef.current;
    const orcaGuts = orcaGutsRef.current;
    const keys = keysRef.current;

    // Update player position
    if (keys.has('w') || keys.has('arrowup')) {
      player.y -= player.speed;
    }
    if (keys.has('s') || keys.has('arrowdown')) {
      player.y += player.speed;
    }
    if (keys.has('a') || keys.has('arrowleft')) {
      player.x -= player.speed;
    }
    if (keys.has('d') || keys.has('arrowright')) {
      player.x += player.speed;
    }

    // Keep player in bounds
    player.x = Math.max(player.size, Math.min(GAME_WIDTH - player.size, player.x));
    player.y = Math.max(player.size, Math.min(GAME_HEIGHT - player.size, player.y));

    // Handle shooting
    if (keys.has(' ') && now - player.lastShot >= player.shootCooldown) {
      const bullet: BulletType = {
        x: player.x,
        y: player.y,
        direction: { x: 1, y: 0 }, // Default direction, will be updated based on player's aim
        speed: 10,
        size: 5,
        active: true
      };
      bullets.push(bullet);
      player.lastShot = now;
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.x += bullet.direction.x * bullet.speed;
      bullet.y += bullet.direction.y * bullet.speed;

      // Remove bullets that go off screen
      if (bullet.x < -bullet.size || bullet.x > GAME_WIDTH + bullet.size ||
          bullet.y < -bullet.size || bullet.y > GAME_HEIGHT + bullet.size) {
        bullets.splice(i, 1);
      }
    }

    // Spawn orcas
    if (now - gameStateRef.current.lastOrcaSpawn >= ORCA_SPAWN_INTERVAL && orcas.length < MAX_ORCAS) {
      const side = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;
      let directionX = 0;
      let directionY = 0;

      switch (side) {
        case 0: // top
          x = Math.random() * GAME_WIDTH;
          y = -50;
          directionY = 1;
          break;
        case 1: // right
          x = GAME_WIDTH + 50;
          y = Math.random() * GAME_HEIGHT;
          directionX = -1;
          break;
        case 2: // bottom
          x = Math.random() * GAME_WIDTH;
          y = GAME_HEIGHT + 50;
          directionY = -1;
          break;
        case 3: // left
          x = -50;
          y = Math.random() * GAME_HEIGHT;
          directionX = 1;
          break;
      }

      orcas.push({
        x,
        y,
        size: 40,
        speed: 2,
        direction: { x: directionX, y: directionY },
        active: true,
        spawnTime: now,
        phase: 'emerging'
      });

      gameStateRef.current.lastOrcaSpawn = now;
    }

    // Update orcas
    for (let i = orcas.length - 1; i >= 0; i--) {
      const orca = orcas[i];
      if (!orca.active) {
        orcas.splice(i, 1);
        continue;
      }

      const timeSinceSpawn = now - orca.spawnTime;

      // Update orca phase
      if (orca.phase === 'emerging' && timeSinceSpawn > 1000) {
        orca.phase = 'swimming';
        const angle = Math.random() * Math.PI * 2;
        orca.direction.x = Math.cos(angle);
        orca.direction.y = Math.sin(angle);
      } else if (orca.phase === 'swimming' && timeSinceSpawn > 8000) {
        orca.phase = 'submerging';
        const toEdgeX = orca.x < GAME_WIDTH/2 ? -1 : 1;
        const toEdgeY = orca.y < GAME_HEIGHT/2 ? -1 : 1;
        orca.direction.x = toEdgeX;
        orca.direction.y = toEdgeY;
      }

      // Update orca position
      orca.x += orca.direction.x * orca.speed;
      orca.y += orca.direction.y * orca.speed;

      // Remove orcas that go off screen
      if (orca.x < -100 || orca.x > GAME_WIDTH + 100 ||
          orca.y < -100 || orca.y > GAME_HEIGHT + 100) {
        orcas.splice(i, 1);
      }
    }

    // Update orca guts
    for (let i = orcaGuts.length - 1; i >= 0; i--) {
      const guts = orcaGuts[i];
      const timeSinceCreation = now - guts.createdAt;

      // Update each piece's position
      guts.pieces.forEach(piece => {
        piece.x += piece.direction.x;
        piece.y += piece.direction.y;
        piece.direction.y += 0.1; // Gravity
        piece.rotation += 0.05 * (Math.random() - 0.5);
        piece.direction.x *= 0.98;
        piece.direction.y *= 0.98;
      });

      // Remove guts after 3 seconds
      if (timeSinceCreation > 3000) {
        orcaGuts.splice(i, 1);
      }
    }

    // Check collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      for (let j = orcas.length - 1; j >= 0; j--) {
        const orca = orcas[j];
        if (checkBulletOrcaCollision(bullet, orca)) {
          // Create orca guts
          orcaGuts.push({
            x: orca.x,
            y: orca.y,
            size: orca.size,
            rotation: Math.random() * Math.PI * 2,
            pieces: Array.from({ length: 15 }, (_, i) => {
              const angle = (Math.PI * 2 * i) / 15;
              const speed = Math.random() * 4 + 2;
              const pieceSize = (Math.random() * 0.5 + 0.5) * (orca.size / 3);
              return {
                x: 0,
                y: 0,
                size: pieceSize,
                rotation: Math.random() * Math.PI * 2,
                speed,
                direction: {
                  x: Math.cos(angle) * speed * (Math.random() * 0.5 + 0.75),
                  y: Math.sin(angle) * speed * (Math.random() * 0.5 + 0.75)
                },
                color: Math.random() > 0.5 ? '#8B0000' : '#4B0000',
                shape: Math.random() > 0.5 ? 'circle' : 'splat'
              };
            }),
            createdAt: now
          });

          bullets.splice(i, 1);
          orcas.splice(j, 1);

          // Update score
          gameStateRef.current.score += 100;
          if (now - gameStateRef.current.lastUpdate > 100) {
            setScore(gameStateRef.current.score);
            gameStateRef.current.lastUpdate = now;
          }
          break;
        }
      }
    }

    // Check player-orca collisions
    for (const orca of orcas) {
      if (checkPlayerOrcaCollision(player, orca)) {
        setGameOver(true);
        return;
      }
    }
  }, [gameOver]);

  // Set up game loop
  useGameLoop(updateGame);

  return (
    <div className="game-container">
      <GameCanvas
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        onCanvasReady={() => {
          // Canvas is ready, but we don't need to do anything here
          // as the game loop handles all drawing
        }}
      />
      <Player player={playerRef.current} width={GAME_WIDTH} height={GAME_HEIGHT} />
      {bulletsRef.current.map((bullet, index) => (
        <Bullet key={`bullet-${index}`} bullet={bullet} width={GAME_WIDTH} height={GAME_HEIGHT} />
      ))}
      {orcasRef.current.map((orca, index) => (
        <Orca key={`orca-${index}`} orca={orca} width={GAME_WIDTH} height={GAME_HEIGHT} />
      ))}
      {orcaGutsRef.current.map((guts, index) => (
        <OrcaGuts key={`guts-${guts.createdAt}-${index}`} guts={guts} width={GAME_WIDTH} height={GAME_HEIGHT} />
      ))}
      {treesRef.current.map((tree, index) => (
        <Tree key={`tree-${index}`} tree={tree} width={GAME_WIDTH} height={GAME_HEIGHT} />
      ))}
      <Tent tent={tentRef.current} width={GAME_WIDTH} height={GAME_HEIGHT} />
      <Scoreboard score={score} width={GAME_WIDTH} height={GAME_HEIGHT} />
      {gameOver && (
        <GameOver
          score={score}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}; 