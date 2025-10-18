"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, Copy, LogOut, RefreshCw, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react"

interface ProtocolPosition {
  protocol: string
  color: string
  amount: number
  apy: number
  percentage: number
}

interface Recommendation {
  type: "urgent" | "yield" | "rebalance"
  title: string
  description: string
  benefit?: string
  breakEven?: string
  gasCost?: string
  action: string
}

export function PersonalDashboard() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress] = useState("0x742d...9f3a")
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Mock portfolio data
  const portfolioData = {
    totalDeposited: 125430,
    weightedAPY: 8.4,
    protocolsUsed: 4,
    diversificationScore: 72,
  }

  const positions: ProtocolPosition[] = [
    { protocol: "Aave", color: "#8b5cf6", amount: 45200, apy: 7.2, percentage: 36 },
    { protocol: "Curve", color: "#3b82f6", amount: 38100, apy: 9.8, percentage: 30 },
    { protocol: "Lido", color: "#f97316", amount: 28300, apy: 8.1, percentage: 23 },
    { protocol: "Uniswap", color: "#ff007a", amount: 13830, apy: 12.5, percentage: 11 },
  ]

  const recommendations: Recommendation[] = [
    {
      type: "urgent",
      title: "High Utilization Alert",
      description: "Your Aave position is at 89% utilization. Consider reducing leverage to avoid liquidation risk.",
      action: "Take Action",
    },
    {
      type: "yield",
      title: "Better Yield Available",
      description: "Move 30% of your Curve position to Convex for higher yields on the same assets.",
      benefit: "+$450/year",
      breakEven: "12 days",
      gasCost: "$45",
      action: "Optimize",
    },
    {
      type: "rebalance",
      title: "Improve Diversification",
      description: "Your portfolio is heavily weighted toward stablecoins. Consider adding ETH exposure via Lido.",
      action: "Rebalance",
    },
  ]

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
  }

  const handleRefresh = () => {
    setLastUpdated(new Date())
  }

  if (!isConnected) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
            <Wallet className="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect wallet to see your positions</h3>
            <p className="text-gray-400 text-sm">
              View your portfolio, track performance, and get personalized recommendations
            </p>
          </div>
          <Button
            onClick={() => setIsConnected(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-purple-500/25"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Portfolio</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5">
              <span className="text-sm text-gray-300 font-mono">{walletAddress}</span>
              <button onClick={handleCopyAddress} className="text-gray-400 hover:text-white transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={() => setIsConnected(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Total Deposited</div>
            <div className="text-2xl font-bold text-green-400">${portfolioData.totalDeposited.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Weighted APY</div>
            <div className="text-2xl font-bold text-green-400">{portfolioData.weightedAPY}%</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Protocols Used</div>
            <div className="text-2xl font-bold text-white">{portfolioData.protocolsUsed}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Diversification Score</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all duration-500"
                  style={{ width: `${portfolioData.diversificationScore}%` }}
                />
              </div>
              <span className="text-lg font-bold text-white">{portfolioData.diversificationScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Exposure */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Protocol Exposure
        </h3>
        <div className="space-y-4">
          {positions.map((position) => (
            <div key={position.protocol} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: position.color }} />
                  <span className="text-white font-medium">{position.protocol}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <span>${position.amount.toLocaleString()}</span>
                  <span className="text-green-400">{position.apy}% APY</span>
                </div>
              </div>
              <div className="relative h-8 bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:bg-white/10 transition-colors">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
                  style={{
                    width: `${position.percentage}%`,
                    backgroundColor: position.color,
                    opacity: 0.6,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                  {position.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Personalized Recommendations
        </h3>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                rec.type === "urgent"
                  ? "bg-red-500/10 border-red-500/30"
                  : rec.type === "yield"
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-yellow-500/10 border-yellow-500/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 ${
                    rec.type === "urgent" ? "text-red-400" : rec.type === "yield" ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {rec.type === "urgent" ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : rec.type === "yield" ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <BarChart3 className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{rec.title}</h4>
                  <p className="text-sm text-gray-300 mb-3">{rec.description}</p>
                  {rec.type === "yield" && (
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <span className="text-green-400 font-semibold">{rec.benefit}</span>
                      <span>Break-even: {rec.breakEven}</span>
                      <span>Gas: {rec.gasCost}</span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    disabled
                    className={`${
                      rec.type === "urgent"
                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                        : rec.type === "yield"
                          ? "bg-green-500/20 hover:bg-green-500/30 text-green-300"
                          : "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300"
                    } cursor-not-allowed`}
                    title="Coming Soon"
                  >
                    {rec.action} (Coming Soon)
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <Button onClick={handleRefresh} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  )
}
