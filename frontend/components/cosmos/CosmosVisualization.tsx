'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { ProtocolPlanet } from './ProtocolPlanet';
import { Sun } from './Sun';
import { ProtocolStatsModal } from './ProtocolStatsModal';

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

interface CosmosVisualizationProps {
  protocols: Protocol[];
}

// Define orbital positions for each protocol
const ORBITAL_CONFIG = {
  'uniswap-v4': { radius: 4, startAngle: 0 },
  'aave-v3': { radius: 6, startAngle: Math.PI / 2 },
  'lido': { radius: 8, startAngle: Math.PI },
  'curve': { radius: 10, startAngle: (3 * Math.PI) / 2 },
};

export function CosmosVisualization({ protocols }: CosmosVisualizationProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Calculate aggregate metrics for Ethereum (Sun)
  const totalTvl = protocols.reduce((sum, p) => {
    const tvl = BigInt(p.tvl || '0');
    return sum + tvl;
  }, BigInt(0)).toString();

  const totalTransactions = protocols.reduce((sum, p) => {
    return sum + Number(p.transactionCount24h || 0);
  }, 0);

  const latestBlock = protocols.reduce((max, p) => {
    if (p.lastBlockNumber) {
      const blockNum = parseInt(p.lastBlockNumber);
      return blockNum > max ? blockNum : max;
    }
    return max;
  }, 0);

  const activeProtocols = protocols.filter(p => p.tvl !== '0').length;

  const handlePlanetClick = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setModalOpen(true);
  };

  return (
    <div className="w-full h-full">
      <Canvas
        className="bg-black"
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]} // Device pixel ratio (1 for mobile, 2 for desktop)
      >
        {/* Camera setup */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 12, 18]} 
          fov={60} 
        />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#ffd700" decay={2} />

        {/* Starfield background */}
        <Suspense fallback={null}>
          <Stars 
            radius={100} 
            depth={50} 
            count={5000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={1} 
          />
        </Suspense>

        {/* Central Sun (Ethereum) */}
        <Sun 
          totalTvl={totalTvl}
          totalTransactions={totalTransactions}
          latestBlock={latestBlock}
          activeProtocols={activeProtocols}
        />

        {/* Protocol Planets */}
        {protocols.map((protocol) => {
          const config = ORBITAL_CONFIG[protocol.id as keyof typeof ORBITAL_CONFIG];
          
          if (!config) return null;

          return (
            <ProtocolPlanet
              key={protocol.id}
              protocol={protocol}
              orbitRadius={config.radius}
              startAngle={config.startAngle}
              onClick={handlePlanetClick}
            />
          );
        })}

        {/* Camera controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxDistance={30}
          minDistance={8}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* Protocol Stats Modal */}
      <ProtocolStatsModal
        protocol={selectedProtocol}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
