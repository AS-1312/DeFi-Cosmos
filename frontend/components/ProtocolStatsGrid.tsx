"use client"

import { ArrowUp, ArrowDown, TrendingUp, Activity, Loader2 } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useProtocolStats } from "@/hooks/useProtocolStats"
import { useProtocolHealth } from "@/hooks/useProtocolHealth"

interface Protocol {
  id: string
  name: string
  color: string
  icon: string
  tvl: string
  tvlEth: number
  volume24h?: string
  volume24hEth?: number
  transactions24h: string
  utilization?: number
  tps: number
  health?: number
  lastBlockNumber?: string
}

const getHealthColor = (health?: number) => {
  if (!health) return "#6b7280"
  if (health >= 80) return "#10b981"
  if (health >= 50) return "#eab308"
  return "#ef4444"
}

const formatTvl = (tvlString: string): { display: string; eth: number } => {
  const tvlBigInt = BigInt(tvlString || '0')
  const tvlEth = Number(tvlBigInt) / 1e18
  
  if (tvlEth > 1000000) {
    return { display: `${(tvlEth / 1000000).toFixed(2)}M ETH`, eth: tvlEth }
  } else if (tvlEth > 1000) {
    return { display: `${(tvlEth / 1000).toFixed(2)}K ETH`, eth: tvlEth }
  }
  return { display: `${tvlEth.toFixed(2)} ETH`, eth: tvlEth }
}

export function ProtocolStatsGrid() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const { protocols: rawProtocols, loading: statsLoading } = useProtocolStats()
  const { health: healthData } = useProtocolHealth()

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Get Aave health data
  const aaveHealth = healthData.find(h => h.protocol?.toLowerCase().includes('aave'))

  // Transform protocols data
  const protocols: Protocol[] = rawProtocols.map(p => {
    const tvlFormatted = formatTvl(p.tvl)
    const volume24hFormatted = p.volume24h ? formatTvl(p.volume24h) : undefined
    
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      icon: p.icon,
      tvl: tvlFormatted.display,
      tvlEth: tvlFormatted.eth,
      volume24h: volume24hFormatted?.display,
      volume24hEth: volume24hFormatted?.eth,
      transactions24h: Number(p.transactionCount24h || 0).toLocaleString(),
      utilization: p.id === 'aave-v3' && aaveHealth?.utilizationRate 
        ? aaveHealth.utilizationRate 
        : undefined,
      tps: p.tps || 0,
      health: p.healthScore || (p.id === 'aave-v3' && aaveHealth?.healthScore ? aaveHealth.healthScore : undefined),
      lastBlockNumber: p.lastBlockNumber,
    }
  })

  // Sort by TVL (highest first)
  const sortedProtocols = [...protocols].sort((a, b) => b.tvlEth - a.tvlEth)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedProtocols.map((protocol) => (
        <div
          key={protocol.id}
          className="glass-card p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group relative overflow-hidden"
          style={{
            borderColor: `${protocol.color}40`,
            boxShadow:
              hoveredCard === protocol.id
                ? `0 20px 40px -12px ${protocol.color}40, 0 0 30px -5px ${protocol.color}30`
                : undefined,
          }}
          onMouseEnter={() => setHoveredCard(protocol.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ 
                  backgroundColor: `${protocol.color}20`,
                  border: `2px solid ${protocol.color}`,
                  boxShadow: `0 0 20px ${protocol.color}40`
                }}
              >
                {protocol.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{protocol.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {protocol.health !== undefined ? (
                    <>
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: getHealthColor(protocol.health) }}
                      />
                      <span className="text-xs text-white/60">
                        Health: {protocol.health}/100
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-white/40">No health data</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Metrics */}
          <div className="space-y-4 mb-6">
            {/* TVL */}
            <div>
              <div className="text-xl font-bold text-white mb-1 leading-tight">
                {protocol.tvl}
              </div>
              <div className="text-xs text-white/60">
                {protocol.id === 'lido' ? 'Total Staked' : 'Total Value Locked'}
              </div>
            </div>

            {/* Block Number */}
            {protocol.lastBlockNumber && (
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>Last updated: Block #{parseInt(protocol.lastBlockNumber).toLocaleString()}</span>
              </div>
            )}

            {/* Grid of smaller metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {protocol.volume24h && (
                <div>
                  <div className="text-sm text-white/60">Volume 24h</div>
                  <div className="text-base font-semibold text-white">{protocol.volume24h}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-white/60">Transactions</div>
                <div className="text-base font-semibold text-white">{protocol.transactions24h}</div>
              </div>
              {protocol.utilization !== undefined && (
                <div>
                  <div className="text-sm text-white/60">Utilization</div>
                  <div className="text-base font-semibold text-blue-400">
                    {(protocol.utilization * 100).toFixed(1)}%
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-white/60">TPS</div>
                <div className="text-base font-semibold text-white flex items-center gap-1">
                  {protocol.tps.toFixed(2)}
                  <Activity className="w-3 h-3 animate-pulse" style={{ color: protocol.color }} />
                </div>
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400">Live • Updates every 2s</span>
          </div>

          {/* View Details Button - Shows on hover */}
          <div
            className={`transition-all duration-300 ${
              hoveredCard === protocol.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <Button
              className="w-full text-white font-semibold"
              style={{
                background: `linear-gradient(135deg, ${protocol.color}, ${protocol.color}dd)`,
              }}
              onClick={() => {
                // Navigate to protocol detail page
                window.location.href = `/protocols`
              }}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>

          {/* Glow effect on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${protocol.color}15, transparent 70%)`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
