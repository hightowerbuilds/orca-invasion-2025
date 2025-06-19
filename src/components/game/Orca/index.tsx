import type { Orca as OrcaType, Position } from '../../../types/game'
import { calculateAngle, calculateDirection } from '../../../utils/physics'
import './styles.css'

interface OrcaProps {
  orca: OrcaType
  width: number
  height: number
  currentTime: number
}

export const Orca = ({ orca, width, height, currentTime }: OrcaProps) => {
  const updatePhase = (): OrcaType => {
    const newOrca = { ...orca }
    const timeSinceSpawn = currentTime - orca.spawnTime

    if (orca.phase === 'emerging' && timeSinceSpawn > 1000) {
      newOrca.phase = 'swimming'
      // Set new random direction for swimming
      const angle = Math.random() * Math.PI * 2
      newOrca.direction = calculateDirection(angle)
    } else if (orca.phase === 'swimming' && timeSinceSpawn > 8000) {
      newOrca.phase = 'submerging'
      // Set direction towards nearest edge
      const toEdgeX = orca.x < width/2 ? -1 : 1
      const toEdgeY = orca.y < height/2 ? -1 : 1
      newOrca.direction = calculateDirection(calculateAngle(toEdgeX, toEdgeY))
    }

    return newOrca
  }

  const updatePosition = (): OrcaType | null => {
    const newOrca = updatePhase()
    newOrca.x += newOrca.direction.x * newOrca.speed
    newOrca.y += newOrca.direction.y * newOrca.speed

    // Remove orca if it's gone off screen
    if (newOrca.x < -100 || newOrca.x > width + 100 || 
        newOrca.y < -100 || newOrca.y > height + 100) {
      return null
    }

    return newOrca
  }

  const drawOrca = (ctx: CanvasRenderingContext2D) => {
    // Don't draw inactive orcas
    if (!orca.active) return;

    const { x, y, size } = orca;
    
    // Save context for rotation
    ctx.save();
    ctx.translate(x, y);
    
    // Calculate rotation angle based on direction
    const angle = Math.atan2(orca.direction.y, orca.direction.x);
    ctx.rotate(angle);

    // Draw orca body (black oval)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size/2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw white patch
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-size/4, -size/6, size/4, size/6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw dorsal fin
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(size/2, -size/4);
    ctx.lineTo(size/2 + size/3, -size/2);
    ctx.lineTo(size/2, -size/3);
    ctx.closePath();
    ctx.fill();

    // Draw tail
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(-size - size/2, -size/3);
    ctx.lineTo(-size - size/2, size/3);
    ctx.closePath();
    ctx.fill();

    // Draw phase-specific effects
    if (orca.phase === 'emerging') {
      // Draw water splash
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(0, size/2, size, 0, Math.PI * 2);
      ctx.fill();
    } else if (orca.phase === 'submerging') {
      // Draw ripple effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, size/2, size * 1.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  return (
    <div className="orca-container" style={{ width, height }}>
      <canvas
        ref={(canvas) => {
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, width, height);
              drawOrca(ctx);
            }
          }
        }}
        width={width}
        height={height}
      />
    </div>
  );
}

export const createOrca = (
  x: number,
  y: number,
  direction: Position,
  size: number = 40,
  speed: number = 2
): OrcaType => {
  return {
    x,
    y,
    size,
    speed,
    direction,
    active: true,
    spawnTime: Date.now(),
    phase: 'emerging'
  }
} 