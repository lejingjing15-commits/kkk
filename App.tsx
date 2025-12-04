
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Experience from './components/Experience';
import Overlay from './components/Overlay';
import { ThemeColor } from './types';

function App() {
  const [theme, setTheme] = useState<ThemeColor>('tatami');
  const [storm, setStorm] = useState(false);

  return (
    <div className="relative w-full h-screen bg-[#FFCce6]">
      <Canvas
        shadows
        dpr={[1, 2]} // Quality scaling for retina
        gl={{ 
            antialias: false, 
            toneMapping: 3, // ACESFilmic
            toneMappingExposure: 1.1
        }}
        camera={{ position: [0, 2, 8], fov: 50 }}
      >
        <Suspense fallback={null}>
          <Experience theme={theme} storm={storm} />
        </Suspense>
      </Canvas>
      
      <Overlay theme={theme} setTheme={setTheme} storm={storm} setStorm={setStorm} />
      
      <Loader 
        containerStyles={{ background: '#FFCce6' }}
        innerStyles={{ width: '200px', height: '4px', background: '#FF0055' }}
        barStyles={{ background: '#4A0E2E', height: '4px' }}
        dataStyles={{ color: '#4A0E2E', fontSize: '12px', fontWeight: 'bold' }}
      />
    </div>
  );
}

export default App;
