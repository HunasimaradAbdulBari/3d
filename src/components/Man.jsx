import React, { useEffect, useRef, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

function ManModel() {
  const group = useRef()
  const { camera, gl } = useThree()
  
  // Load new model - change filename here
  const { scene, animations } = useGLTF('/models/man (2).glb')
  const { actions } = useAnimations(animations, group)
  
  // Movement state
  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  const speed = useRef(0)
  const jumpVelocity = useRef(0)
  const isJumping = useRef(false)
  const isGrounded = useRef(true)
  
  // Keyboard state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false,
    space: false
  })
  
  // Camera control
  const cameraAngle = useRef(0)
  const isLocked = useRef(false)
  
  // Animation state
  const currentAnim = useRef(null)
  const standingFrame = useRef(0)
  
  // MANUAL SCALE CONTROL - Adjust this to make model smaller/larger
  const MANUAL_SCALE = 0.01  // Start very small and increase if needed
  // Try these values: 0.01 (tiny), 0.05 (small), 0.1 (medium), 0.2 (large)
  
  const modelScale = useRef(MANUAL_SCALE)
  
  // Constants
  const WALK_SPEED = 0.08
  const RUN_SPEED = 0.16
  const CAMERA_DISTANCE = 6
  const CAMERA_HEIGHT = 2.5
  const JUMP_FORCE = 0.25
  const GRAVITY = 0.015
  const GROUND_LEVEL = 0
  
  // Log model info on load
  useEffect(() => {
    if (!scene) return
    
    console.log('✅ New model loaded: man (2).glb')
    console.log('🔧 Manual scale applied:', MANUAL_SCALE)
    console.log('💡 Model too big? Decrease MANUAL_SCALE in code')
    console.log('💡 Model too small? Increase MANUAL_SCALE in code')
    
    // Calculate actual size
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    
    console.log('📏 Original dimensions:', {
      height: size.y.toFixed(2),
      width: size.x.toFixed(2),
      depth: size.z.toFixed(2)
    })
    console.log('📐 Scaled height will be:', (size.y * MANUAL_SCALE).toFixed(2), 'units')
    
    // Apply properties
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    
    console.log('Animations:', animations?.map(a => a.name))
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
  
  // Keyboard controls
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
      if (e.code === 'Space') {
        if (isGrounded.current && !isJumping.current) {
          isJumping.current = true
          jumpVelocity.current = JUMP_FORCE
          isGrounded.current = false
          console.log('🦘 JUMP!')
        }
        e.preventDefault()
      }
      
      // Frame testing (1-8)
      if (currentAnim.current && actions && actions[currentAnim.current]) {
        const clip = actions[currentAnim.current].getClip()
        const duration = clip.duration
        
        if (e.code === 'Digit1') standingFrame.current = 0
        else if (e.code === 'Digit2') standingFrame.current = duration * 0.125
        else if (e.code === 'Digit3') standingFrame.current = duration * 0.25
        else if (e.code === 'Digit4') standingFrame.current = duration * 0.375
        else if (e.code === 'Digit5') standingFrame.current = duration * 0.5
        else if (e.code === 'Digit6') standingFrame.current = duration * 0.625
        else if (e.code === 'Digit7') standingFrame.current = duration * 0.75
        else if (e.code === 'Digit8') standingFrame.current = duration * 0.875
        
        if (e.code.startsWith('Digit') && speed.current < 0.01) {
          actions[currentAnim.current].time = standingFrame.current
          actions[currentAnim.current].paused = true
          console.log('🦵 Frame:', standingFrame.current.toFixed(3))
        }
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
  }, [actions])
  
  // Initialize animation
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) {
      console.log('⚠️ No animations found')
      return
    }
    
    const animNames = Object.keys(actions)
    console.log('🎬 Available animations:', animNames)
    
    const idle = animNames.find(n => 
      /idle/i.test(n) || 
      /standing/i.test(n) || 
      /stand/i.test(n) ||
      /rest/i.test(n)
    )
    
    if (idle && actions[idle]) {
      actions[idle].play()
      currentAnim.current = idle
      console.log('🎬 Playing IDLE:', idle)
    } else {
      const firstAnim = animNames[0]
      if (firstAnim && actions[firstAnim]) {
        standingFrame.current = 0
        actions[firstAnim].play()
        actions[firstAnim].time = standingFrame.current
        actions[firstAnim].paused = true
        currentAnim.current = firstAnim
        
        console.log('💡 Press 1-8 to find perfect standing frame')
      }
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
    
    const moving = dir.length() > 0
    const running = keys.current.shift && moving
    const actuallyMoving = speed.current > 0.01
    
    if (moving) {
      dir.normalize()
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngle.current)
      
      const targetSpeed = running ? RUN_SPEED : WALK_SPEED
      speed.current += (targetSpeed - speed.current) * 0.15
      
      velocity.current.set(dir.x * speed.current, 0, dir.z * speed.current)
      
      const angle = Math.atan2(dir.x, dir.z)
      let diff = angle - group.current.rotation.y
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      group.current.rotation.y += diff * 0.1
      
    } else {
      speed.current *= 0.85
      velocity.current.multiplyScalar(0.85)
      
      if (speed.current < 0.01) {
        speed.current = 0
        velocity.current.set(0, 0, 0)
      }
    }
    
    // Update position
    const pos = group.current.position
    pos.x += velocity.current.x
    pos.z += velocity.current.z
    
    // Jump physics
    if (isJumping.current || !isGrounded.current) {
      jumpVelocity.current -= GRAVITY
      pos.y += jumpVelocity.current
      
      if (pos.y <= GROUND_LEVEL) {
        pos.y = GROUND_LEVEL
        jumpVelocity.current = 0
        isJumping.current = false
        isGrounded.current = true
      }
    } else {
      pos.y = GROUND_LEVEL
    }
    
    // Bounds
    pos.x = Math.max(-23, Math.min(23, pos.x))
    pos.z = Math.max(-23, Math.min(23, pos.z))
    
    // Animation system
    if (actions && Object.keys(actions).length > 0) {
      const animNames = Object.keys(actions)
      
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
      
      let target = idle
      
      if (actuallyMoving) {
        if (running && run) {
          target = run
        } else if (walk) {
          target = walk
        } else if (run) {
          target = run
        }
      } else {
        target = currentAnim.current
      }
      
      if (actuallyMoving) {
        if (target && currentAnim.current !== target) {
          if (currentAnim.current && actions[currentAnim.current]) {
            actions[currentAnim.current].fadeOut(0.15)
          }
          
          if (actions[target]) {
            actions[target].reset().fadeIn(0.15).play()
            currentAnim.current = target
          }
        }
        
        if (currentAnim.current && actions[currentAnim.current]) {
          if (actions[currentAnim.current].paused) {
            actions[currentAnim.current].paused = false
          }
          
          if (!actions[currentAnim.current].isRunning()) {
            actions[currentAnim.current].play()
          }
          
          const speedRatio = speed.current / (running ? RUN_SPEED : WALK_SPEED)
          const animSpeed = Math.max(0.5, Math.min(1.5, speedRatio * (running ? 1.2 : 1.0)))
          actions[currentAnim.current].setEffectiveTimeScale(animSpeed)
        }
        
      } else {
        if (currentAnim.current && actions[currentAnim.current]) {
          if (actions[currentAnim.current].isRunning() || !actions[currentAnim.current].paused) {
            actions[currentAnim.current].paused = true
            actions[currentAnim.current].time = standingFrame.current
          }
        }
        
        if (idle && actions[idle] && currentAnim.current !== idle) {
          if (currentAnim.current && actions[currentAnim.current]) {
            actions[currentAnim.current].stop()
          }
          actions[idle].play()
          currentAnim.current = idle
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
      {/* Apply calculated scale to the model */}
      <primitive object={scene} scale={modelScale.current} />
    </group>
  )
}

// Fallback component (unchanged)
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

// Main component
function Man() {
  const [hasError, setHasError] = React.useState(false)
  
  React.useEffect(() => {
    console.log('🔍 Loading model: /models/man (2).glb')
  }, [])
  
  if (hasError) {
    console.error('❌ Model failed - using fallback')
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

// Preload the new model
useGLTF.preload('/models/man (2).glb')

export default Man