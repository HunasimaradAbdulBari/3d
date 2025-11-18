import React from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'

function Room() {
  return (
    <group>
      {/* Reflective Floor - Bigger for running */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#2d2d2d"
          metalness={0.5}
        />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 5, -25]} receiveShadow castShadow>
        <boxGeometry args={[50, 10, 0.5]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* Front Wall */}
      <mesh position={[0, 5, 25]} receiveShadow castShadow>
        <boxGeometry args={[50, 10, 0.5]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-25, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[50, 10, 0.5]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[25, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[50, 10, 0.5]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 10, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Some obstacles/decorations */}
      <mesh position={[-10, 0.5, -10]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>

      <mesh position={[10, 0.5, -10]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>

      <mesh position={[-10, 0.5, 10]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
        <meshStandardMaterial color="#f39c12" />
      </mesh>

      <mesh position={[10, 0.5, 10]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
        <meshStandardMaterial color="#9b59b6" />
      </mesh>

      {/* Center platform */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 3, 0.5, 32]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  )
}

export default Room