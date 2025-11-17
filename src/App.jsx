import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import Loader from './components/Loader'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 15], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={<Loader />}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="instructions">
        <h3>🚗 Car Controls</h3>
        <p>Click to lock mouse</p>
        <p>W / ↑ - Accelerate</p>
        <p>S / ↓ - Brake / Reverse</p>
        <p>A / ← - Steer Left</p>
        <p>D / → - Steer Right</p>
        <p>Move Mouse - Look Around</p>
      </div>
      <div className="speedometer">
        <p>🏁 Drive around the room!</p>
      </div>
    </div>
  )
}

export default App