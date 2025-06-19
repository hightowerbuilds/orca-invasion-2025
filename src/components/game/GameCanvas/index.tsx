import { useRef, useEffect } from 'react';
import './styles.css';

interface GameCanvasProps {
  width: number;
  height: number;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

export const GameCanvas = ({ width, height, onCanvasReady }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Draw initial background
    const createLandGradient = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#2ecc71');   // Light green for top
      gradient.addColorStop(0.5, '#27ae60'); // Medium green for middle
      gradient.addColorStop(1, '#219a52');   // Dark green for bottom
      return gradient;
    };

    ctx.fillStyle = createLandGradient();
    ctx.fillRect(0, 0, width, height);

    // Notify parent component that canvas is ready
    onCanvasReady(canvas);
  }, [width, height, onCanvasReady]);

  return (
    <div className="game-canvas-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="game-canvas"
      />
    </div>
  );
}; 