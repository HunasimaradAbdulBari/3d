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
      
      {/* Instructions Overlay */}
      {/* <div className="instructions">
        <h3>🏃 Running Man Controls</h3>
        <p>Click canvas to lock mouse</p>
        <p><strong>W / ↑</strong> - Move Forward</p>
        <p><strong>S / ↓</strong> - Move Backward</p>
        <p><strong>A / ←</strong> - Move Left</p>
        <p><strong>D / →</strong> - Move Right</p>
        <p><strong>Shift</strong> - Run (hold while moving)</p>
        <p><strong>Mouse</strong> - Look Around</p>
        <p><strong>ESC</strong> - Release Mouse</p>
      </div> */}
      
      {/* Model Status */}
      {/* <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.85)',
        color: '#2ecc71',
        padding: '12px 30px',
        borderRadius: '50px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 100,
        border: '2px solid #2ecc71',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(46, 204, 113, 0.4)'
      }}>
        📍 Model: /models/man.glb | Press F12 for console logs
      </div> */}
    </div>
  )
}

export default App