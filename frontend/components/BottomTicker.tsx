"use client"

import { useProtocolStats } from "@/hooks/useProtocolStats"
import { useProtocolHealth } from "@/hooks/useProtocolHealth"

export function BottomTicker() {
  const { protocols } = useProtocolStats()
  const { health } = useProtocolHealth()

  // Calculate aggregate metrics
  const totalTvlBigInt = protocols.reduce((sum, p) => {
    return sum + BigInt(p.tvl || '0')
  }, BigInt(0))
  const totalTvlEth = Number(totalTvlBigInt) / 1e18

  const totalVolume24h = protocols.reduce((sum, p) => {
    if (p.volume24h) {
      return sum + BigInt(p.volume24h)
    }
    return sum
  }, BigInt(0))
  const totalVolume24hEth = Number(totalVolume24h) / 1e18

  const totalTransactions = protocols.reduce((sum, p) => {
    return sum + Number(p.transactionCount24h || 0)
  }, 0)

  const totalTps = protocols.reduce((sum, p) => {
    return sum + (p.tps || 0)
  }, 0)

  // Get Aave health score
  const aaveHealth = health.find(h => h.protocol?.toLowerCase().includes('aave'))
  const aaveHealthScore = aaveHealth?.healthScore || 0

  // Get individual protocol data
  const uniswap = protocols.find(p => p.id === 'uniswap-v4')
  const aave = protocols.find(p => p.id === 'aave-v3')
  const lido = protocols.find(p => p.id === 'lido')
  const curve = protocols.find(p => p.id === 'curve')

  const tickerItems = [
    { 
      icon: "�", 
      label: "Total TVL", 
      value: `${totalTvlEth.toFixed(1)}K ETH` 
    },
    { 
      icon: "📊", 
      label: "24h Volume", 
      value: totalVolume24hEth > 0 ? `${(totalVolume24hEth / 1000).toFixed(1)}K ETH` : 'N/A'
    },
    { 
      icon: "⚡", 
      label: "Transactions", 
      value: `${(totalTransactions / 1000).toFixed(1)}K/day` 
    },
    { 
      icon: "🔥", 
      label: "TPS", 
      value: totalTps.toFixed(1) 
    },
    { 
      icon: "🦄", 
      label: "Uniswap", 
      value: uniswap ? `${(Number(uniswap.tvl) / 1e18 / 1000).toFixed(1)}K ETH` : 'Loading...'
    },
    { 
      icon: "🏦", 
      label: "Aave Health", 
      value: aaveHealthScore > 0 ? `${aaveHealthScore}/100` : 'N/A',
      alert: aaveHealthScore > 0 && aaveHealthScore < 50
    },
    { 
      icon: "🌊", 
      label: "Lido", 
      value: lido ? `${(Number(lido.tvl) / 1e18 / 1000).toFixed(1)}K ETH staked` : 'Loading...'
    },
    { 
      icon: "�", 
      label: "Curve", 
      value: curve ? `${(Number(curve.tvl) / 1e18 / 1000).toFixed(1)}K ETH` : 'Loading...'
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-[50px] md:h-[60px] glass-card border-t border-white/10 overflow-hidden">
      {/* Gradient border top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" />

      <div className="ticker-scroll flex items-center h-full gap-4 md:gap-8 whitespace-nowrap">
        {/* Duplicate items for seamless loop */}
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 md:gap-3 px-3 md:px-6 text-xs md:text-sm group hover:scale-105 transition-transform"
          >
            {/* Icon */}
            <span className="text-base md:text-lg">{item.icon}</span>

            {/* Label */}
            <span className="text-gray-400">{item.label}:</span>

            {/* Value */}
            <span
              className={`font-bold ${
                item.alert ? "text-yellow-400 animate-pulse" : "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              }`}
            >
              {item.value}
            </span>

            {/* Separator */}
            <span className="text-gray-600 text-lg md:text-xl">•</span>
          </div>
        ))}
      </div>
    </div>
  )
}
