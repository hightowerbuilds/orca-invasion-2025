import './styles.css';

interface GameOverProps {
  score: number;
  width: number;
  height: number;
  onRestart: () => void;
}

export const GameOver = ({ score, width, height, onRestart }: GameOverProps) => {
  const drawGameOver = (ctx: CanvasRenderingContext2D) => {
    // Semi-transparent black overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    // Game over text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ORCA GOT YOU!', width/2, height/2 - 50);

    // Score text
    ctx.font = '36px Arial';
    ctx.fillText(`Orcas Destroyed: ${score/100}`, width/2, height/2 + 20);

    // Restart instructions
    ctx.font = '24px Arial';
    ctx.fillText('Press R to Try Again', width/2, height/2 + 80);
  };

  return (
    <div className="game-over-container" style={{ width, height }}>
      <canvas
        ref={(canvas) => {
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, width, height);
              drawGameOver(ctx);
            }
          }
        }}
        width={width}
        height={height}
      />
      <button className="restart-button" onClick={onRestart}>
        Try Again
      </button>
    </div>
  );
}; 