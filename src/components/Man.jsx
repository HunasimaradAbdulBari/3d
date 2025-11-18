import React, { useEffect, useRef, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

function ManModel() {
  const group = useRef()
  const { camera, gl } = useThree()
  
  // Load model - this will throw error if file doesn't exist
  const { scene, animations } = useGLTF('/models/man.glb')
  const { actions } = useAnimations(animations, group)
  
  // Movement state
  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  const speed = useRef(0)
  
  // Keyboard state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false
  })
  
  // Camera control
  const cameraAngle = useRef(0)
  const isLocked = useRef(false)
  
  // Animation state
  const currentAnim = useRef(null)
  
  // Constants
  const WALK_SPEED = 0.08
  const RUN_SPEED = 0.16
  const CAMERA_DISTANCE = 6
  const CAMERA_HEIGHT = 2.5
  
  // Log model info
  useEffect(() => {
    console.log('✅ Model loaded successfully!')
    console.log('Scene:', scene)
    console.log('Animations:', animations?.map(a => a.name))
    
    // Set model properties
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  }, [scene, animations])
  
  // Pointer lock
  useEffect(() => {
    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === gl.domElement
      console.log(isLocked.current ? '✅ Pointer locked' : '❌ Pointer unlocked')
    }
    
    const onMouseMove = (e) => {
      if (isLocked.current) {
        cameraAngle.current -= e.movementX * 0.002
      }
    }
    
    const onClick = () => {
      console.log('🖱️ Requesting pointer lock...')
      gl.domElement.requestPointerLock()
    }
    
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onMouseMove)
    gl.domElement.addEventListener('click', onClick)
    
    return () => {
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMouseMove)
      gl.domElement.removeEventListener('click', onClick)
    }
  }, [gl])
  
  // Keyboard
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        keys.current.forward = true
        console.log('⬆️ Forward')
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        keys.current.backward = true
        console.log('⬇️ Backward')
      }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        keys.current.left = true
        console.log('⬅️ Left')
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        keys.current.right = true
        console.log('➡️ Right')
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keys.current.shift = true
        console.log('🏃 Running')
      }
    }
    
    const onKeyUp = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.forward = false
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.backward = false
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = false
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = false
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.current.shift = false
    }
    
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])
  
  // Start with idle animation - both legs on ground
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) {
      console.log('⚠️ No animations found in model')
      return
    }
    
    const animNames = Object.keys(actions)
    console.log('🎬 Available animations:', animNames)
    
    // Find idle/standing animation (both legs on ground)
    const idle = animNames.find(n => 
      /idle/i.test(n) || 
      /standing/i.test(n) || 
      /stand/i.test(n) ||
      /rest/i.test(n)
    ) || animNames[0]
    
    if (idle && actions[idle]) {
      actions[idle].play()
      currentAnim.current = idle
      console.log('🎬 Playing IDLE animation (legs on ground):', idle)
    }
  }, [actions])
  
  // Movement loop
  useFrame(() => {
    if (!group.current) return
    
    // Calculate direction
    const dir = new THREE.Vector3(0, 0, 0)
    if (keys.current.forward) dir.z -= 1
    if (keys.current.backward) dir.z += 1
    if (keys.current.left) dir.x -= 1
    if (keys.current.right) dir.x += 1
    
    // Check if ACTUALLY moving (not just keys pressed)
    const moving = dir.length() > 0
    const running = keys.current.shift && moving
    const actuallyMoving = speed.current > 0.01  // Real movement check
    
    if (moving) {
      dir.normalize()
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngle.current)
      
      const targetSpeed = running ? RUN_SPEED : WALK_SPEED
      speed.current += (targetSpeed - speed.current) * 0.15
      
      velocity.current.set(dir.x * speed.current, 0, dir.z * speed.current)
      
      // Rotate character to face movement direction
      const angle = Math.atan2(dir.x, dir.z)
      let diff = angle - group.current.rotation.y
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      group.current.rotation.y += diff * 0.1
      
    } else {
      // Smooth stop when keys released - back to IDLE with legs on ground
      speed.current *= 0.85
      velocity.current.multiplyScalar(0.85)
      
      // Complete stop when very slow (IMPORTANT for animation)
      if (speed.current < 0.01) {
        speed.current = 0
        velocity.current.set(0, 0, 0)
      }
    }
    
    // Update position
    const pos = group.current.position
    pos.x += velocity.current.x
    pos.z += velocity.current.z
    
    // Bounds
    pos.x = Math.max(-23, Math.min(23, pos.x))
    pos.z = Math.max(-23, Math.min(23, pos.z))
    
    // Animation system - ONLY run/walk when SPEED > 0
    if (actions && Object.keys(actions).length > 0) {
      const animNames = Object.keys(actions)
      
      // Find all animation types
      const idle = animNames.find(n => 
        /idle/i.test(n) || 
        /standing/i.test(n) || 
        /stand/i.test(n) ||
        /rest/i.test(n)
      ) || animNames[0]
      
      const walk = animNames.find(n => 
        /walk/i.test(n) || 
        /walking/i.test(n)
      )
      
      const run = animNames.find(n => 
        /run/i.test(n) || 
        /running/i.test(n) || 
        /jog/i.test(n)
      )
      
      let target = idle  // Default: IDLE (legs on ground)
      
      // CRITICAL: Only play movement animations if speed is above threshold
      if (actuallyMoving) {
        // Character is ACTUALLY moving with real speed
        if (running && run) {
          target = run  // Running animation
        } else if (walk) {
          target = walk  // Walking animation
        } else if (run) {
          target = run  // Use run as fallback
        }
      } else {
        // Character is NOT moving or speed is too low
        target = idle  // Force IDLE - both legs on ground
      }
      
      // Switch animation with smooth crossfade
      if (target && currentAnim.current !== target) {
        // Fade out current animation
        if (currentAnim.current && actions[currentAnim.current]) {
          actions[currentAnim.current].fadeOut(0.15)
        }
        
        // Fade in new animation
        if (actions[target]) {
          actions[target].reset().fadeIn(0.15).play()
          currentAnim.current = target
          
          if (target === idle) {
            console.log('🧍 STOPPED - Legs on ground, NO movement')
          } else if (target === walk) {
            console.log('🚶 WALKING - Legs moving')
          } else if (target === run) {
            console.log('🏃 RUNNING - Legs moving fast')
          }
        }
      }
      
      // Adjust animation speed based on actual movement speed
      if (currentAnim.current && actions[currentAnim.current]) {
        if (actuallyMoving) {
          // Match animation speed to movement speed
          const speedRatio = speed.current / (running ? RUN_SPEED : WALK_SPEED)
          const animSpeed = Math.max(0.5, Math.min(1.5, speedRatio * (running ? 1.2 : 1.0)))
          actions[currentAnim.current].setEffectiveTimeScale(animSpeed)
        } else {
          // Force idle animation to play at normal speed
          actions[currentAnim.current].setEffectiveTimeScale(1.0)
        }
      }
    }
    
    // Camera
    const camPos = new THREE.Vector3(
      pos.x + Math.sin(cameraAngle.current) * CAMERA_DISTANCE,
      pos.y + CAMERA_HEIGHT,
      pos.z + Math.cos(cameraAngle.current) * CAMERA_DISTANCE
    )
    
    camera.position.lerp(camPos, 0.1)
    
    const lookAt = pos.clone()
    lookAt.y += 1.2
    camera.lookAt(lookAt)
  })
  
  return (
    <group ref={group} position={[0, 0, 0]}>
      <primitive object={scene} scale={1} />
    </group>
  )
}

