'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TransactionParticlesProps {
  fromPosition: THREE.Vector3;
  toPosition: THREE.Vector3;
  color: string;
  count: number;
  speed?: number;
}

export function TransactionParticles({
  fromPosition,
  toPosition,
  color,
  count,
  speed = 1,
}: TransactionParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null);

  // Generate particles along the path
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute particles along the path
      const t = i / count;
      positions[i * 3] = THREE.MathUtils.lerp(fromPosition.x, toPosition.x, t);
      positions[i * 3 + 1] = THREE.MathUtils.lerp(fromPosition.y, toPosition.y, t);
      positions[i * 3 + 2] = THREE.MathUtils.lerp(fromPosition.z, toPosition.z, t);
      
      // Random velocity for each particle
      velocities[i] = Math.random() * 0.5 + 0.5;
    }

    return { positions, velocities };
  }, [fromPosition, toPosition, count]);

  // Animate particles
  useFrame((state) => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Calculate current progress (0 to 1)
      const currentX = positions[i * 3];
      const currentY = positions[i * 3 + 1];
      const currentZ = positions[i * 3 + 2];

      // Calculate direction vector
      const dx = toPosition.x - currentX;
      const dy = toPosition.y - currentY;
      const dz = toPosition.z - currentZ;

      // Move particle
      const velocity = velocities[i] * speed * 0.02;
      positions[i * 3] += dx * velocity;
      positions[i * 3 + 1] += dy * velocity;
      positions[i * 3 + 2] += dz * velocity;

      // Reset if reached destination
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance < 0.2) {
        positions[i * 3] = fromPosition.x;
        positions[i * 3 + 1] = fromPosition.y;
        positions[i * 3 + 2] = fromPosition.z;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
