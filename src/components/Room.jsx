import React from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'

function Room() {
  return (
    <group>
      {/* Beautiful Reflective Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={50}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#1a1a1a"
          metalness={0.5}
        />
      </mesh>

      {/* Clean Walls - Minimalist */}
      
      {/* Back Wall */}
      <mesh position={[0, 5, -25]} receiveShadow>
        <boxGeometry args={[50, 10, 0.5]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.8} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-25, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[50, 10, 0.5]} />
        <meshStandardMaterial color="#34495e" roughness={0.8} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[25, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[50, 10, 0.5]} />
        <meshStandardMaterial color="#34495e" roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 10, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.9} />
      </mesh>

      {/* Simple Platform - Center */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 3, 0.2, 32]} />
        <meshStandardMaterial 
          color="#3498db" 
          metalness={0.6} 
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

export default Room