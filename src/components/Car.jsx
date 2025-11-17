import React, { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

function Man() {
  const group = useRef()
  const { camera, gl } = useThree()
  const [modelLoaded, setModelLoaded] = useState(false)
  
  // Load the 3D man model
  let manScene = null
  let animations = []
  try {
    const gltf = useGLTF('/models/man.glb', true)
    manScene = gltf.scene
    animations = gltf.animations || []
    
    console.log('✅ Man model loaded!')
    console.log('Available animations:', animations.map(a => a.name))
    
    // Setup model
    if (manScene) {
      manScene = manScene.clone()
      manScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      setModelLoaded(true)
    }
  } catch (error) {
    console.error('❌ Man model error:', error)
  }
  
  // Setup animations
  const { actions, mixer } = useAnimations(animations, group)
  
  // Movement state
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const speed = useRef(0)
  const targetRotation = useRef(0)
  const currentRotation = useRef(0)
  
  // Keyboard state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false  // For running
  })
  
  // Mouse movement for camera
  const mouseMovement = useRef({ x: 0, y: 0 })
  const isPointerLocked = useRef(false)
  
  // Animation state
  const currentAction = useRef(null)
  
  // Movement constants
  const WALK_SPEED = 0.05
  const RUN_SPEED = 0.12
  const ROTATION_SPEED = 0.05
  const CAMERA_DISTANCE = 5
  const CAMERA_HEIGHT = 2
  const DAMPING = 0.85
  
  // Setup pointer lock
  useEffect(() => {
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement
    }
    
    const handleMouseMove = (event) => {
      if (isPointerLocked.current) {
        mouseMovement.current.x -= event.movementX * 0.003
        mouseMovement.current.y -= event.movementY * 0.003
        mouseMovement.current.y = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, mouseMovement.current.y))
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
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.shift = true
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
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.shift = false
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
  
  // Find animations by name patterns
  const getAnimation = (patterns) => {
    if (!actions) return null
    const animNames = Object.keys(actions)
    for (let pattern of patterns) {
      const found = animNames.find(name => pattern.test(name))
      if (found) return found
    }
    return animNames[0]
  }
  
  // Start with idle animation
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return
    
    const idleAnim = getAnimation([/idle/i, /standing/i, /stand/i])
    if (idleAnim && actions[idleAnim]) {
      actions[idleAnim].play()
      currentAction.current = idleAnim
      console.log('🎬 Playing animation:', idleAnim)
    }
  }, [actions])
  
  // Movement and animation loop
  useFrame((state, delta) => {
    if (!group.current) return
    
    // Calculate movement direction (relative to view)
    direction.current.set(0, 0, 0)
    
    if (keys.current.forward) direction.current.z -= 1
    if (keys.current.backward) direction.current.z += 1
    if (keys.current.left) direction.current.x -= 1
    if (keys.current.right) direction.current.x += 1
    
    const isMoving = direction.current.length() > 0
    const isRunning = keys.current.shift && isMoving
    
    if (isMoving) {
      direction.current.normalize()
      
      // Apply camera rotation to movement
      const cameraRotation = mouseMovement.current.x
      direction.current.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotation)
      
      // Set speed based on running or walking
      const targetSpeed = isRunning ? RUN_SPEED : WALK_SPEED
      speed.current = THREE.MathUtils.lerp(speed.current, targetSpeed, 0.1)
      
      // Calculate target rotation
      targetRotation.current = Math.atan2(direction.current.x, direction.current.z)
      
      // Smooth rotation
      currentRotation.current = THREE.MathUtils.lerp(
        currentRotation.current,
        targetRotation.current,
        ROTATION_SPEED
      )
      
      group.current.rotation.y = currentRotation.current
      
      // Update velocity
      velocity.current.x = direction.current.x * speed.current
      velocity.current.z = direction.current.z * speed.current
    } else {
      // Decelerate when not moving
      speed.current *= DAMPING
      velocity.current.multiplyScalar(DAMPING)
    }
    
    // Update position
    const newPos = group.current.position.clone()
    newPos.add(velocity.current)
    
    // Keep within bounds
    newPos.x = Math.max(-23, Math.min(23, newPos.x))
    newPos.z = Math.max(-23, Math.min(23, newPos.z))
    
    group.current.position.copy(newPos)
    
    // Handle animations
    if (actions && Object.keys(actions).length > 0) {
      const idleAnim = getAnimation([/idle/i, /standing/i, /stand/i])
      const walkAnim = getAnimation([/walk/i, /walking/i])
      const runAnim = getAnimation([/run/i, /running/i, /jog/i])
      
      let targetAnim = idleAnim
      
      if (isMoving) {
        if (isRunning && runAnim) {
          targetAnim = runAnim
        } else if (walkAnim) {
          targetAnim = walkAnim
        }
      }
      
      // Switch animation if needed
      if (targetAnim && currentAction.current !== targetAnim) {
        const prevAction = currentAction.current
        
        if (prevAction && actions[prevAction]) {
          actions[prevAction].fadeOut(0.3)
        }
        
        if (actions[targetAnim]) {
          actions[targetAnim].reset().fadeIn(0.3).play()
          currentAction.current = targetAnim
          console.log('🎬 Switched to:', targetAnim)
        }
      }
      
      // Adjust animation speed for running
      if (currentAction.current && actions[currentAction.current]) {
        if (isRunning && runAnim === currentAction.current) {
          actions[currentAction.current].setEffectiveTimeScale(1.2)
        } else {
          actions[currentAction.current].setEffectiveTimeScale(1.0)
        }
      }
    }
    
    // Camera follows character
    const idealOffset = new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE)
    idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseMovement.current.x)
    
    const idealPosition = group.current.position.clone().add(idealOffset)
    camera.position.lerp(idealPosition, 0.1)
    
    // Camera looks at character with vertical offset
    const lookAtPosition = group.current.position.clone()
    lookAtPosition.y += 1.5
    camera.lookAt(lookAtPosition)
  })
  
  return (
    <group ref={group} position={[0, 0, 0]}>
      {manScene ? (
        <primitive object={manScene} scale={1} />
      ) : (
        // Fallback: Simple character
        <group>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.6, 1, 0.4]} />
            <meshStandardMaterial color="#3498db" />
          </mesh>
          <mesh position={[0, 1.3, 0]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#f39c12" />
          </mesh>
        </group>
      )}
    </group>
  )
}

// Preload the model
useGLTF.preload('/models/man.glb')

export default Man