// Fallback component
function FallbackCharacter() {
  const group = useRef()
  const { camera, gl } = useThree()
  
  const keys = useRef({ w: false, s: false, a: false, d: false })
  const angle = useRef(0)
  const locked = useRef(false)
  
  useEffect(() => {
    const onLock = () => {
      locked.current = document.pointerLockElement === gl.domElement
    }
    const onMove = (e) => {
      if (locked.current) angle.current -= e.movementX * 0.002
    }
    const onClick = () => gl.domElement.requestPointerLock()
    
    const onDown = (e) => {
      if (e.key === 'w') keys.current.w = true
      if (e.key === 's') keys.current.s = true
      if (e.key === 'a') keys.current.a = true
      if (e.key === 'd') keys.current.d = true
    }
    const onUp = (e) => {
      if (e.key === 'w') keys.current.w = false
      if (e.key === 's') keys.current.s = false
      if (e.key === 'a') keys.current.a = false
      if (e.key === 'd') keys.current.d = false
    }
    
    document.addEventListener('pointerlockchange', onLock)
    document.addEventListener('mousemove', onMove)
    gl.domElement.addEventListener('click', onClick)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    
    return () => {
      document.removeEventListener('pointerlockchange', onLock)
      document.removeEventListener('mousemove', onMove)
      gl.domElement.removeEventListener('click', onClick)
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [gl])
  
  useFrame(() => {
    if (!group.current) return
    
    const speed = 0.1
    const dir = new THREE.Vector3(0, 0, 0)
    
    if (keys.current.w) dir.z -= 1
    if (keys.current.s) dir.z += 1
    if (keys.current.a) dir.x -= 1
    if (keys.current.d) dir.x += 1
    
    if (dir.length() > 0) {
      dir.normalize()
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle.current)
      
      group.current.position.x += dir.x * speed
      group.current.position.z += dir.z * speed
      
      const targetAngle = Math.atan2(dir.x, dir.z)
      group.current.rotation.y = targetAngle
    }
    
    group.current.position.x = Math.max(-23, Math.min(23, group.current.position.x))
    group.current.position.z = Math.max(-23, Math.min(23, group.current.position.z))
    
    const camX = group.current.position.x + Math.sin(angle.current) * 6
    const camZ = group.current.position.z + Math.cos(angle.current) * 6
    
    camera.position.x += (camX - camera.position.x) * 0.1
    camera.position.y = group.current.position.y + 2.5
    camera.position.z += (camZ - camera.position.z) * 0.1
    
    camera.lookAt(group.current.position.x, group.current.position.y + 1, group.current.position.z)
  })
  
  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 1, 0.4]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <mesh position={[0, 0.5, -0.3]} castShadow>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#f39c12" />
      </mesh>
    </group>
  )
}

// Main component with error boundary
function Man() {
  const [hasError, setHasError] = React.useState(false)
  
  React.useEffect(() => {
    console.log('🔍 Checking for model at: /models/man.glb')
  }, [])
  
  if (hasError) {
    console.error('❌ Model failed to load - using fallback')
    return <FallbackCharacter />
  }
  
  return (
    <Suspense fallback={<FallbackCharacter />}>
      <React.Fragment>
        <ManModel />
      </React.Fragment>
    </Suspense>
  )
}

// Preload
useGLTF.preload('/models/man.glb')

export default Man