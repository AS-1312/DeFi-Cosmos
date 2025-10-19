"use client"

import { ArrowUp, ArrowDown, TrendingUp, Activity } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface Protocol {
  id: string
  name: string
  color: string
  tvl: string
  change24h: number
  volume24h: string
  transactions24h: string
  utilization?: string
  tps: number
  health: number
  sparklineData: { value: number }[]
}

const protocols: Protocol[] = [
  {
    id: "uniswap",
    name: "Uniswap",
    color: "#ff007a",
    tvl: "24.5K ETH + 15.2M USDC + 8.1M DAI",
    change24h: 5.2,
    volume24h: "8.2K ETH",
    transactions24h: "15.2K",
    tps: 45,
    health: 92,
    sparklineData: [
      { value: 20 },
      { value: 25 },
      { value: 22 },
      { value: 30 },
      { value: 28 },
      { value: 35 },
      { value: 32 },
      { value: 38 },
    ],
  },
  {
    id: "aave",
    name: "Aave",
    color: "#8b5cf6",
    tvl: "18.3K ETH + 42.5M USDC",
    change24h: -2.1,
    volume24h: "5.6K ETH",
    transactions24h: "8.4K",
    utilization: "72%",
    tps: 32,
    health: 88,
    sparklineData: [
      { value: 30 },
      { value: 28 },
      { value: 32 },
      { value: 29 },
      { value: 27 },
      { value: 25 },
      { value: 26 },
      { value: 24 },
    ],
  },
  {
    id: "curve",
    name: "Curve",
    color: "#3b82f6",
    tvl: "8.1M DAI + 5.2M USDC + 3.4M USDT",
    change24h: 3.8,
    volume24h: "3.8M USDC",
    transactions24h: "6.1K",
    tps: 28,
    health: 78,
    sparklineData: [
      { value: 18 },
      { value: 20 },
      { value: 19 },
      { value: 23 },
      { value: 25 },
      { value: 24 },
      { value: 27 },
      { value: 26 },
    ],
  },
  {
    id: "lido",
    name: "Lido",
    color: "#f97316",
    tvl: "142K ETH staked",
    change24h: 1.5,
    volume24h: "2.4K ETH",
    transactions24h: "4.8K",
    tps: 18,
    health: 95,
    sparklineData: [
      { value: 25 },
      { value: 26 },
      { value: 27 },
      { value: 28 },
      { value: 27 },
      { value: 29 },
      { value: 30 },
      { value: 31 },
    ],
  },
  {
    id: "maker",
    name: "Maker",
    color: "#1aab9b",
    tvl: "4.8M DAI",
    change24h: -4.3,
    volume24h: "1.2M DAI",
    transactions24h: "3.2K",
    utilization: "89%",
    tps: 12,
    health: 85,
    sparklineData: [
      { value: 22 },
      { value: 24 },
      { value: 21 },
      { value: 20 },
      { value: 19 },
      { value: 18 },
      { value: 17 },
      { value: 16 },
    ],
  },
]

const getHealthColor = (health: number) => {
  if (health >= 80) return "#10b981"
  if (health >= 50) return "#eab308"
  return "#ef4444"
}

export function ProtocolStatsGrid() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {protocols.map((protocol) => (
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
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: protocol.color }}
              >
                {protocol.name[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{protocol.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: getHealthColor(protocol.health) }}
                  />
                  <span className="text-xs text-white/60">
                    Health: {protocol.health}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Metrics */}
          <div className="space-y-4 mb-6">
            {/* TVL */}
            <div>
              <div className="text-xl font-bold text-white mb-1 leading-tight">{protocol.tvl}</div>
              <div className="text-xs text-white/60">Total Value Locked</div>
            </div>

            {/* 24h Change */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">24h Change:</span>
              <span
                className={`flex items-center gap-1 font-semibold ${
                  protocol.change24h > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {protocol.change24h > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(protocol.change24h)}%
              </span>
            </div>

            {/* Grid of smaller metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <div className="text-sm text-white/60">Volume 24h</div>
                <div className="text-base font-semibold text-white">{protocol.volume24h}</div>
              </div>
              <div>
                <div className="text-sm text-white/60">Transactions</div>
                <div className="text-base font-semibold text-white">{protocol.transactions24h}</div>
              </div>
              {protocol.utilization && (
                <div>
                  <div className="text-sm text-white/60">Utilization</div>
                  <div className="text-base font-semibold text-blue-400">{protocol.utilization}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-white/60">TPS</div>
                <div className="text-base font-semibold text-white flex items-center gap-1">
                  {protocol.tps}
                  <Activity className="w-3 h-3 animate-pulse" style={{ color: protocol.color }} />
                </div>
              </div>
            </div>
          </div>

          {/* Sparkline Chart */}
          <div className="h-16 mb-4 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={protocol.sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={protocol.color}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
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
