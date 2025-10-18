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
} from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"

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
}

const protocols: Protocol[] = [
  {
    name: "Uniswap",
    color: "#ff007a",
    healthScore: 92,
    warnings: [],
    healthTrend: [85, 87, 89, 90, 91, 92],
    recommendations: [],
  },
  {
    name: "Aave",
    color: "#8b5cf6",
    healthScore: 68,
    warnings: [
      {
        type: "utilization",
        message: "87% utilized",
        severity: "medium",
        explanation: "High utilization rate may lead to increased borrowing costs and reduced liquidity.",
      },
      {
        type: "liquidation",
        message: "30% risk",
        severity: "high",
        explanation: "Several positions are approaching liquidation thresholds due to market volatility.",
      },
    ],
    healthTrend: [75, 73, 70, 69, 68, 68],
    recommendations: [
      "Monitor high-risk positions closely",
      "Consider reducing exposure to volatile assets",
      "Increase collateral ratios for safety",
    ],
  },
  {
    name: "Curve",
    color: "#3b82f6",
    healthScore: 85,
    warnings: [
      {
        type: "gas",
        message: "2.5x normal gas",
        severity: "low",
        explanation: "Network congestion is causing elevated gas prices for transactions.",
      },
    ],
    healthTrend: [82, 83, 84, 85, 85, 85],
    recommendations: [],
  },
  {
    name: "Lido",
    color: "#f97316",
    healthScore: 45,
    warnings: [
      {
        type: "tvl",
        message: "↓12% in 24h",
        severity: "high",
        explanation: "Significant TVL decrease indicates potential loss of user confidence or market conditions.",
      },
      {
        type: "whale",
        message: "3 whales exited",
        severity: "high",
        explanation: "Large holders withdrawing funds may signal concerns about protocol health or market conditions.",
      },
      {
        type: "utilization",
        message: "92% utilized",
        severity: "high",
        explanation: "Extremely high utilization may lead to liquidity constraints and increased risk.",
      },
    ],
    healthTrend: [65, 60, 55, 50, 48, 45],
    recommendations: [
      "Exercise extreme caution with new positions",
      "Consider exiting high-risk positions",
      "Monitor protocol announcements closely",
      "Diversify across other protocols",
    ],
  },
  {
    name: "Maker",
    color: "#1aab9b",
    healthScore: 78,
    warnings: [
      {
        type: "tvl",
        message: "↓5% in 24h",
        severity: "low",
        explanation: "Minor TVL decrease, likely due to normal market fluctuations.",
      },
    ],
    healthTrend: [80, 79, 79, 78, 78, 78],
    recommendations: [],
  },
]

const warningIcons = {
  utilization: Activity,
  tvl: TrendingDown,
  whale: Droplet,
  gas: Flame,
  liquidation: AlertTriangle,
}

export function ProtocolHealthPanel() {
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null)
  const [sortedProtocols, setSortedProtocols] = useState(protocols)

  const sortByHealth = () => {
    setSortedProtocols([...sortedProtocols].sort((a, b) => b.healthScore - a.healthScore))
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
          <h3 className="text-xl font-bold text-white mb-1">Protocol Health Monitor</h3>
          <p className="text-sm text-gray-400">Real-time health scores and risk indicators</p>
        </div>
        <button
          onClick={sortByHealth}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-colors"
        >
          Sort by Health
        </button>
      </div>

      <div className="space-y-4">
        {sortedProtocols.map((protocol) => {
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
