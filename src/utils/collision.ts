import type { Position, Orca, Bullet, Player } from '../types/game'

export const checkCollision = (pos1: Position, size1: number, pos2: Position, size2: number): boolean => {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < (size1 + size2)
}

export const checkBulletOrcaCollision = (bullet: Bullet, orca: Orca): boolean => {
  return checkCollision(
    { x: bullet.x, y: bullet.y },
    orca.size,
    { x: orca.x, y: orca.y },
    orca.size
  )
}

export const checkPlayerOrcaCollision = (player: Player, orca: Orca): boolean => {
  return checkCollision(
    { x: player.x, y: player.y },
    player.size,
    { x: orca.x, y: orca.y },
    orca.size
  )
} 