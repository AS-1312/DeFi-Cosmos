"use client"

import { useState } from "react"
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Flame,
  Droplet,
  Activity,
  Loader2,
} from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { useProtocolHealth } from "@/hooks/useProtocolHealth"

type WarningType = "utilization" | "tvl" | "whale" | "gas" | "liquidation"

interface Warning {
  type: WarningType
  message: string
  severity: "high" | "medium" | "low"
  explanation: string
}

interface Protocol {
  name: string
  color: string
  healthScore: number
  warnings: Warning[]
  healthTrend: number[]
  recommendations?: string[]
  utilizationRate?: number
  tvlChange24h?: number
  whaleExits?: number
  gasMultiplier?: number
}

const warningIcons = {
  utilization: Activity,
  tvl: TrendingDown,
  whale: Droplet,
  gas: Flame,
  liquidation: AlertTriangle,
}

export function ProtocolHealthPanel() {
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null)
  const { health, loading, error } = useProtocolHealth()

  // Transform health data to Protocol format (only Aave data is available)
  const protocols: Protocol[] = health
    .filter(h => h.protocol?.toLowerCase().includes('aave'))
    .map(h => {
      const warnings: Warning[] = []
      const recommendations: string[] = []

      // Parse warnings and generate user-friendly messages
      if (h.utilizationRate && h.utilizationRate > 0.85) {
        warnings.push({
          type: "utilization",
          message: `${(h.utilizationRate * 100).toFixed(0)}% utilized`,
          severity: h.utilizationRate > 0.9 ? "high" : "medium",
          explanation: "High utilization rate may lead to increased borrowing costs and reduced liquidity.",
        })
        if (h.utilizationRate > 0.9) {
          recommendations.push("Monitor high-risk positions closely")
          recommendations.push("Consider reducing exposure to volatile assets")
        }
      }

      if (h.tvlChange24h && h.tvlChange24h < -10) {
        warnings.push({
          type: "tvl",
          message: `↓${Math.abs(h.tvlChange24h).toFixed(1)}% in 24h`,
          severity: "high",
          explanation: "Significant TVL decrease indicates potential loss of user confidence or market conditions.",
        })
        recommendations.push("Monitor protocol announcements closely")
      }

      if (h.whaleExits1h && h.whaleExits1h > 0) {
        warnings.push({
          type: "whale",
          message: `${h.whaleExits1h} whale${h.whaleExits1h > 1 ? 's' : ''} exited`,
          severity: h.whaleExits1h > 2 ? "high" : "medium",
          explanation: "Large holders withdrawing funds may signal concerns about protocol health or market conditions.",
        })
        if (h.whaleExits1h > 2) {
          recommendations.push("Exercise caution with new positions")
        }
      }

      if (h.gasMultiplier && h.gasMultiplier > 2) {
        warnings.push({
          type: "gas",
          message: `${h.gasMultiplier.toFixed(1)}x normal gas`,
          severity: h.gasMultiplier > 3 ? "medium" : "low",
          explanation: "Network congestion is causing elevated gas prices for transactions.",
        })
      }

      // Add custom warnings from backend
      if (h.warnings && h.warnings.length > 0) {
        h.warnings.forEach(w => {
          warnings.push({
            type: "liquidation",
            message: w,
            severity: "medium",
            explanation: "Protocol-specific warning detected.",
          })
        })
      }

      return {
        name: "Aave V3",
        color: "#8b5cf6",
        healthScore: h.healthScore,
        warnings,
        healthTrend: [h.healthScore], // Single point for now
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        utilizationRate: h.utilizationRate,
        tvlChange24h: h.tvlChange24h,
        whaleExits: h.whaleExits1h,
        gasMultiplier: h.gasMultiplier,
      }
    })

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error || protocols.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Aave Health Data Unavailable</h3>
          <p className="text-sm text-gray-400">
            {error ? error.message : 'No health monitoring data available for Aave protocol'}
          </p>
        </div>
      </div>
    )
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  const getHealthBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getHealthGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500"
    if (score >= 50) return "from-yellow-500 to-orange-500"
    return "from-red-500 to-rose-500"
  }

  const getStatusBadge = (score: number) => {
    if (score >= 80) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">HEALTHY</span>
        </div>
      )
    }
    if (score >= 50) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-400">CAUTION</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 animate-pulse">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <span className="text-sm font-medium text-red-400">DANGER</span>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Aave V3 Health Monitor</h3>
          <p className="text-sm text-gray-400">Real-time health score and risk indicators • Updates every 5 seconds</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-sm text-purple-400 font-medium">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {protocols.map((protocol) => {
          const isExpanded = expandedProtocol === protocol.name
          const hasCriticalWarnings = protocol.warnings.some((w) => w.severity === "high")

          return (
            <div
              key={protocol.name}
              className={`rounded-xl bg-white/5 border transition-all duration-300 ${
                hasCriticalWarnings ? "border-red-500/30 animate-pulse" : "border-white/10"
              }`}
            >
              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* LEFT: Protocol Icon and Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg relative"
                      style={{
                        backgroundColor: protocol.color,
                        boxShadow: `0 0 20px ${protocol.color}40`,
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-full border-2 transition-colors duration-500"
                        style={{
                          borderColor:
                            protocol.healthScore >= 80 ? "#10b981" : protocol.healthScore >= 50 ? "#eab308" : "#ef4444",
                        }}
                      />
                      {protocol.name[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold mb-1">{protocol.name}</h4>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-2xl font-bold ${getHealthColor(protocol.healthScore)} transition-colors duration-500`}
                        >
                          {protocol.healthScore}
                          <span className="text-sm text-gray-400">/100</span>
                        </span>
                        <div className="flex-1 max-w-[200px]">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getHealthGradient(protocol.healthScore)} transition-all duration-500`}
                              style={{ width: `${protocol.healthScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CENTER: Warning Indicators */}
                  <div className="flex items-center gap-2 flex-wrap max-w-md">
                    {protocol.warnings.map((warning, idx) => {
                      const Icon = warningIcons[warning.type]
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            warning.severity === "high"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : warning.severity === "medium"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{warning.message}</span>
                        </div>
                      )
                    })}
                    {protocol.warnings.length === 0 && <span className="text-sm text-gray-500">No warnings</span>}
                  </div>

                  {/* RIGHT: Status Badge */}
                  <div className="flex items-center gap-3">
                    {getStatusBadge(protocol.healthScore)}
                    <button
                      onClick={() => setExpandedProtocol(isExpanded ? null : protocol.name)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* EXPANDABLE DETAILS */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Full Warnings List */}
                    {protocol.warnings.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2">Warning Details</h5>
                        <div className="space-y-2">
                          {protocol.warnings.map((warning, idx) => {
                            const Icon = warningIcons[warning.type]
                            return (
                              <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-start gap-2">
                                  <Icon
                                    className={`w-4 h-4 mt-0.5 ${
                                      warning.severity === "high"
                                        ? "text-red-400"
                                        : warning.severity === "medium"
                                          ? "text-yellow-400"
                                          : "text-blue-400"
                                    }`}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-white">{warning.message}</span>
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded ${
                                          warning.severity === "high"
                                            ? "bg-red-500/20 text-red-400"
                                            : warning.severity === "medium"
                                              ? "bg-yellow-500/20 text-yellow-400"
                                              : "bg-blue-500/20 text-blue-400"
                                        }`}
                                      >
                                        {warning.severity}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-400">{warning.explanation}</p>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Recommended Actions */}
                    {protocol.recommendations && protocol.recommendations.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2">Recommended Actions</h5>
                        <ul className="space-y-1.5">
                          {protocol.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Historical Health Trend */}
                    <div>
                      <h5 className="text-sm font-semibold text-white mb-2">24h Health Trend</h5>
                      <div className="h-16 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={protocol.healthTrend.map((value, idx) => ({ value, idx }))}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={
                                protocol.healthScore >= 80
                                  ? "#10b981"
                                  : protocol.healthScore >= 50
                                    ? "#eab308"
                                    : "#ef4444"
                              }
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
