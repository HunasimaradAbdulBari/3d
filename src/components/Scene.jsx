import React from 'react'
import { Sky } from '@react-three/drei'
import Car from './Car'

function Scene() {
  return (
    <>
      {/* Lighting - Brighter for car visibility */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[20, 30, 20]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <pointLight position={[0, 8, 0]} intensity={0.4} />
      
      {/* Additional spotlight on car area */}
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={0.5}
        castShadow
      />

      {/* Sky */}
      <Sky 
        sunPosition={[100, 20, 100]} 
        turbidity={8}
        rayleigh={2}
      />

      {/* Ground/Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2d2d2d" />
      </mesh>

      {/* Walls to create room */}
      {/* Back wall */}
      <mesh position={[0, 5, -25]} receiveShadow>
        <boxGeometry args={[50, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Front wall */}
      <mesh position={[0, 5, 25]} receiveShadow>
        <boxGeometry args={[50, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-25, 5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 50]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[25, 5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 50]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Car */}
      <Car />
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#222', 30, 80]} />
    </>
  )
}

export default Scene