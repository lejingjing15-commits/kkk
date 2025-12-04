import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const FloatingPetals: React.FC<{ color: string, count?: number, storm?: boolean }> = ({ color, count = 100, storm = false }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize random particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 1000; i++) { // Max pool size
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -10 + Math.random() * 20;
      const yFactor = -5 + Math.random() * 10;
      const zFactor = -10 + Math.random() * 20;
      // Store random offsets for storm mode
      const stormOffset = Math.random() * Math.PI * 2;
      const stormRadius = 2 + Math.random() * 5;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, stormOffset, stormRadius, my: 0 });
    }
    return temp;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.08, 0.08);
    // Curl the petal
    const pos = geo.attributes.position;
    for(let i = 0; i < pos.count; i++){
        const x = pos.getX(i);
        const y = pos.getY(i);
        pos.setZ(i, (x*x + y*y) * 4);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(() => new THREE.MeshBasicMaterial({
     color: color,
     transparent: true,
     opacity: 0.8,
     side: THREE.DoubleSide,
     depthWrite: false,
     blending: THREE.AdditiveBlending
  }), [color]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    // We only render `count` particles, but we have a pool of 1000
    // This allows increasing density smoothly if we wanted, but React lifecycle handles prop updates
    
    particles.forEach((particle, i) => {
      if (i >= count) return; // Skip extra particles

      let { t, factor, speed, xFactor, yFactor, zFactor, stormOffset, stormRadius } = particle;
      
      const time = state.clock.getElapsedTime();

      if (storm) {
          // STORM MODE: Vortex physics
          // Use 'i' to create ribbons
          const angle = time * 2 + stormOffset + (i * 0.01);
          const radius = stormRadius + Math.sin(time * 3 + i) * 1;
          const height = (Math.sin(time + i * 0.05) * 5) + 2; // Move up and down broadly

          dummy.position.set(
              Math.cos(angle) * radius,
              height + Math.sin(time * 5 + i) * 0.5, // Jitter Y
              Math.sin(angle) * radius
          );

          // Chaotic Rotation
          dummy.rotation.set(
              time * 5 + i, 
              time * 5 + i, 
              time * 5 + i
          );
          
          const s = 1.5 + Math.sin(time * 10 + i) * 0.5;
          dummy.scale.set(s, s, s);

      } else {
          // CALM MODE: Lissajous floating
          // Update internal time
          particle.t += speed / 2;
          const ct = particle.t;
          
          const a = Math.cos(ct) + Math.sin(ct * 1) / 10;
          const b = Math.sin(ct) + Math.cos(ct * 2) / 10;
          const s = Math.cos(ct);
          
          dummy.position.set(
            (particle.my / 10) * a + xFactor + Math.cos((ct / 10) * factor) + (Math.sin(ct * 1) * factor) / 10,
            (particle.my / 10) * b + yFactor + Math.sin((ct / 10) * factor) + (Math.cos(ct * 2) * factor) / 10,
            (particle.my / 10) * b + zFactor + Math.cos((ct / 10) * factor) + (Math.sin(ct * 3) * factor) / 10
          );
          
          dummy.scale.set(s, s, s);
          dummy.rotation.set(s * 5, s * 5, s * 5);
      }
      
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, material, count]} />
  );
};

export default FloatingPetals;