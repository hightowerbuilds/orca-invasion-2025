import type { OrcaGuts as OrcaGutsType, OrcaGutsPiece } from '../../../types/game';
import './styles.css';

interface OrcaGutsProps {
  guts: OrcaGutsType;
  width: number;
  height: number;
}

export const OrcaGuts = ({ guts, width, height }: OrcaGutsProps) => {
  const drawGuts = (ctx: CanvasRenderingContext2D) => {
    const { x, y, size, rotation, pieces } = guts;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Draw each piece of guts
    pieces.forEach(piece => {
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);

      // Draw the piece based on its shape
      if (piece.shape === 'circle') {
        // Draw a circular piece
        ctx.fillStyle = piece.color;
        ctx.beginPath();
        ctx.arc(0, 0, piece.size, 0, Math.PI * 2);
        ctx.fill();

        // Add a darker center
        ctx.fillStyle = '#2B0000';
        ctx.beginPath();
        ctx.arc(0, 0, piece.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw a splat shape
        ctx.fillStyle = piece.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, piece.size, piece.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add some splatter details
        ctx.fillStyle = '#2B0000';
        for (let i = 0; i < 3; i++) {
          const angle = (Math.PI * 2 * i) / 3;
          const detailX = Math.cos(angle) * piece.size * 0.3;
          const detailY = Math.sin(angle) * piece.size * 0.3;
          ctx.beginPath();
          ctx.arc(detailX, detailY, piece.size * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    });

    ctx.restore();
  };

  return (
    <div className="orca-guts-container" style={{ width, height }}>
      <canvas
        ref={(canvas) => {
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, width, height);
              drawGuts(ctx);
            }
          }
        }}
        width={width}
        height={height}
      />
    </div>
  );
};

export const createOrcaGuts = (
  x: number,
  y: number,
  size: number
): OrcaGutsType => {
  const pieces: OrcaGutsPiece[] = [];
  const numPieces = 15;

  // Create multiple pieces of guts with more variation
  for (let i = 0; i < numPieces; i++) {
    const angle = (Math.PI * 2 * i) / numPieces;
    const speed = Math.random() * 4 + 2;
    const pieceSize = (Math.random() * 0.5 + 0.5) * (size / 3);
    pieces.push({
      x: 0,
      y: 0,
      size: pieceSize,
      rotation: Math.random() * Math.PI * 2,
      speed: speed,
      direction: {
        x: Math.cos(angle) * speed * (Math.random() * 0.5 + 0.75),
        y: Math.sin(angle) * speed * (Math.random() * 0.5 + 0.75)
      },
      color: Math.random() > 0.5 ? '#8B0000' : '#4B0000',
      shape: Math.random() > 0.5 ? 'circle' : 'splat'
    });
  }

  return {
    x,
    y,
    size,
    rotation: Math.random() * Math.PI * 2,
    pieces,
    createdAt: Date.now()
  };
}; 