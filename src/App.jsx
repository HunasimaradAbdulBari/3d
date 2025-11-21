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
      
      {/* Beautiful Modern UI */}
      {/* <div className="controls-panel">
        <div className="control-group">
          <div className="control-title">🚶 On Foot</div>
          <div className="control-item"><kbd>W A S D</kbd> Move</div>
          <div className="control-item"><kbd>Shift</kbd> Run</div>
          <div className="control-item"><kbd>Space</kbd> Jump</div>
          <div className="control-item"><kbd>F</kbd> Enter Car</div>
        </div>
        
        <div className="control-group">
          <div className="control-title">🚗 In Car</div>
          <div className="control-item"><kbd>W</kbd> Accelerate</div>
          <div className="control-item"><kbd>S</kbd> Brake/Reverse</div>
          <div className="control-item"><kbd>A D</kbd> Steer</div>
          <div className="control-item"><kbd>F</kbd> Exit Car</div>
        </div>
        
        <div className="control-group">
          <div className="control-title">🖱️ Camera</div>
          <div className="control-item"><kbd>Click</kbd> Lock Mouse</div>
          <div className="control-item"><kbd>Mouse</kbd> Look Around</div>
          <div className="control-item"><kbd>ESC</kbd> Release</div>
        </div>
      </div> */}

      {/* Status Indicator */}
      {/* <div className="status-badge">
        <div className="status-dot"></div>
        <span>🚗 GTA-Style Car System</span>
      </div> */}

      {/* Instructions */}
      {/* <div className="help-text">
        Walk to the police car and press <kbd>F</kbd> to enter
      </div> */}
    </div>
  )
}

export default App