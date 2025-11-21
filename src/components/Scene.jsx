import React, { useRef, useState } from 'react'
import { Sky } from '@react-three/drei'
import Room from './Room'
import Man from './Man'
import PoliceCar from './PoliceCar'

function Scene() {
  const carRef = useRef()
  const manRef = useRef()
  const [isInCar, setIsInCar] = useState(false)
  const [playerPosition, setPlayerPosition] = useState([0, 0, 0])
  
  const handleEnterCar = () => {
    console.log('🚗 Player entering car')
    setIsInCar(true)
  }
  
  const handleExitCar = () => {
    console.log('🚪 Player exiting car')
    setIsInCar(false)
  }
  
  return (
    <>
      {/* Professional Studio Lighting */}
      <ambientLight intensity={0.5} />
      
      {/* Main Light */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* Fill Light */}
      <directionalLight
        position={[-10, 10, -10]}
        intensity={0.3}
      />
      
      {/* Rim Light */}
      <spotLight
        position={[0, 15, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.5}
        castShadow
      />

      {/* Beautiful Sky */}
      <Sky 
        sunPosition={[100, 20, 100]} 
        turbidity={8}
        rayleigh={2}
      />

      {/* Room */}
      <Room />
      
      {/* Police Car */}
      <PoliceCar
        ref={carRef}
        position={[5, 0, 5]}
        onPlayerEnter={handleEnterCar}
        onPlayerExit={handleExitCar}
        isPlayerInside={isInCar}
        playerPosition={playerPosition}
      />
      
      {/* Character */}
      <Man 
        ref={manRef}
        isInCar={isInCar}
        carRef={carRef}
        onEnterCar={handleEnterCar}
        onExitCar={handleExitCar}
      />
      
      {/* Subtle Fog */}
      <fog attach="fog" args={['#0a0a0a', 40, 80]} />
    </>
  )
}

export default Scene