import React, { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'

function PoliceCar({ position, onPlayerEnter, onPlayerExit, isPlayerInside, playerPosition }) {
  const group = useRef()
  const { camera } = useThree()
  
  // Load car model
  const { scene } = useGLTF('/models/policecar.glb')
  
  // Car physics
  const velocity = useRef(new THREE.Vector3())
  const acceleration = useRef(0)
  const steering = useRef(0)
  const currentRotation = useRef(0)
  
  // Check if player is near car
  const isPlayerNear = () => {
    if (!group.current || !playerPosition) return false
    const distance = group.current.position.distanceTo(new THREE.Vector3(...playerPosition))
    return distance < 3 // Within 3 units
  }
  
  // Car physics constants
  const MAX_SPEED = 0.5
  const ACCELERATION = 0.02
  const BRAKE = 0.03
  const FRICTION = 0.95
  const TURN_SPEED = 0.04
  
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  }, [scene])
  
  // Car driving physics
  useFrame(() => {
    if (!group.current) return
    
    if (isPlayerInside) {
      // Apply friction
      acceleration.current *= FRICTION
      steering.current *= 0.9
      
      // Update rotation
      if (Math.abs(acceleration.current) > 0.01) {
        currentRotation.current += steering.current * (acceleration.current / MAX_SPEED)
      }
      group.current.rotation.y = currentRotation.current
      
      // Calculate movement
      const direction = new THREE.Vector3(0, 0, -1)
      direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), currentRotation.current)
      
      velocity.current.x = direction.x * acceleration.current
      velocity.current.z = direction.z * acceleration.current
      
      // Update position
      const newPos = group.current.position.clone()
      newPos.add(velocity.current)
      
      // Boundaries
      newPos.x = Math.max(-45, Math.min(45, newPos.x))
      newPos.z = Math.max(-45, Math.min(45, newPos.z))
      
      group.current.position.copy(newPos)
      
      // Camera follows car
      const cameraOffset = new THREE.Vector3(0, 4, 8)
      cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), currentRotation.current)
      
      const idealPos = group.current.position.clone().add(cameraOffset)
      camera.position.lerp(idealPos, 0.1)
      
      const lookAt = group.current.position.clone()
      lookAt.y += 1
      camera.lookAt(lookAt)
    }
  })
  
  return (
    <group ref={group} position={position}>
      <primitive object={scene.clone()} scale={1} />
      
      {/* Show "Press F to Enter" when near */}
      {!isPlayerInside && isPlayerNear() && (
        <Html position={[0, 2, 0]} center>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            border: '2px solid #3498db',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            Press <span style={{color: '#3498db'}}>F</span> to Enter
          </div>
        </Html>
      )}
    </group>
  )
}

// Preload
useGLTF.preload('/models/policecar.glb')

export default PoliceCar