'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Protocol {
  id: string;
  name: string;
  tvl: string;
  transactionCount24h: string;
  tps?: number;
  color: string;
  icon: string;
  healthScore?: number;
}

interface ProtocolPlanetProps {
  protocol: Protocol;
  orbitRadius: number;
  startAngle: number;
}

export function ProtocolPlanet({ protocol, orbitRadius, startAngle }: ProtocolPlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate planet size from TVL (logarithmic scale)
  const tvlBigInt = BigInt(protocol.tvl || '0');
  const tvlEth = Number(tvlBigInt) / 1e18;
  const planetSize = 0.4 + Math.min(Math.log10(tvlEth + 1) / 10, 0.8);

  // Determine planet color (health score overrides protocol color)
  let planetColor = protocol.color;
  if (protocol.healthScore !== undefined) {
    planetColor = 
      protocol.healthScore >= 80 ? '#10b981' : // green
      protocol.healthScore >= 50 ? '#eab308' : // yellow
      '#ef4444'; // red
  }

  // Calculate orbital speed from TPS
  const baseSpeed = 0.05;
  const tpsMultiplier = (protocol.tps || 0) / 100;
  const orbitalSpeed = baseSpeed + tpsMultiplier * 0.3;

  // Calculate emissive intensity (pulse effect)
  const txCount = Number(protocol.transactionCount24h || '0');
  const pulseIntensity = txCount > 1000 ? 0.8 : 0.4;

  // Check if unhealthy
  const isUnhealthy = protocol.healthScore !== undefined && protocol.healthScore < 50;

  // Animation frame
  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.getElapsedTime() * orbitalSpeed;
    const angle = startAngle + t;

    // Orbital position
    meshRef.current.position.x = Math.cos(angle) * orbitRadius;
    meshRef.current.position.z = Math.sin(angle) * orbitRadius;

    // Erratic motion if unhealthy
    if (isUnhealthy) {
      meshRef.current.position.y = Math.sin(t * 3) * 0.3;
    } else {
      meshRef.current.position.y = 0;
    }

    // Planet self-rotation
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <group>
      {/* Orbital path ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 64]} />
        <meshBasicMaterial 
          color={planetColor} 
          opacity={0.2} 
          transparent 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Planet sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[planetSize, 32, 32]} />
        <meshStandardMaterial
          color={planetColor}
          emissive={planetColor}
          emissiveIntensity={pulseIntensity}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Warning icon if unhealthy */}
      {isUnhealthy && (
        <mesh position={[0, planetSize + 0.5, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      )}

      {/* Tooltip on hover */}
      {hovered && (
        <Html position={[0, planetSize + 1.5, 0]} center>
          <div className="bg-black/95 backdrop-blur-md px-4 py-3 rounded-lg border border-white/20 shadow-2xl min-w-[220px] pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: planetColor }}
              />
              <p className="text-white font-bold text-sm">{protocol.name}</p>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">TVL:</span>
                <span className="text-white font-semibold">
                  {tvlEth.toFixed(2)} ETH
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">24h Txs:</span>
                <span className="text-white font-semibold">
                  {Number(protocol.transactionCount24h || 0).toLocaleString()}
                </span>
              </div>
              
              {protocol.tps !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">TPS:</span>
                  <span className="text-white font-semibold">
                    {protocol.tps.toFixed(2)}
                  </span>
                </div>
              )}
              
              {protocol.healthScore !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Health:</span>
                  <span style={{ color: planetColor }} className="font-semibold">
                    {protocol.healthScore}/100
                  </span>
                </div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
