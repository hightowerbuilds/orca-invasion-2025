import type { Position } from '../types/game'

export const normalizeVector = (x: number, y: number): Position => {
  const length = Math.sqrt(x * x + y * y)
  if (length === 0) return { x: 0, y: 0 }
  return {
    x: x / length,
    y: y / length
  }
}

export const calculateAngle = (x: number, y: number): number => {
  return Math.atan2(y, x)
}

export const calculateDirection = (angle: number): Position => {
  return {
    x: Math.cos(angle),
    y: Math.sin(angle)
  }
}

export const applyGravity = (direction: Position, gravity: number = 0.1): Position => {
  return {
    x: direction.x,
    y: direction.y + gravity
  }
}

export const applyDrag = (direction: Position, dragFactor: number = 0.98): Position => {
  return {
    x: direction.x * dragFactor,
    y: direction.y * dragFactor
  }
} 