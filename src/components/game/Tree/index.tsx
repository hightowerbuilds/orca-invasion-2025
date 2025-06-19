import type { Tree as TreeType } from '../../../types/game'
import './styles.css'

interface TreeProps {
  tree: TreeType
  width: number
  height: number
}

export const Tree = ({ tree, width, height }: TreeProps) => {
  const drawTree = (ctx: CanvasRenderingContext2D) => {
    const { position, size } = tree
    const { x, y } = position

    // Draw tree trunk
    ctx.fillStyle = '#8B4513'  // Brown color
    ctx.fillRect(x - size/6, y, size/3, size)

    // Draw tree top (three stacked triangles)
    ctx.fillStyle = '#228B22'  // Forest green
    for (let i = 0; i < 3; i++) {
      const triangleHeight = size * 0.8
      const triangleWidth = size * (1 - i * 0.2)
      const triangleY = y - triangleHeight * (i + 1)
      
      ctx.beginPath()
      ctx.moveTo(x, triangleY)
      ctx.lineTo(x - triangleWidth/2, triangleY + triangleHeight)
      ctx.lineTo(x + triangleWidth/2, triangleY + triangleHeight)
      ctx.closePath()
      ctx.fill()
    }
  }

  return (
    <div className="tree-container" style={{ width, height }}>
      <canvas
        ref={(canvas) => {
          if (canvas) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.clearRect(0, 0, width, height)
              drawTree(ctx)
            }
          }
        }}
        width={width}
        height={height}
      />
    </div>
  )
}

export const createTree = (x: number, y: number, size: number): TreeType => {
  return {
    position: { x, y },
    size
  }
} 