import './styles.css';

interface ScoreboardProps {
  score: number;
  width: number;
  height: number;
}

export const Scoreboard = ({ score, width, height }: ScoreboardProps) => {
  const drawScoreboard = (ctx: CanvasRenderingContext2D) => {
    // Draw scoreboard background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width - 200, 20, 180, 60);
    
    // Draw score text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Orcas Destroyed: ${Math.floor(score/100)}`, width - 30, 45);
    ctx.fillText(`Score: ${score}`, width - 30, 75);
  };

  return (
    <div className="scoreboard-container" style={{ width, height }}>
      <canvas
        ref={(canvas) => {
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, width, height);
              drawScoreboard(ctx);
            }
          }
        }}
        width={width}
        height={height}
      />
    </div>
  );
}; 