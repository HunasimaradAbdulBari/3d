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
        onCreated={({ gl }) => {
          console.log('✅ Canvas created successfully')
          console.log('WebGL Renderer:', gl)
        }}
      >
        <Suspense fallback={<Loader />}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {/* Debug panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: '#0f0',
        padding: '15px',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '8px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        {/* <div>🔍 Debug Info:</div>
        <div>• Check browser console (F12)</div>
        <div>• Model path: /models/car.glb</div>
        <div>• Look for 404 errors</div> */}
      </div>
      
      {/* <div className="instructions">
        <h3>🚗 Car Controls</h3>
        <p>Click to lock mouse</p>
        <p>W / ↑ - Accelerate</p>
        <p>S / ↓ - Brake / Reverse</p>
        <p>A / ← - Steer Left</p>
        <p>D / → - Steer Right</p>
        <p>Move Mouse - Look Around</p>
      </div> */}
      {/* <div className="speedometer">
        <p>🏁 Drive around the room!</p>
      </div> */}
    </div>
  )
}

export default App