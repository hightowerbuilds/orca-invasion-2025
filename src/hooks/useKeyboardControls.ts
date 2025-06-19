import { useEffect, useRef } from 'react'

export const useKeyboardControls = (onKeyDown: (key: string) => void, onKeyUp: (key: string) => void) => {
  const keys = useRef(new Set<string>())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (!keys.current.has(key)) {
        keys.current.add(key)
        onKeyDown(key)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keys.current.delete(key)
      onKeyUp(key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onKeyDown, onKeyUp])

  return keys.current
} 