import React, { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

function Player() {
  const group = useRef()
  const { camera, gl } = useThree()
  
  // Load the 3D model
  const { scene, animations } = useGLTF('/models/person.glb')
  const { actions, mixer } = useAnimations(animations, group)
  
  // Player state
  const [position, setPosition] = useState([0, 0, 0])
  const [rotation, setRotation] = useState(0)
  
  // Movement state
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  })
  
  // Mouse movement
  const mouseMovement = useRef({ x: 0, y: 0 })
  const isPointerLocked = useRef(false)
  
  // Animation state
  const currentAction = useRef('idle')
  
  // Constants
  const MOVEMENT_SPEED = 0.05
  const ROTATION_SPEED = 0.002
  const CAMERA_DISTANCE = 5
  const CAMERA_HEIGHT = 2
  const DAMPING = 0.9
  
  // Setup pointer lock
  useEffect(() => {
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement
    }
    
    const handleMouseMove = (event) => {
      if (isPointerLocked.current) {
        mouseMovement.current.x -= event.movementX * ROTATION_SPEED
        mouseMovement.current.y -= event.movementY * ROTATION_SPEED
        mouseMovement.current.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, mouseMovement.current.y))
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
  
  // Find and setup animations
  useEffect(() => {
    if (!actions) return
    
    // Try to find idle and walk animations
    const animationNames = Object.keys(actions)
    
    // Common animation name patterns
    const idleAnim = animationNames.find(name => 
      /idle/i.test(name) || /standing/i.test(name)
    ) || animationNames[0]
    
    const walkAnim = animationNames.find(name => 
      /walk/i.test(name) || /walking/i.test(name)
    ) || animationNames[1]
    
    // Start with idle animation
    if (idleAnim && actions[idleAnim]) {
      actions[idleAnim].play()
      currentAction.current = idleAnim
    }
    
    console.log('Available animations:', animationNames)
    console.log('Using idle:', idleAnim)
    console.log('Using walk:', walkAnim)
    
  }, [actions])
  
  // Animation frame update
  useFrame((state, delta) => {
    if (!group.current) return
    
    // Calculate movement direction
    direction.current.set(0, 0, 0)
    
    if (keys.current.forward) direction.current.z -= 1
    if (keys.current.backward) direction.current.z += 1
    if (keys.current.left) direction.current.x -= 1
    if (keys.current.right) direction.current.x += 1
    
    // Normalize direction
    if (direction.current.length() > 0) {
      direction.current.normalize()
    }
    
    // Apply rotation to movement direction
    const rotatedDirection = direction.current.clone()
    rotatedDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseMovement.current.x)
    
    // Update velocity with damping
    velocity.current.x = rotatedDirection.x * MOVEMENT_SPEED
    velocity.current.z = rotatedDirection.z * MOVEMENT_SPEED
    velocity.current.multiplyScalar(DAMPING)
    
    // Update position
    const newPos = group.current.position.clone()
    newPos.add(velocity.current)
    
    // Keep player in bounds
    newPos.x = Math.max(-9, Math.min(9, newPos.x))
    newPos.z = Math.max(-9, Math.min(9, newPos.z))
    
    group.current.position.copy(newPos)
    
    // Rotate player toward movement direction
    if (direction.current.length() > 0) {
      const targetRotation = Math.atan2(rotatedDirection.x, rotatedDirection.z)
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        targetRotation,
        0.1
      )
    }
    
    // Handle animations
    const isMoving = direction.current.length() > 0
    const animationNames = Object.keys(actions)
    
    const idleAnim = animationNames.find(name => /idle/i.test(name)) || animationNames[0]
    const walkAnim = animationNames.find(name => /walk/i.test(name)) || animationNames[1]
    
    if (isMoving && walkAnim && currentAction.current !== walkAnim) {
      // Switch to walk animation
      if (actions[walkAnim] && actions[idleAnim]) {
        actions[idleAnim].fadeOut(0.2)
        actions[walkAnim].reset().fadeIn(0.2).play()
        currentAction.current = walkAnim
      }
    } else if (!isMoving && idleAnim && currentAction.current !== idleAnim) {
      // Switch to idle animation
      if (actions[idleAnim] && actions[walkAnim]) {
        actions[walkAnim].fadeOut(0.2)
        actions[idleAnim].reset().fadeIn(0.2).play()
        currentAction.current = idleAnim
      }
    }
    
    // Camera follows player
    const idealOffset = new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE)
    idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseMovement.current.x)
    
    const idealPosition = group.current.position.clone().add(idealOffset)
    
    camera.position.lerp(idealPosition, 0.1)
    
    // Camera looks at player with vertical offset
    const lookAtPosition = group.current.position.clone()
    lookAtPosition.y += 1
    camera.lookAt(lookAtPosition)
  })
  
  return (
    <group ref={group} position={position}>
      <primitive object={scene} castShadow receiveShadow />
    </group>
  )
}

export default Player