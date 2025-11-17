import React, { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function Car() {
  const group = useRef()
  const { camera, gl } = useThree()
  
  // Load the 3D car model
  const { scene } = useGLTF('/models/car.glb')
  
  // Car physics state
  const velocity = useRef(new THREE.Vector3())
  const acceleration = useRef(0)
  const steeringAngle = useRef(0)
  const currentRotation = useRef(0)
  
  // Keyboard state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  })
  
  // Mouse movement for camera
  const mouseMovement = useRef({ x: 0, y: 0 })
  const isPointerLocked = useRef(false)
  
  // Car physics constants
  const MAX_SPEED = 0.3
  const ACCELERATION = 0.01
  const BRAKE_FORCE = 0.02
  const FRICTION = 0.97
  const STEERING_SPEED = 0.03
  const STEERING_RETURN = 0.9
  const CAMERA_DISTANCE = 8
  const CAMERA_HEIGHT = 3
  
  // Setup pointer lock for camera control
  useEffect(() => {
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement
    }
    
    const handleMouseMove = (event) => {
      if (isPointerLocked.current) {
        mouseMovement.current.x -= event.movementX * 0.002
        mouseMovement.current.y -= event.movementY * 0.002
        // Limit vertical camera rotation
        mouseMovement.current.y = Math.max(-Math.PI / 6, Math.min(Math.PI / 4, mouseMovement.current.y))
      }
    }
    
    const handleClick = () => {
      gl.domElement.requestPointerLock()
    }
    
    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('mousemove', handleMouseMove)
    gl.domElement.addEventListener('click', handleClick)
    
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      document.removeEventListener('mousemove', handleMouseMove)
      gl.domElement.removeEventListener('click', handleClick)
    }
  }, [gl])
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true
          break
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true
          break
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true
          break
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true
          break
      }
    }
    
    const handleKeyUp = (event) => {
      switch (event.code) {
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
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  // Car physics and rendering loop
  useFrame(() => {
    if (!group.current) return
    
    // Handle acceleration
    if (keys.current.forward) {
      acceleration.current = Math.min(acceleration.current + ACCELERATION, MAX_SPEED)
    } else if (keys.current.backward) {
      acceleration.current = Math.max(acceleration.current - BRAKE_FORCE, -MAX_SPEED * 0.5)
    } else {
      // Natural deceleration
      acceleration.current *= FRICTION
      if (Math.abs(acceleration.current) < 0.001) {
        acceleration.current = 0
      }
    }
    
    // Handle steering - only works when moving
    if (Math.abs(acceleration.current) > 0.01) {
      if (keys.current.left) {
        steeringAngle.current += STEERING_SPEED
      } else if (keys.current.right) {
        steeringAngle.current -= STEERING_SPEED
      } else {
        // Return steering to center
        steeringAngle.current *= STEERING_RETURN
      }
      
      // Limit steering angle
      steeringAngle.current = Math.max(-0.5, Math.min(0.5, steeringAngle.current))
    } else {
      steeringAngle.current *= STEERING_RETURN
    }
    
    // Update rotation based on steering
    currentRotation.current += steeringAngle.current * (acceleration.current / MAX_SPEED)
    group.current.rotation.y = currentRotation.current
    
    // Calculate movement direction
    const direction = new THREE.Vector3(0, 0, -1)
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), currentRotation.current)
    
    // Update velocity
    velocity.current.x = direction.x * acceleration.current
    velocity.current.z = direction.z * acceleration.current
    
    // Update position
    const newPos = group.current.position.clone()
    newPos.add(velocity.current)
    
    // Keep car within bounds (inside the room)
    newPos.x = Math.max(-23, Math.min(23, newPos.x))
    newPos.z = Math.max(-23, Math.min(23, newPos.z))
    
    group.current.position.copy(newPos)
    
    // Camera follows car from behind
    const cameraOffset = new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE)
    
    // Apply car's rotation to camera offset
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), currentRotation.current)
    
    // Apply mouse look rotation
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseMovement.current.x)
    
    const idealPosition = group.current.position.clone().add(cameraOffset)
    
    // Smooth camera movement
    camera.position.lerp(idealPosition, 0.1)
    
    // Camera looks at car with slight height offset
    const lookAtPosition = group.current.position.clone()
    lookAtPosition.y += 1
    camera.lookAt(lookAtPosition)
  })
  
  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Adjust scale if car is too big/small */}
      <primitive object={scene} scale={1} castShadow receiveShadow />
    </group>
  )
}

export default Car