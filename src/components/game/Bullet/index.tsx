import type { Bullet as BulletType } from '../../../types/game';
import './styles.css';

interface BulletProps {
  bullet: BulletType;
  width: number;
  height: number;
}

export const Bullet = ({ bullet, width, height }: BulletProps) => {
  const drawBullet = (ctx: CanvasRenderingContext2D) => {
    if (!bullet.active) return;

    const { x, y, size } = bullet;
    
    // Draw bullet as a small circle
    ctx.fillStyle = '#FFD700'; // Gold color
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Add a glow effect
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  return (
    <div className="bullet-container" style={{ width, height }}>
      <canvas
        ref={(canvas) => {
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, width, height);
              drawBullet(ctx);
            }
          }
        }}
        width={width}
        height={height}
      />
    </div>
  );
}; 