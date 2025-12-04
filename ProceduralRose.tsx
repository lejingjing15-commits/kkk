
import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import { ROSE_COUNT } from '../constants';

// Golden Angle for Phyllotaxis
const GOLDEN_ANGLE = 137.5 * (Math.PI / 180);

interface ProceduralRoseProps {
  position: [number, number, number];
  color: string;
  trunkColor: string;
  scale?: number;
  bloomIntensity?: number;
  stemLength?: number;
  storm?: boolean;
}

interface PetalProps {
  i: number;
  scaleFactor: number;
  bloomIntensity: number;
  storm: boolean;
}

const Petal: React.FC<PetalProps> = ({ i, scaleFactor, storm }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Phyllotaxis Algorithm
  const theta = i * GOLDEN_ANGLE;
  // Flatter distribution for a "tree canopy" look
  const r = 0.08 * Math.sqrt(i) * scaleFactor; 
  const y = Math.log(i + 1) * 0.1 * scaleFactor;
  
  const position = new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
  
  const [hovered, setHover] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Storm Interaction
    let stormShakeX = 0;
    let stormShakeZ = 0;
    
    if (storm) {
        // Violent shaking
        stormShakeX = Math.sin(time * 15 + i) * 0.1;
        stormShakeZ = Math.cos(time * 18 + i) * 0.1;
    }

    // Gentle breathing
    const breathing = Math.sin(time * 0.5 + i * 0.1) * 0.01;
    
    const targetScale = clicked ? 0.9 : (hovered ? 1.3 : 1.0);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    // Rotation logic
    let targetRotZ = Math.sin(time * 1.5 + i) * 0.05 + stormShakeZ;
    if (hovered) {
        targetRotZ += Math.sin(time * 20) * 0.05;
    }
    
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotZ, 0.1);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, stormShakeX, 0.1);
    
    const targetLift = hovered ? 0.1 : 0;
    const targetY = y + breathing + targetLift + (storm ? Math.sin(time * 8)*0.03 : 0);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
  });

  return (
    <group ref={meshRef} position={position} rotation={[0, -theta, 0]}>
       <group rotation={[Math.PI / 3 + (i / ROSE_COUNT) * 0.3, 0, 0]}> 
          <Instance
            onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
            onPointerOut={() => { setHover(false); setClicked(false); }}
            onPointerDown={(e) => { e.stopPropagation(); setClicked(true); }}
            onPointerUp={() => { setClicked(false); }}
            color={hovered ? '#fff' : undefined} 
          />
       </group>
    </group>
  );
};

const ProceduralRose: React.FC<ProceduralRoseProps> = ({ 
    position, 
    color, 
    trunkColor,
    scale = 1, 
    bloomIntensity = 1,
    stemLength = 0.5,
    storm = false
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Petal Geometry - flatter for leaves effect
  const petalGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.2, 12, 12, 0, Math.PI * 2, 0, Math.PI/2);
    geo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.15, 1)); 
    return geo;
  }, []);

  // Material - Stylized, less shiny, more "toon" like but with bloom
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.4, // Higher emissive for the "glowing" anime look
    roughness: 0.7,
    metalness: 0.0,
    sheen: 0.5,
    side: THREE.DoubleSide,
  }), [color]);

  useFrame((state) => {
    if (groupRef.current) {
        const t = state.clock.getElapsedTime();
        const wind = storm ? 0.3 : 0.02;
        const speed = storm ? 8 : 1;
        
        const swayAmt = wind * Math.sqrt(stemLength) * 0.5;
        
        groupRef.current.rotation.z = Math.sin(t * speed + position[0]) * swayAmt;
        groupRef.current.rotation.x = Math.cos(t * speed * 0.8 + position[2]) * swayAmt;
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
        <group ref={groupRef}>
            {/* The Rose Head / Tree Canopy */}
            <group position={[0, stemLength, 0]}>
                <Instances range={ROSE_COUNT} material={material} geometry={petalGeo}>
                    {Array.from({ length: ROSE_COUNT }).map((_, i) => (
                    <Petal key={i} i={i} scaleFactor={1.8} bloomIntensity={bloomIntensity} storm={storm} />
                    ))}
                </Instances>
                
                {/* Center Core Glow */}
                <mesh position={[0, 0.1, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshBasicMaterial color="#fff" />
                    <pointLight intensity={0.5} distance={2} decay={2} color="#fff" />
                </mesh>
            </group>

            {/* The Stem / Trunk */}
            <mesh position={[0, stemLength / 2, 0]}>
                {/* Thicker base, thinner top */}
                <cylinderGeometry args={[0.04 * scale, 0.08 * scale, stemLength, 8]} />
                <meshStandardMaterial color={trunkColor} roughness={0.9} />
            </mesh>
            
            {/* Branches */}
             {stemLength > 1 && (
                <>
                 <mesh position={[0.1, stemLength * 0.7, 0]} rotation={[0,0,-Math.PI/3]}>
                    <cylinderGeometry args={[0.02, 0.04, stemLength * 0.4, 5]} />
                    <meshStandardMaterial color={trunkColor} roughness={0.9} />
                 </mesh>
                 <mesh position={[-0.1, stemLength * 0.5, 0.1]} rotation={[0.5,0,Math.PI/3]}>
                    <cylinderGeometry args={[0.02, 0.04, stemLength * 0.3, 5]} />
                    <meshStandardMaterial color={trunkColor} roughness={0.9} />
                 </mesh>
                </>
             )}
      </group>
    </group>
  );
};

export default ProceduralRose;
