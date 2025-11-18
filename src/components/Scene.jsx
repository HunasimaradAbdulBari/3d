import React from 'react'
import { Sky } from '@react-three/drei'
import Room from './Room'
import Man from './Man'

function Scene() {
  return (
    <>
      {/* Lighting */}
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
      
      {/* Additional lights for better visibility */}
      <spotLight
        position={[0, 15, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.5}
        castShadow
      />
      
      <hemisphereLight
        skyColor="#87CEEB"
        groundColor="#444444"
        intensity={0.4}
      />

      {/* Sky */}
      <Sky 
        sunPosition={[100, 20, 100]} 
        turbidity={8}
        rayleigh={2}
      />

      {/* Room with reflective floor */}
      <Room />
      
      {/* Man character */}
      <Man />
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#1a1a1a', 35, 70]} />
    </>
  )
}

export default Scene