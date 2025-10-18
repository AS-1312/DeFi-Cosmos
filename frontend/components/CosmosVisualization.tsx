"use client"

import { useState, useEffect } from "react"
import { Orbit, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

// Protocol data with positions and stats
const protocols = [
  {
    id: "uniswap",
    name: "Uniswap",
    color: "#ff007a",
    tvl: 4.2,
    health: 92,
    transactions: "2.4M",
    apy: "12.5%",
    angle: -30, // degrees from top
  },
  {
    id: "aave",
    name: "Aave",
    color: "#8b5cf6",
    tvl: 5.8,
    health: 88,
    transactions: "1.8M",
    apy: "8.3%",
    angle: 30,
  },
  {
    id: "curve",
    name: "Curve",
    color: "#3b82f6",
    tvl: 3.6,
    health: 95,
    transactions: "3.1M",
    apy: "15.2%",
    angle: 90,
  },
  {
    id: "lido",
    name: "Lido",
    color: "#f97316",
    tvl: 6.2,
    health: 78,
    transactions: "892K",
    apy: "4.8%",
    angle: 150,
  },
  {
    id: "maker",
    name: "Maker",
    color: "#1aab9b",
    tvl: 4.8,
    health: 85,
    transactions: "1.2M",
    apy: "6.5%",
    angle: 210,
  },
]

// Capital flows between protocols
const flows = [
  { from: "uniswap", to: "aave", volume: 2.4, type: "yield" },
  { from: "aave", to: "curve", volume: 1.8, type: "arbitrage" },
  { from: "curve", to: "lido", volume: 3.2, type: "rebalancing" },
  { from: "lido", to: "maker", volume: 1.5, type: "yield" },
  { from: "maker", to: "uniswap", volume: 2.1, type: "arbitrage" },
]

// Whale comets
const whales = [
  { id: 1, from: "uniswap", to: "aave", progress: 0.3, amount: "$2.4M", address: "0x742d...35Bd" },
  { id: 2, from: "curve", to: "lido", progress: 0.6, amount: "$1.8M", address: "0x8f3a...92Cd" },
  { id: 3, from: "maker", to: "uniswap", progress: 0.8, amount: "$3.1M", address: "0x1a2b...47Ef" },
]

export function CosmosVisualization() {
  const [zoom, setZoom] = useState(1)
  const [showFlows, setShowFlows] = useState(true)
  const [showWhales, setShowWhales] = useState(true)
  const [hoveredProtocol, setHoveredProtocol] = useState<string | null>(null)
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null)
  const [stars, setStars] = useState<Array<{ left: string; top: string; opacity: number; animationDelay: string; animationDuration: string }>>([])
  const [isMounted, setIsMounted] = useState(false)

  // Generate stars only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    const generatedStars = [...Array(50)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.5 + 0.2,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${Math.random() * 2 + 2}s`,
    }))
    setStars(generatedStars)
  }, [])

  const centerX = 300
  const centerY = 300
  const orbitRadius = 180

  const getHealthColor = (health: number) => {
    if (health >= 80) return "#10b981"
    if (health >= 50) return "#eab308"
    return "#ef4444"
  }

  const getFlowColor = (type: string) => {
    if (type === "arbitrage") return "#ff007a"
    if (type === "yield") return "#3b82f6"
    return "#8b5cf6"
  }

  const getProtocolPosition = (angle: number) => {
    const rad = (angle * Math.PI) / 180
    return {
      x: centerX + orbitRadius * Math.cos(rad),
      y: centerY + orbitRadius * Math.sin(rad),
    }
  }

  const handleReset = () => {
    setZoom(1)
    setShowFlows(true)
    setShowWhales(true)
  }

  return (
    <div className="glass-card p-6 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Orbit className="w-5 h-5 text-purple-400" />
          DeFi Cosmos
        </h3>
        <div className="text-xs text-white/60">2D Solar System</div>
      </div>

      <div className="flex-1 relative rounded-lg bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-black/60 border border-white/10 overflow-hidden">
        {/* Starfield background */}
        <div className="absolute inset-0">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: star.left,
                top: star.top,
                opacity: star.opacity,
                animationDelay: star.animationDelay,
                animationDuration: star.animationDuration,
              }}
            />
          ))}
        </div>

        {/* SVG Canvas */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 600" style={{ transform: `scale(${zoom})` }}>
          {/* Central Ethereum Sun */}
          <g>
            <circle cx={centerX} cy={centerY} r="40" fill="url(#sunGradient)" className="animate-pulse" />
            <circle
              cx={centerX}
              cy={centerY}
              r="50"
              fill="none"
              stroke="url(#sunGlow)"
              strokeWidth="2"
              opacity="0.3"
              className="animate-ping"
              style={{ animationDuration: "3s" }}
            />
            <text x={centerX} y={centerY + 70} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
              Ethereum
            </text>
          </g>

          {/* Orbital rings */}
          {protocols.map((protocol) => (
            <circle
              key={`orbit-${protocol.id}`}
              cx={centerX}
              cy={centerY}
              r={orbitRadius}
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="5,5"
              opacity="0.1"
            />
          ))}

          {/* Capital flows */}
          {showFlows &&
            flows.map((flow, i) => {
              const fromProtocol = protocols.find((p) => p.id === flow.from)
              const toProtocol = protocols.find((p) => p.id === flow.to)
              if (!fromProtocol || !toProtocol) return null

              const fromPos = getProtocolPosition(fromProtocol.angle)
              const toPos = getProtocolPosition(toProtocol.angle)

              // Calculate control point for curved arrow
              const midX = (fromPos.x + toPos.x) / 2
              const midY = (fromPos.y + toPos.y) / 2
              const dx = toPos.x - fromPos.x
              const dy = toPos.y - fromPos.y
              const controlX = midX - dy * 0.2
              const controlY = midY + dx * 0.2

              return (
                <g key={`flow-${i}`}>
                  <path
                    d={`M ${fromPos.x} ${fromPos.y} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y}`}
                    fill="none"
                    stroke={getFlowColor(flow.type)}
                    strokeWidth={flow.volume}
                    strokeDasharray="8,4"
                    opacity="0.4"
                    className="animate-pulse"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="24" dur="2s" repeatCount="indefinite" />
                  </path>
                </g>
              )
            })}

          {/* Protocol planets */}
          {protocols.map((protocol) => {
            const pos = getProtocolPosition(protocol.angle)
            const size = 15 + protocol.tvl * 3
            const isHovered = hoveredProtocol === protocol.id
            const isSelected = selectedProtocol === protocol.id

            return (
              <g key={protocol.id}>
                {/* Planet glow */}
                {(isHovered || isSelected) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={size + 10}
                    fill={protocol.color}
                    opacity="0.2"
                    className="animate-pulse"
                  />
                )}

                {/* Planet */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size}
                  fill={protocol.color}
                  stroke={getHealthColor(protocol.health)}
                  strokeWidth="3"
                  className="cursor-pointer transition-all hover:brightness-125"
                  onMouseEnter={() => setHoveredProtocol(protocol.id)}
                  onMouseLeave={() => setHoveredProtocol(null)}
                  onClick={() => setSelectedProtocol(protocol.id === selectedProtocol ? null : protocol.id)}
                />

                {/* Protocol label */}
                <text x={pos.x} y={pos.y + size + 20} textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
                  {protocol.name}
                </text>

                {/* Health indicator dot */}
                <circle cx={pos.x + size - 5} cy={pos.y - size + 5} r="4" fill={getHealthColor(protocol.health)} />
              </g>
            )
          })}

          {/* Whale comets */}
          {isMounted && showWhales &&
            whales.map((whale) => {
              const fromProtocol = protocols.find((p) => p.id === whale.from)
              const toProtocol = protocols.find((p) => p.id === whale.to)
              if (!fromProtocol || !toProtocol) return null

              const fromPos = getProtocolPosition(fromProtocol.angle)
              const toPos = getProtocolPosition(toProtocol.angle)

              const x = fromPos.x + (toPos.x - fromPos.x) * whale.progress
              const y = fromPos.y + (toPos.y - fromPos.y) * whale.progress

              return (
                <g key={`whale-${whale.id}`}>
                  {/* Trail */}
                  <circle cx={x - 10} cy={y} r="2" fill="white" opacity="0.2" />
                  <circle cx={x - 20} cy={y} r="1.5" fill="white" opacity="0.1" />
                  {/* Comet */}
                  <circle cx={x} cy={y} r="4" fill="#fbbf24" className="animate-pulse">
                    <title>
                      {whale.address}: {whale.amount}
                    </title>
                  </circle>
                </g>
              )
            })}

          {/* Gradients */}
          <defs>
            <radialGradient id="sunGradient">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
            <radialGradient id="sunGlow">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Hover tooltip */}
        {hoveredProtocol && (
          <div className="absolute top-4 left-4 glass-card p-3 text-sm space-y-1 animate-in fade-in slide-in-from-left-2">
            <div className="font-bold text-white">{protocols.find((p) => p.id === hoveredProtocol)?.name}</div>
            <div className="text-white/70">TVL: ${protocols.find((p) => p.id === hoveredProtocol)?.tvl}B</div>
            <div className="text-white/70">
              Health:{" "}
              <span
                style={{
                  color: getHealthColor(protocols.find((p) => p.id === hoveredProtocol)?.health || 0),
                }}
              >
                {protocols.find((p) => p.id === hoveredProtocol)?.health}/100
              </span>
            </div>
            <div className="text-white/70">
              Transactions: {protocols.find((p) => p.id === hoveredProtocol)?.transactions}
            </div>
            <div className="text-white/70">APY: {protocols.find((p) => p.id === hoveredProtocol)?.apy}</div>
          </div>
        )}

        {/* Controls - bottom left */}
        <div className="absolute bottom-4 left-4 glass-card p-2 flex flex-col gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
          >
            <ZoomIn className="w-4 h-4 mr-2" />
            Zoom In
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          >
            <ZoomOut className="w-4 h-4 mr-2" />
            Zoom Out
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <div className="h-px bg-white/10 my-1" />
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setShowFlows(!showFlows)}
          >
            {showFlows ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            Flows
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setShowWhales(!showWhales)}
          >
            {showWhales ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            Whales
          </Button>
        </div>

        {/* Legend - bottom right */}
        <div className="absolute bottom-4 right-4 glass-card p-3 text-xs space-y-2">
          <div className="font-bold text-white mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-white/70">Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-white/70">Caution</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-white/70">Danger</span>
            </div>
          </div>
          <div className="h-px bg-white/10 my-2" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-pink-500" />
              <span className="text-white/70">Arbitrage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-500" />
              <span className="text-white/70">Yield Seeking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-purple-500" />
              <span className="text-white/70">Rebalancing</span>
            </div>
          </div>
          <div className="h-px bg-white/10 my-2" />
          <div className="text-white/60 text-[10px]">Bubble size = TVL</div>
        </div>
      </div>
    </div>
  )
}
