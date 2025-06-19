import type { Tent as TentType } from '../../../types/game'
import './styles.css'

interface TentProps {
  tent: TentType
  width: number
  height: number
}

export const Tent = ({ tent, width, height }: TentProps) => {
  const drawTent = (ctx: CanvasRenderingContext2D) => {
    const { x, y, width: tentWidth, height: tentHeight } = tent

    // Draw tent base
    ctx.fillStyle = '#8B4513'  // Brown color
    ctx.fillRect(x, y + tentHeight * 0.7, tentWidth, tentHeight * 0.3)

    // Draw tent top
    ctx.fillStyle = '#DEB887'  // Tan color
    ctx.beginPath()
    ctx.moveTo(x, y + tentHeight * 0.7)
    ctx.lineTo(x + tentWidth/2, y)
    ctx.lineTo(x + tentWidth, y + tentHeight * 0.7)
    ctx.closePath()
    ctx.fill()

    // Draw tent door
    ctx.fillStyle = '#000000'  // Black color
    ctx.fillRect(
      x + tentWidth * 0.4,
      y + tentHeight * 0.5,
      tentWidth * 0.2,
      tentHeight * 0.2
    )
  }

  return (
    <div className="tent-container" style={{ width, height }}>
      <canvas
        ref={(canvas) => {
          if (canvas) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.clearRect(0, 0, width, height)
              drawTent(ctx)
            }
          }
        }}
        width={width}
        height={height}
      />
    </div>
  )
} 