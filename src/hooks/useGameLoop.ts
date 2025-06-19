import { useEffect, useRef } from 'react'

export const useGameLoop = (callback: (deltaTime: number) => void) => {
  const frameRef = useRef<number | undefined>(undefined)
  const lastTimeRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const gameLoop = (time: number) => {
      if (lastTimeRef.current === undefined) {
        lastTimeRef.current = time
      }

      const deltaTime = time - lastTimeRef.current
      lastTimeRef.current = time

      callback(deltaTime)

      frameRef.current = requestAnimationFrame(gameLoop)
    }

    frameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [callback])
} 