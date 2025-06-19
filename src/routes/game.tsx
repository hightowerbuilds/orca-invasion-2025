import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import '../styles/game.css'

interface Position {
  x: number
  y: number
}

interface Tree {
  position: Position
  size: number
}

interface Bullet {
  x: number
  y: number
  speed: number
  direction: Position
  active: boolean
}

interface Orca {
  x: number
  y: number
  size: number
  speed: number
  direction: Position
  active: boolean
  spawnTime: number
  phase: 'emerging' | 'swimming' | 'submerging'
}

interface OrcaGuts {
  x: number
  y: number
  size: number
  rotation: number
  pieces: {
    x: number
    y: number
    size: number
    rotation: number
    speed: number
    direction: Position
    color: string
    shape: string
  }[]
  createdAt: number
}

function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const gameStateRef = useRef({
    score: 0,
    lastUpdate: 0
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const width = 1200
    const height = 800
    canvas.width = width
    canvas.height = height

    // Reset game state
    gameStateRef.current = {
      score: 0,
      lastUpdate: 0
    }
    setScore(0)

    // Player properties
    const player = {
      x: width / 2,
      y: height / 2,
      width: 20,
      height: 60,  // Three times as tall as wide
      speed: 5,
      lastShot: 0,  // Timestamp of last shot
      shootCooldown: 250  // Cooldown between shots in milliseconds
    }

    // Bullet properties
    const bullets: Bullet[] = []
    const bulletSpeed = 10
    const bulletSize = 5

    // Tent properties
    const tent = {
      x: width - 150,  // 150px from right edge
      y: 100,         // 100px from top
      width: 100,     // Tent width
      height: 80      // Tent height
    }

    // Orca properties
    const orcas: Orca[] = []
    const orcaGuts: OrcaGuts[] = []
    const maxOrcas = 3
    const orcaSpawnInterval = 5000 // 5 seconds between spawns
    let lastOrcaSpawn = 0

    // Function to draw the tent
    const drawTent = (context: CanvasRenderingContext2D) => {
      const { x, y, width, height } = tent

      // Draw tent base (rectangle)
      context.fillStyle = '#8B0000'  // Dark red
      context.fillRect(x, y + height/2, width, height/2)

      // Draw tent top (triangle)
      context.fillStyle = '#FF0000'  // Bright red
      context.beginPath()
      context.moveTo(x, y + height/2)           // Bottom left
      context.lineTo(x + width/2, y)            // Top middle
      context.lineTo(x + width, y + height/2)   // Bottom right
      context.closePath()
      context.fill()

      // Draw tent door (darker triangle)
      context.fillStyle = '#8B0000'  // Dark red
      context.beginPath()
      context.moveTo(x + width/2, y + height/2)  // Top middle of door
      context.lineTo(x + width/3, y + height)    // Bottom left
      context.lineTo(x + width*2/3, y + height)  // Bottom right
      context.closePath()
      context.fill()
    }

    // Generate random trees
    const trees: Tree[] = Array.from({ length: 5 }, () => ({
      position: {
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50
      },
      size: Math.random() * 20 + 30
    }))

    // Function to draw a tree
    const drawTree = (context: CanvasRenderingContext2D, tree: Tree) => {
      const { x, y } = tree.position
      const size = tree.size

      // Draw three triangles stacked on each other
      context.fillStyle = '#2E7D32'  // Dark green

      // Bottom triangle
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(x - size, y + size)
      context.lineTo(x + size, y + size)
      context.closePath()
      context.fill()

      // Middle triangle
      context.beginPath()
      context.moveTo(x, y - size/2)
      context.lineTo(x - size * 0.8, y + size/2)
      context.lineTo(x + size * 0.8, y + size/2)
      context.closePath()
      context.fill()

      // Top triangle
      context.beginPath()
      context.moveTo(x, y - size)
      context.lineTo(x - size * 0.6, y)
      context.lineTo(x + size * 0.6, y)
      context.closePath()
      context.fill()

      // Draw trunk
      context.fillStyle = '#5D4037'  // Brown
      context.fillRect(x - size/6, y + size, size/3, size/2)
    }

    // Function to create a new bullet
    const createBullet = () => {
      const now = Date.now()
      if (now - player.lastShot < player.shootCooldown) return

      // Calculate direction based on last movement
      let directionX = 0
      let directionY = 0

      // If no movement keys are pressed, shoot upward by default
      if (!keys.has('w') && !keys.has('s') && !keys.has('a') && !keys.has('d') &&
          !keys.has('arrowup') && !keys.has('arrowdown') && !keys.has('arrowleft') && !keys.has('arrowright')) {
        directionY = -1
      } else {
        // Use the last pressed movement key to determine direction
        if (keys.has('w') || keys.has('arrowup')) directionY -= 1
        if (keys.has('s') || keys.has('arrowdown')) directionY += 1
        if (keys.has('a') || keys.has('arrowleft')) directionX -= 1
        if (keys.has('d') || keys.has('arrowright')) directionX += 1
      }

      // Normalize direction vector
      const length = Math.sqrt(directionX * directionX + directionY * directionY)
      if (length > 0) {
        directionX /= length
        directionY /= length
      }

      // Create two bullets in the same direction
      for (let i = 0; i < 2; i++) {
        bullets.push({
          x: player.x,
          y: player.y,
          speed: bulletSpeed,
          direction: { x: directionX, y: directionY },
          active: true
        })
      }

      player.lastShot = now
    }

    // Function to draw a bullet
    const drawBullet = (context: CanvasRenderingContext2D, bullet: Bullet) => {
      context.fillStyle = '#C0C0C0'  // Silver color
      context.beginPath()
      context.arc(bullet.x, bullet.y, bulletSize, 0, Math.PI * 2)
      context.fill()
    }

    // Function to update bullet positions
    const updateBullets = () => {
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i]
        bullet.x += bullet.direction.x * bullet.speed
        bullet.y += bullet.direction.y * bullet.speed

        // Remove bullets that are off screen
        if (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height) {
          bullets.splice(i, 1)
        }
      }
    }

    // Track pressed keys
    const keys = new Set<string>()

    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && gameOver) {
        handleRestart()
        return
      }

      if (gameOver) return  // Don't process other keys if game is over

      if (e.code === 'Space') {
        createBullet()
      } else {
        keys.add(e.key.toLowerCase())
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase())
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Create land gradient
    const createLandGradient = () => {
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width / 1.5
      )
      
      gradient.addColorStop(0, '#8B4513')
      gradient.addColorStop(0.3, '#A0522D')
      gradient.addColorStop(0.6, '#556B2F')
      gradient.addColorStop(1, '#6B8E23')
      
      return gradient
    }

    // Function to create a new orca
    const createOrca = () => {
      const now = Date.now()
      if (now - lastOrcaSpawn < orcaSpawnInterval || orcas.length >= maxOrcas) return

      // Randomly choose a side to spawn from (0: top, 1: right, 2: bottom, 3: left)
      const side = Math.floor(Math.random() * 4)
      let x = 0
      let y = 0
      let directionX = 0
      let directionY = 0

      switch (side) {
        case 0: // top
          x = Math.random() * width
          y = -50
          directionY = 1
          break
        case 1: // right
          x = width + 50
          y = Math.random() * height
          directionX = -1
          break
        case 2: // bottom
          x = Math.random() * width
          y = height + 50
          directionY = -1
          break
        case 3: // left
          x = -50
          y = Math.random() * height
          directionX = 1
          break
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
      })

      lastOrcaSpawn = now
    }

    // Function to draw an orca
    const drawOrca = (context: CanvasRenderingContext2D, orca: Orca) => {
      // Don't draw inactive orcas
      if (!orca.active) return

      const { x, y, size } = orca
      
      // Save context for rotation
      context.save()
      context.translate(x, y)
      
      // Calculate rotation angle based on direction
      const angle = Math.atan2(orca.direction.y, orca.direction.x)
      context.rotate(angle)

      // Draw orca body (black oval)
      context.fillStyle = '#000000'
      context.beginPath()
      context.ellipse(0, 0, size, size/2, 0, 0, Math.PI * 2)
      context.fill()

      // Draw white patch
      context.fillStyle = '#FFFFFF'
      context.beginPath()
      context.ellipse(-size/4, -size/6, size/4, size/6, 0, 0, Math.PI * 2)
      context.fill()

      // Draw dorsal fin
      context.fillStyle = '#000000'
      context.beginPath()
      context.moveTo(size/2, -size/4)
      context.lineTo(size/2 + size/3, -size/2)
      context.lineTo(size/2, -size/3)
      context.closePath()
      context.fill()

      // Draw tail
      context.beginPath()
      context.moveTo(-size, 0)
      context.lineTo(-size - size/2, -size/3)
      context.lineTo(-size - size/2, size/3)
      context.closePath()
      context.fill()

      context.restore()
    }

    // Function to create orca guts
    const createOrcaGuts = (x: number, y: number, size: number) => {
      const pieces = []
      const numPieces = 15  // Increased from 8 to 15 pieces
      
      // Create multiple pieces of guts with more variation
      for (let i = 0; i < numPieces; i++) {
        const angle = (Math.PI * 2 * i) / numPieces
        const speed = Math.random() * 4 + 2  // Increased speed range
        const pieceSize = (Math.random() * 0.5 + 0.5) * (size / 3)  // More size variation
        pieces.push({
          x: 0,
          y: 0,
          size: pieceSize,
          rotation: Math.random() * Math.PI * 2,
          speed: speed,
          direction: {
            x: Math.cos(angle) * speed * (Math.random() * 0.5 + 0.75),  // Add some randomness to direction
            y: Math.sin(angle) * speed * (Math.random() * 0.5 + 0.75)
          },
          color: Math.random() > 0.5 ? '#8B0000' : '#4B0000',  // Random dark red shades
          shape: Math.random() > 0.5 ? 'circle' : 'splat'  // Random shape
        })
      }

      orcaGuts.push({
        x,
        y,
        size,
        rotation: Math.random() * Math.PI * 2,
        pieces,
        createdAt: Date.now()
      })
    }

    // Function to draw orca guts
    const drawOrcaGuts = (context: CanvasRenderingContext2D, guts: OrcaGuts) => {
      const { x, y, pieces } = guts
      
      // Draw each piece of guts
      pieces.forEach(piece => {
        context.save()
        context.translate(x + piece.x, y + piece.y)
        context.rotate(piece.rotation)

        // Draw the piece based on its shape
        if (piece.shape === 'circle') {
          // Draw a circular piece
          context.fillStyle = piece.color
          context.beginPath()
          context.arc(0, 0, piece.size, 0, Math.PI * 2)
          context.fill()

          // Add a darker center
          context.fillStyle = '#2B0000'
          context.beginPath()
          context.arc(0, 0, piece.size * 0.4, 0, Math.PI * 2)
          context.fill()
        } else {
          // Draw a splat shape
          context.fillStyle = piece.color
          context.beginPath()
          context.ellipse(0, 0, piece.size, piece.size * 0.6, 0, 0, Math.PI * 2)
          context.fill()

          // Add some splatter details
          context.fillStyle = '#2B0000'
          for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 * i) / 3
            const detailX = Math.cos(angle) * piece.size * 0.3
            const detailY = Math.sin(angle) * piece.size * 0.3
            context.beginPath()
            context.arc(detailX, detailY, piece.size * 0.2, 0, Math.PI * 2)
            context.fill()
          }
        }

        context.restore()
      })
    }

    // Function to update orca guts
    const updateOrcaGuts = () => {
      const now = Date.now()
      
      for (let i = orcaGuts.length - 1; i >= 0; i--) {
        const guts = orcaGuts[i]
        const timeSinceCreation = now - guts.createdAt

        // Update each piece's position with some physics
        guts.pieces.forEach(piece => {
          // Add some gravity effect
          piece.direction.y += 0.1
          
          // Add some rotation variation
          piece.rotation += 0.05 * (Math.random() - 0.5)
          
          // Update position
          piece.x += piece.direction.x
          piece.y += piece.direction.y
          
          // Add some drag
          piece.direction.x *= 0.98
          piece.direction.y *= 0.98
        })

        // Remove guts after 3 seconds (reduced from 5)
        if (timeSinceCreation > 3000) {
          orcaGuts.splice(i, 1)
        }
      }
    }

    // Function to check bullet-orca collisions
    const checkBulletCollisions = () => {
      if (gameOver) return

      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i]
        
        for (let j = orcas.length - 1; j >= 0; j--) {
          const orca = orcas[j]
          
          const dx = bullet.x - orca.x
          const dy = bullet.y - orca.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Make collision detection more sensitive
          if (distance < orca.size) {
            createOrcaGuts(orca.x, orca.y, orca.size)
            bullets.splice(i, 1)
            orcas.splice(j, 1)
            
            // Update score
            gameStateRef.current.score += 100
            const now = Date.now()
            // Only update state every 100ms to prevent too many re-renders
            if (now - gameStateRef.current.lastUpdate > 100) {
              setScore(gameStateRef.current.score)
              gameStateRef.current.lastUpdate = now
            }
            break
          }
        }
      }
    }

    // Function to check player collisions
    const checkPlayerCollisions = () => {
      if (gameOver) return

      for (const orca of orcas) {
        const dx = player.x - orca.x
        const dy = player.y - orca.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // Use average of width and height for collision detection
        const playerRadius = (player.width + player.height) / 4
        
        // Make collision detection more sensitive
        if (distance < (playerRadius + orca.size)) {
          setGameOver(true)
          return
        }
      }
    }

    // Function to draw scoreboard
    const drawScoreboard = (context: CanvasRenderingContext2D) => {
      // Draw scoreboard background
      context.fillStyle = 'rgba(0, 0, 0, 0.7)'
      context.fillRect(width - 200, 20, 180, 60)
      
      // Draw score text using gameStateRef
      context.fillStyle = '#FFFFFF'
      context.font = 'bold 24px Arial'
      context.textAlign = 'right'
      context.fillText(`Orcas Destroyed: ${Math.floor(gameStateRef.current.score/100)}`, width - 30, 45)
      context.fillText(`Score: ${gameStateRef.current.score}`, width - 30, 75)
    }

    // Function to draw game over screen
    const drawGameOver = (context: CanvasRenderingContext2D) => {
      // Semi-transparent black overlay
      context.fillStyle = 'rgba(0, 0, 0, 0.7)'
      context.fillRect(0, 0, width, height)

      // Game over text
      context.fillStyle = '#FFFFFF'
      context.font = 'bold 72px Arial'
      context.textAlign = 'center'
      context.fillText('ORCA GOT YOU!', width/2, height/2 - 50)

      // Score text
      context.font = '36px Arial'
      context.fillText(`Orcas Destroyed: ${score/100}`, width/2, height/2 + 20)

      // Restart instructions
      context.font = '24px Arial'
      context.fillText('Press R to Try Again', width/2, height/2 + 80)
    }

    // Function to handle restart
    const handleRestart = () => {
      if (!gameOver) return
      setGameOver(false)
      gameStateRef.current = {
        score: 0,
        lastUpdate: 0
      }
      setScore(0)
      orcas.length = 0
      orcaGuts.length = 0
      bullets.length = 0
      player.x = width / 2
      player.y = height / 2
      lastOrcaSpawn = 0
    }

    // Function to update orca positions
    const updateOrcas = () => {
      const now = Date.now()
      
      // Try to spawn new orca
      createOrca()

      for (let i = orcas.length - 1; i >= 0; i--) {
        const orca = orcas[i]
        
        // Remove inactive orcas after a short delay
        if (!orca.active) {
          orcas.splice(i, 1)
          continue
        }

        const timeSinceSpawn = now - orca.spawnTime

        // Update orca phase
        if (orca.phase === 'emerging' && timeSinceSpawn > 1000) {
          orca.phase = 'swimming'
          // Set new random direction for swimming
          const angle = Math.random() * Math.PI * 2
          orca.direction.x = Math.cos(angle)
          orca.direction.y = Math.sin(angle)
        } else if (orca.phase === 'swimming' && timeSinceSpawn > 8000) {
          orca.phase = 'submerging'
          // Set direction towards nearest edge
          const toEdgeX = orca.x < width/2 ? -1 : 1
          const toEdgeY = orca.y < height/2 ? -1 : 1
          orca.direction.x = toEdgeX
          orca.direction.y = toEdgeY
        }

        // Update position
        orca.x += orca.direction.x * orca.speed
        orca.y += orca.direction.y * orca.speed

        // Remove orca if it's gone off screen
        if (orca.x < -100 || orca.x > width + 100 || 
            orca.y < -100 || orca.y > height + 100) {
          orcas.splice(i, 1)
        }
      }
    }

    // Game loop
    function gameLoop() {
      const context = ctx!

      // Clear canvas
      context.clearRect(0, 0, width, height)

      // Draw land gradient
      context.fillStyle = createLandGradient()
      context.fillRect(0, 0, width, height)

      // Draw trees
      trees.forEach(tree => drawTree(context, tree))

      // Draw tent
      drawTent(context)

      if (!gameOver) {
        // Update and draw orcas
        updateOrcas()
        orcas.forEach(orca => drawOrca(context, orca))

        // Update and draw orca guts
        updateOrcaGuts()
        orcaGuts.forEach(guts => drawOrcaGuts(context, guts))

        // Check for bullet collisions
        checkBulletCollisions()

        // Update and draw bullets
        updateBullets()
        bullets.forEach(bullet => drawBullet(context, bullet))

        // Update player position
        if (keys.has('w') || keys.has('arrowup')) {
          player.y -= player.speed
        }
        if (keys.has('s') || keys.has('arrowdown')) {
          player.y += player.speed
        }
        if (keys.has('a') || keys.has('arrowleft')) {
          player.x -= player.speed
        }
        if (keys.has('d') || keys.has('arrowright')) {
          player.x += player.speed
        }

        // Keep player in bounds
        player.x = Math.max(player.width/2, Math.min(width - player.width/2, player.x))
        player.y = Math.max(player.height/2, Math.min(height - player.height/2, player.y))

        // Check for player collisions
        checkPlayerCollisions()
      } else {
        // If game is over, still draw existing orcas and guts
        orcas.forEach(orca => drawOrca(context, orca))
        orcaGuts.forEach(guts => drawOrcaGuts(context, guts))
      }

      // Draw scoreboard
      drawScoreboard(context)

      // Draw player
      // Draw the top orange section
      context.fillStyle = '#f39c12'
      context.fillRect(
        player.x - player.width / 2,
        player.y - player.height / 2,
        player.width,
        player.height / 3
      )

      // Draw the middle blue section
      context.fillStyle = '#3498db'  // Blue color
      context.fillRect(
        player.x - player.width / 2,
        player.y - player.height / 6,  // Start after top third
        player.width,
        player.height / 3
      )

      // Draw the bottom orange section
      context.fillStyle = '#f39c12'
      context.fillRect(
        player.x - player.width / 2,
        player.y + player.height / 6,  // Start after middle third
        player.width,
        player.height / 3
      )

      // Draw the bottom border
      context.fillStyle = '#d35400'  // Darker orange for the border
      context.fillRect(
        player.x - player.width / 2,  // Same x position as block
        player.y + player.height / 2 - 5,  // 5px from bottom of block
        player.width,  // Same width as block
        5  // 5px thick border
      )

      // Draw the circle on top
      context.fillStyle = '#f39c12'  // Same orange color as the block
      context.beginPath()
      context.arc(
        player.x,  // Center of the block
        player.y - player.height / 2,  // Top of the block
        12,  // Circle radius
        0,
        Math.PI * 2
      )
      context.fill()

      // Draw the eyes
      context.fillStyle = '#000000'  // Black color for eyes
      // Left eye
      context.beginPath()
      context.arc(
        player.x - 6,  // 6px to the left of center
        player.y - player.height / 2,  // Same y as circle
        3,  // Eye radius
        0,
        Math.PI * 2
      )
      context.fill()
      // Right eye
      context.beginPath()
      context.arc(
        player.x + 6,  // 6px to the right of center
        player.y - player.height / 2,  // Same y as circle
        3,  // Eye radius
        0,
        Math.PI * 2
      )
      context.fill()

      // Draw game over screen if game is over
      if (gameOver) {
        drawGameOver(context)
      }

      // Continue the game loop
      requestAnimationFrame(gameLoop)
    }

    // Start the game loop
    const animationFrameId = requestAnimationFrame(gameLoop)

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="game-container">
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  )
}

export const Route = createFileRoute('/game')({
  component: Game,
}) 