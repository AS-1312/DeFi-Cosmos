"use client"

import { TrendingUp, TrendingDown, Flame } from "lucide-react"

const tickerItems = [
  { icon: "💎", label: "ETH", value: "$3,245.67", trend: "up", change: "+2.4%" },
  { icon: "⛽", label: "Gas", value: "35 Gwei", iconComponent: Flame },
  { icon: "💰", label: "TVL", value: "$68.5B" },
  { icon: "📊", label: "Vol", value: "$12.3B" },
  { icon: "👥", label: "Active", value: "45.2K" },
  { icon: "🐋", label: "Whales", value: "3 new" },
  { icon: "🦄", label: "Uniswap", value: "$24.5B TVL" },
  { icon: "⚠️", label: "Aave Health", value: "65/100", alert: true },
  { icon: "🌊", label: "Curve", value: "$8.2B TVL" },
  { icon: "🔷", label: "Lido", value: "$22.1B TVL" },
  { icon: "🏛️", label: "Maker", value: "$5.8B TVL" },
  { icon: "⚡", label: "Transactions", value: "1.2M/day" },
]

export function BottomTicker() {
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

            {/* Trend indicator */}
            {item.trend === "up" && (
              <span className="flex items-center gap-1 text-green-400 text-[10px] md:text-xs">
                <TrendingUp className="w-3 h-3" />
                {item.change}
              </span>
            )}
            {item.trend === "down" && (
              <span className="flex items-center gap-1 text-red-400 text-[10px] md:text-xs">
                <TrendingDown className="w-3 h-3" />
                {item.change}
              </span>
            )}

            {/* Icon component */}
            {item.iconComponent && <item.iconComponent className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />}

            {/* Separator */}
            <span className="text-gray-600 text-lg md:text-xl">•</span>
          </div>
        ))}
      </div>
    </div>
  )
}
