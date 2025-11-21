import { useEffect, useRef } from 'react'

export function useCarControls(carRef, isActive) {
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  })
  
  useEffect(() => {
    if (!isActive) return
    
    const onKeyDown = (e) => {
      if (!isActive) return
      
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true
          if (carRef.current) {
            carRef.current.acceleration = Math.min(
              carRef.current.acceleration + 0.02,
              0.5
            )
          }
          break
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true
          if (carRef.current) {
            carRef.current.acceleration = Math.max(
              carRef.current.acceleration - 0.03,
              -0.3
            )
          }
          break
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true
          if (carRef.current) {
            carRef.current.steering += 0.04
          }
          break
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true
          if (carRef.current) {
            carRef.current.steering -= 0.04
          }
          break
      }
    }
    
    const onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false
          break
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false
          break
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false
          break
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false
          break
      }
    }
    
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [isActive, carRef])
  
  return keys
}

export default useCarControls