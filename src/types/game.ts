export interface Position {
  x: number
  y: number
}

export interface Tree {
  position: Position
  size: number
}

export interface Bullet {
  x: number
  y: number
  speed: number
  direction: Position
  active: boolean
  size: number
}

export interface Orca {
  x: number
  y: number
  size: number
  speed: number
  direction: Position
  active: boolean
  spawnTime: number
  phase: 'emerging' | 'swimming' | 'submerging'
}

export interface OrcaGutsPiece {
  x: number
  y: number
  size: number
  rotation: number
  speed: number
  direction: Position
  color: string
  shape: 'circle' | 'splat'
}

export interface OrcaGuts {
  x: number
  y: number
  size: number
  rotation: number
  pieces: OrcaGutsPiece[]
  createdAt: number
}

export interface Player {
  x: number
  y: number
  size: number
  speed: number
  lastShot: number
  shootCooldown: number
}

export interface Tent {
  x: number
  y: number
  width: number
  height: number
}

export interface GameState {
  score: number
  lastUpdate: number
} 