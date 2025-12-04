
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import ProceduralRose from './ProceduralRose';
import FloatingPetals from './FloatingPetals';
import { ThemeColor } from '../types';
import { THEMES } from '../constants';

interface ExperienceProps {
  theme: ThemeColor;
  storm: boolean;
}

const Experience: React.FC<ExperienceProps> = ({ theme, storm }) => {
  const groupRef = useRef<THREE.Group>(null);
  const activeTheme = THEMES[theme];

  // Generate a denser forest of roses
  const forest = useMemo(() => {
    const items = [];
    const count = 60; 
    const radius = 15;
    
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Distribute more evenly
        const r = 2 + Math.sqrt(Math.random()) * radius; 
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        
        // Taller trees
        const height = 2 + Math.random() * 4; 
        const scale = 0.8 + Math.random() * 0.8;
        
        items.push({ pos: [x, -1, z] as [number, number, number], height, scale, id: i });
    }
    return items;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
        // Slow rotation of the entire world
        groupRef.current.rotation.y = state.clock.getElapsedTime() * (storm ? 0.2 : 0.05);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.9}
        minDistance={5}
        maxDistance={25}
        autoRotate={true}
        autoRotateSpeed={storm ? 2.0 : 0.5}
      />

      {/* Stylized Pink Fog */}
      <fog attach="fog" args={[activeTheme.background, 5, 25]} />
      <color attach="background" args={[activeTheme.background]} />

      {/* Lighting - stylized, less shadows, more ambient color */}
      <ambientLight intensity={0.8} color="#ffddee" />
      <hemisphereLight intensity={0.6} color={activeTheme.primary} groundColor={activeTheme.trunk} />
      
      {/* Directional light to mimic sunlight filtering through pink leaves */}
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#fff0f5" />
      
      {/* Dramatic Backlight */}
      <spotLight 
        position={[0, 10, -10]} 
        intensity={5} 
        color={activeTheme.secondary} 
        distance={30}
        angle={1}
      />

      <group ref={groupRef}>
        {/* Main Hero Rose Tree */}
        <ProceduralRose 
            position={[0, -1, 0]} 
            color={activeTheme.primary} 
            trunkColor={activeTheme.trunk}
            scale={2} 
            stemLength={4} 
            bloomIntensity={2}
            storm={storm}
        />

        {/* The Forest */}
        {forest.map((item) => (
            <ProceduralRose 
                key={item.id}
                position={item.pos}
                color={Math.random() > 0.3 ? activeTheme.primary : activeTheme.secondary}
                trunkColor={activeTheme.trunk}
                scale={item.scale}
                stemLength={item.height}
                storm={storm}
            />
        ))}
        
        {/* Floor - Pink Ground */}
        <mesh position={[0, -1.05, 0]} rotation={[-Math.PI/2, 0, 0]} scale={[100, 100, 1]}>
           <planeGeometry />
           <meshToonMaterial color={activeTheme.ground} />
        </mesh>
      </group>

      {/* The Storm - Flying Petals */}
      <FloatingPetals 
        color="#fff0f5" 
        count={storm ? 1500 : 300} 
        storm={storm} 
      />
      
      <Sparkles count={500} scale={20} size={4} speed={0.4} opacity={0.6} color="#fff" />

      {/* Cinematic Post Processing */}
      <EffectComposer disableNormalPass>
        <DepthOfField 
            target={[0, 0, 0]} 
            focusDistance={0.02} 
            focalLength={0.15} 
            bokehScale={5} 
            height={480} 
        />
        <Bloom 
            luminanceThreshold={activeTheme.bloomThreshold} 
            mipmapBlur 
            intensity={activeTheme.bloomIntensity} 
            radius={0.8}
            levels={9}
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>
    </>
  );
};

export default Experience;
