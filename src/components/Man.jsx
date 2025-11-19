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
  const standingFrame = useRef(0)  // Store the perfect standing frame
  
  // Constants
  const WALK_SPEED = 0.08
  const RUN_SPEED = 0.16
  const CAMERA_DISTANCE = 6
  const CAMERA_HEIGHT = 2.5
  const JUMP_FORCE = 0.25
  const GRAVITY = 0.015
  const GROUND_LEVEL = 0
  
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
  
  // Keyboard for movement + frame testing
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
        // Jump only if on ground (GTA Vice City style)
        if (isGrounded.current && !isJumping.current) {
          isJumping.current = true
          jumpVelocity.current = JUMP_FORCE
          isGrounded.current = false
          console.log('🦘 JUMP!')
        }
        e.preventDefault() // Prevent page scroll
      }
      
      // Frame testing keys (1-8) - ONLY when standing still
      if (currentAnim.current && actions && actions[currentAnim.current]) {
        const clip = actions[currentAnim.current].getClip()
        const duration = clip.duration
        
        if (e.code === 'Digit1') {
          standingFrame.current = 0
          console.log('🦵 Testing Frame: 0% (start)')
        } else if (e.code === 'Digit2') {
          standingFrame.current = duration * 0.125
          console.log('🦵 Testing Frame: 12.5%')
        } else if (e.code === 'Digit3') {
          standingFrame.current = duration * 0.25
          console.log('🦵 Testing Frame: 25%')
        } else if (e.code === 'Digit4') {
          standingFrame.current = duration * 0.375
          console.log('🦵 Testing Frame: 37.5%')
        } else if (e.code === 'Digit5') {
          standingFrame.current = duration * 0.5
          console.log('🦵 Testing Frame: 50% (mid-cycle)')
        } else if (e.code === 'Digit6') {
          standingFrame.current = duration * 0.625
          console.log('🦵 Testing Frame: 62.5%')
        } else if (e.code === 'Digit7') {
          standingFrame.current = duration * 0.75
          console.log('🦵 Testing Frame: 75%')
        } else if (e.code === 'Digit8') {
          standingFrame.current = duration * 0.875
          console.log('🦵 Testing Frame: 87.5%')
        }
        
        // Apply the frame immediately if standing still
        if (speed.current < 0.01) {
          actions[currentAnim.current].time = standingFrame.current
          actions[currentAnim.current].paused = true
          console.log('✅ Applied! Check if both legs are on ground now.')
          console.log('💡 If not perfect, try another number (1-8)')
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
  
  // Start with idle animation - PAUSED initially
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
    )
    
    // If idle exists, play it
    if (idle && actions[idle]) {
      actions[idle].play()
      currentAnim.current = idle
      console.log('🎬 Playing IDLE animation (legs on ground):', idle)
    } else {
      // No idle animation - find the perfect standing frame
      const firstAnim = animNames[0]
      if (firstAnim && actions[firstAnim]) {
        const clip = actions[firstAnim].getClip()
        const duration = clip.duration
        
        console.log('🔍 FINDING PERFECT STANDING FRAME...')
        console.log('📊 Animation duration:', duration.toFixed(2), 'seconds')
        
        // Running animations typically have both feet on ground at specific points
        // For running man: usually at 0%, 50% of the cycle
        
        // Test different frames
        const testFrames = [
          { percent: 0, time: 0 },
          { percent: 12.5, time: duration * 0.125 },
          { percent: 25, time: duration * 0.25 },
          { percent: 37.5, time: duration * 0.375 },
          { percent: 50, time: duration * 0.5 },
          { percent: 62.5, time: duration * 0.625 },
          { percent: 75, time: duration * 0.75 },
          { percent: 87.5, time: duration * 0.875 }
        ]
        
        console.log('🦵 Try these frames to find both legs on ground:')
        testFrames.forEach(frame => {
          console.log(`  - ${frame.percent}%: time = ${frame.time.toFixed(3)}`)
        })
        
        // For most running animations, 50% is usually the best (mid-stride both feet down)
        // But let's try 0% first (start position)
        standingFrame.current = 0  // Start with frame 0
        
        actions[firstAnim].play()
        actions[firstAnim].time = standingFrame.current
        actions[firstAnim].paused = true
        currentAnim.current = firstAnim
        
        console.log('✅ Currently using: 0% (frame 0)')
        console.log('💡 TO FIX LEGS: Press numbers 1-8 to try different frames!')
        console.log('   1 = 0%   | 2 = 12.5% | 3 = 25%  | 4 = 37.5%')
        console.log('   5 = 50%  | 6 = 62.5% | 7 = 75%  | 8 = 87.5%')
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
    
    // Jump physics (GTA Vice City style)
    if (isJumping.current || !isGrounded.current) {
      // Apply gravity
      jumpVelocity.current -= GRAVITY
      pos.y += jumpVelocity.current
      
      // Check if landed on ground
      if (pos.y <= GROUND_LEVEL) {
        pos.y = GROUND_LEVEL
        jumpVelocity.current = 0
        isJumping.current = false
        isGrounded.current = true
        console.log('✅ Landed on ground')
      }
    } else {
      // Make sure character stays on ground
      pos.y = GROUND_LEVEL
    }
    
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
        // For running man models: PAUSE animation, don't switch to idle
        target = currentAnim.current  // Keep current animation but we'll pause it below
      }
      
      // CRITICAL: Control animation playback based on movement
      if (actuallyMoving) {
        // Character IS moving - play animation
        if (target && currentAnim.current !== target) {
          // Switch to movement animation
          if (currentAnim.current && actions[currentAnim.current]) {
            actions[currentAnim.current].fadeOut(0.15)
          }
          
          if (actions[target]) {
            actions[target].reset().fadeIn(0.15).play()
            currentAnim.current = target
            
            if (target === walk) {
              console.log('🚶 WALKING - Legs moving')
            } else if (target === run) {
              console.log('🏃 RUNNING - Legs moving fast')
            }
          }
        }
        
        // Make sure animation is playing and match speed to movement
        if (currentAnim.current && actions[currentAnim.current]) {
          // Resume animation if it was paused
          if (actions[currentAnim.current].paused) {
            actions[currentAnim.current].paused = false
            console.log('▶️ RESUMED - Animation playing again')
          }
          
          if (!actions[currentAnim.current].isRunning()) {
            actions[currentAnim.current].play()
          }
          
          const speedRatio = speed.current / (running ? RUN_SPEED : WALK_SPEED)
          const animSpeed = Math.max(0.5, Math.min(1.5, speedRatio * (running ? 1.2 : 1.0)))
          actions[currentAnim.current].setEffectiveTimeScale(animSpeed)
        }
        
      } else {
        // Character NOT moving - STOP/PAUSE all animations (GTA style)
        if (currentAnim.current && actions[currentAnim.current]) {
          // Stop the animation completely - legs freeze on ground
          if (actions[currentAnim.current].isRunning() || !actions[currentAnim.current].paused) {
            actions[currentAnim.current].paused = true
            
            // Use the standing frame we found (adjusted with number keys 1-8)
            actions[currentAnim.current].time = standingFrame.current
            
            console.log('🧍 STOPPED - Animation PAUSED at frame:', standingFrame.current.toFixed(3))
            console.log('💡 Not perfect? Press 1-8 to find frame with both legs on ground')
          }
        }
        
        // Also try idle animation if it exists
        if (idle && actions[idle] && currentAnim.current !== idle) {
          if (currentAnim.current && actions[currentAnim.current]) {
            actions[currentAnim.current].stop()
          }
          actions[idle].play()
          currentAnim.current = idle
          console.log('🧍 IDLE - Standing still')
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