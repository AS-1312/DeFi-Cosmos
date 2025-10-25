'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Protocol {
  id: string;
  name: string;
  tvl: string;
  volume24h?: string;
  transactionCount24h: string;
  tps?: number;
  color: string;
  icon: string;
  healthScore?: number;
  lastBlockNumber?: string;
}

interface ProtocolPlanetProps {
  protocol: Protocol;
  orbitRadius: number;
  startAngle: number;
  onClick?: (protocol: Protocol) => void;
}

export function ProtocolPlanet({ protocol, orbitRadius, startAngle, onClick }: ProtocolPlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate planet size from TVL (logarithmic scale + enhanced scaling)
  const tvlBigInt = BigInt(protocol.tvl || '0');
  const tvlEth = Number(tvlBigInt) / 1e18;
  const baseSize = 0.3;
  const scaleFactor = Math.min(Math.log10(tvlEth + 1) / 8, 1.2);
  const planetSize = baseSize + scaleFactor;

  // Determine planet color (health-based blending)
  const planetColor = protocol.color;
  
  // Calculate glow intensity based on health score (0-2 range)
  const healthGlow = useMemo(() => {
    if (protocol.healthScore === undefined) return 1.0;
    // Higher health = more glow
    return 0.5 + (protocol.healthScore / 100) * 1.5;
  }, [protocol.healthScore]);

  // Calculate orbital speed from TPS (higher TPS = faster orbit)
  const baseSpeed = 0.02;
  const tpsMultiplier = Math.min((protocol.tps || 0) / 10, 5); // Cap at 5x speed
  const orbitalSpeed = baseSpeed + tpsMultiplier * 0.04;

  // Calculate emissive intensity (pulse effect based on activity)
  const txCount = Number(protocol.transactionCount24h || '0');
  const activityIntensity = Math.min(txCount / 5000, 1.5);
  const pulseIntensity = 0.5 + activityIntensity * 0.8;

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

    // Planet self-rotation (faster with more activity)
    const rotationSpeed = 0.01 + (txCount / 10000) * 0.02;
    meshRef.current.rotation.y += rotationSpeed;

    // Animate glow ring
    if (glowRef.current) {
      glowRef.current.rotation.z += 0.005;
      // Pulse effect based on health
      const pulseScale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1 * healthGlow;
      glowRef.current.scale.set(pulseScale, pulseScale, 1);
    }
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
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(protocol);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={hovered ? 1.15 : 1}
      >
        <sphereGeometry args={[planetSize, 32, 32]} />
        <meshStandardMaterial
          color={planetColor}
          emissive={planetColor}
          emissiveIntensity={pulseIntensity * healthGlow}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Glow ring (health-based intensity) */}
      <mesh 
        ref={glowRef}
        position={[0, 0, 0]} 
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[planetSize + 0.2, planetSize + 0.4, 32]} />
        <meshBasicMaterial
          color={planetColor}
          opacity={0.3 * healthGlow}
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
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
          <div className="bg-black/95 backdrop-blur-md px-4 py-3 rounded-lg border border-white/20 shadow-2xl min-w-[240px] pointer-events-none animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: planetColor, boxShadow: `0 0 10px ${planetColor}` }}
              />
              <p className="text-white font-bold text-sm">{protocol.name}</p>
            </div>
            
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400">Size (TVL):</span>
                <span className="text-white font-semibold">
                  {tvlEth.toFixed(2)} ETH
                </span>
              </div>
              
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400">Activity:</span>
                <span className="text-white font-semibold">
                  {Number(protocol.transactionCount24h || 0).toLocaleString()} txs
                </span>
              </div>
              
              {protocol.tps !== undefined && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-400">Speed (TPS):</span>
                  <span className="text-white font-semibold">
                    {protocol.tps.toFixed(3)}
                  </span>
                </div>
              )}
              
              {protocol.healthScore !== undefined && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-400">Glow (Health):</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 w-16 bg-white/20 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${protocol.healthScore}%`,
                          backgroundColor: planetColor,
                        }}
                      />
                    </div>
                    <span style={{ color: planetColor }} className="font-semibold">
                      {protocol.healthScore}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-white/10 text-center">
              <span className="text-[10px] text-gray-500">Click planet for detailed stats</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
