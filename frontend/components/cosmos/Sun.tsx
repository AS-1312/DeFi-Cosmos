'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.002;
  });

  return (
    <group>
      {/* Sun mesh */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffa500"
          emissiveIntensity={2}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Glow ring (optional) */}
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[1.8, 2.2, 32]} />
        <meshBasicMaterial
          color="#ffd700"
          opacity={0.3}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
