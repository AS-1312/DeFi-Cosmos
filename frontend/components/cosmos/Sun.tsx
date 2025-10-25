'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface SunProps {
  totalTvl?: string;
  totalTransactions?: number;
  latestBlock?: number;
  activeProtocols?: number;
}

export function Sun({ totalTvl, totalTransactions, latestBlock, activeProtocols }: SunProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.002;
  });

  // Calculate total TVL in ETH
  const tvlBigInt = BigInt(totalTvl || '0');
  const tvlEth = Number(tvlBigInt) / 1e18;

  return (
    <group>
      {/* Sun mesh */}
      <mesh 
        ref={meshRef} 
        position={[0, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={hovered ? 1.1 : 1}
      >
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffa500"
          emissiveIntensity={hovered ? 2.5 : 2}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Glow ring (optional) */}
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[1.8, 2.2, 32]} />
        <meshBasicMaterial
          color="#ffd700"
          opacity={hovered ? 0.5 : 0.3}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Tooltip on hover */}
      {hovered && (
        <Html position={[0, 2.5, 0]} center>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md px-5 py-4 rounded-xl border-2 border-yellow-400/40 shadow-2xl min-w-[260px] pointer-events-none">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse" />
              <p className="text-white font-bold text-base">Ethereum Network</p>
            </div>
            
            <div className="space-y-2 text-xs">
              {latestBlock !== undefined && latestBlock > 0 && (
                <div className="flex justify-between items-center py-1.5 px-2 rounded bg-black/30">
                  <span className="text-yellow-200">Latest Block:</span>
                  <span className="text-white font-bold">
                    #{latestBlock.toLocaleString()}
                  </span>
                </div>
              )}
              
              {tvlEth > 0 && (
                <div className="flex justify-between items-center py-1.5 px-2 rounded bg-black/30">
                  <span className="text-yellow-200">Total TVL:</span>
                  <span className="text-white font-bold">
                    {tvlEth.toFixed(2)} ETH
                  </span>
                </div>
              )}
              
              {totalTransactions !== undefined && totalTransactions > 0 && (
                <div className="flex justify-between items-center py-1.5 px-2 rounded bg-black/30">
                  <span className="text-yellow-200">24h Transactions:</span>
                  <span className="text-white font-bold">
                    {totalTransactions.toLocaleString()}
                  </span>
                </div>
              )}
              
              {activeProtocols !== undefined && activeProtocols > 0 && (
                <div className="flex justify-between items-center py-1.5 px-2 rounded bg-black/30">
                  <span className="text-yellow-200">Active Protocols:</span>
                  <span className="text-white font-bold">
                    {activeProtocols}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-yellow-400/20">
              <p className="text-[10px] text-yellow-200/60 text-center">
                The heart of DeFi Cosmos
              </p>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
