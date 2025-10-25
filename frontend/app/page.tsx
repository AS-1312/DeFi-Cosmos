"use client"

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { ProtocolCard } from '@/components/protocol/ProtocolCard'
import { useProtocolStats } from '@/hooks/useProtocolStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from "lucide-react"

const CosmosVisualization = dynamic(
  () => import('@/components/CosmosVisualization').then(mod => mod.CosmosVisualization),
  {
    ssr: false,
    loading: () => <LoadingCosmos />,
  }
);

export default function OverviewPage() {
  const { protocols, loading, error } = useProtocolStats();

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to connect to GraphQL endpoint</p>
          <p className="text-gray-400 text-sm">{error.message}</p>
          <p className="text-gray-500 text-xs mt-4">
            Check: {process.env.NEXT_PUBLIC_GRAPHQL_HTTP || 'http://localhost:8080/v1/graphql'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          DeFi Protocol Observatory
        </h1>
        <p className="text-gray-400">
          Real-time multi-protocol analytics powered by Envio HyperSync
        </p>
        {!loading && protocols[0].tvl !== '0' && (
          <p className="text-xs text-green-400 mt-1">
            ● Live • Updates every 2 seconds
          </p>
        )}
      </div>

      {/* 3D Visualization */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl text-white">
            Live Protocol Cosmos
          </CardTitle>
          <p className="text-sm text-gray-400">
            Planet size = TVL • Color = Health • Speed = Activity
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-xl overflow-hidden">
            <Suspense fallback={<LoadingCosmos />}>
              <CosmosVisualization />
            </Suspense>
          </div>
        </CardContent>
      </Card>

      {/* Protocol Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {protocols.map((protocol) => (
            <ProtocolCard key={protocol.id} protocol={protocol} />
          ))}
        </div>
      )}
    </div>
  )
}

function LoadingCosmos() {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-b from-purple-900/20 to-blue-900/20">
      <div className="text-center">
        <div className="animate-spin text-6xl mb-4">🌌</div>
        <p className="text-gray-400">Loading Cosmos...</p>
      </div>
    </div>
  );
}