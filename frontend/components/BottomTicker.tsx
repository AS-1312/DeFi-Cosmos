"use client"

const tickerItems = [
  { icon: "💰", label: "TVL", value: "24.5K ETH" },
  { icon: "📊", label: "Vol", value: "8.2K ETH" },
  { icon: "👥", label: "Active Wallets", value: "45.2K" },
  { icon: "🐋", label: "Whale Moves", value: "3 new" },
  { icon: "🦄", label: "Uniswap", value: "24.5K ETH + 15.2M USDC" },
  { icon: "⚠️", label: "Aave Health", value: "88/100", alert: false },
  { icon: "🌊", label: "Curve", value: "8.1M DAI + 5.2M USDC" },
  { icon: "🔷", label: "Lido", value: "142K ETH staked" },
  { icon: "⚡", label: "Transactions", value: "1.2M/day" },
  { icon: "🔥", label: "TPS", value: "45.2" },
  { icon: "💧", label: "Liquidations", value: "12 (24h)" },
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

            {/* Separator */}
            <span className="text-gray-600 text-lg md:text-xl">•</span>
          </div>
        ))}
      </div>
    </div>
  )
}
