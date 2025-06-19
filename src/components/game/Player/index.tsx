import type { Player as PlayerType, Position } from '../../../types/game'
import { normalizeVector } from '../../../utils/physics'
import './styles.css'

interface PlayerProps {
  player: PlayerType
  width: number
  height: number
}

export const Player = ({ player, width, height }: PlayerProps) => {
  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    // Draw player body
    ctx.fillStyle = '#f39c12'  // Orange color
    ctx.fillRect(
      player.x - player.size / 2,
      player.y - player.size / 2,
      player.size,
      player.size
    )

    // Draw a direction indicator (always pointing right for now)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(player.x, player.y)
    ctx.lineTo(
      player.x + player.size,
      player.y
    )
    ctx.stroke()
  }

  return (
    <div className="player-container" style={{ width, height }}>
      <canvas
        ref={(canvas) => {
          if (canvas) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.clearRect(0, 0, width, height)
              drawPlayer(ctx)
            }
          }
        }}
        width={width}
        height={height}
      />
    </div>
  )
} 