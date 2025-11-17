import React from 'react'
import { Html } from '@react-three/drei'

function Loader() {
  return (
    <Html center>
      <div style={{
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        Loading 3D Scene...
        <div style={{
          marginTop: '20px',
          width: '50px',
          height: '50px',
          border: '5px solid #333',
          borderTop: '5px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Html>
  )
}

export default Loader