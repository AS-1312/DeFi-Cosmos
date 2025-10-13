"use client"

type Crypto = {
  symbol: string
  price: string
  change: number
  isPositive: boolean
}

const cryptoPrices: Crypto[] = [
  { symbol: "BTC", price: "$86,104.10", change: -0.42, isPositive: false },
  { symbol: "ETH", price: "$3,210.45", change: 1.23, isPositive: true },
  { symbol: "SOL", price: "$192.20", change: 2.14, isPositive: true },
  { symbol: "ARB", price: "$1.98", change: -1.04, isPositive: false },
  { symbol: "OP", price: "$3.12", change: 0.78, isPositive: true },
  { symbol: "AVAX", price: "$46.71", change: -0.19, isPositive: false },
  { symbol: "LINK", price: "$17.40", change: 1.02, isPositive: true },
  { symbol: "UNI", price: "$12.85", change: -2.34, isPositive: false },
  { symbol: "AAVE", price: "$287.50", change: 3.12, isPositive: true },
  { symbol: "MKR", price: "$1,542.30", change: 0.87, isPositive: true },
];

export default function BottomTicker() {
  const duplicated = [...cryptoPrices, ...cryptoPrices]

  return (
    <div
      aria-label="Live crypto price ticker"
      className="fixed bottom-0 left-0 right-0 h-16 bg-background/40 backdrop-blur-xl border-t border-border z-40 overflow-hidden"
    >
      <div className="flex items-center h-full">
        <div className="flex gap-8 animate-scroll">
          {duplicated.map((crypto, index) => (
            <div key={`${crypto.symbol}-${index}`} className="flex items-center gap-3 whitespace-nowrap px-4">
              <span className="font-semibold text-foreground text-sm">{crypto.symbol}</span>
              <span className={`text-sm font-mono ${crypto.isPositive ? "text-positive" : "text-negative"}`}>
                {crypto.price}
              </span>
              <span className={`text-xs ${crypto.isPositive ? "text-positive" : "text-negative"}`}>
                {crypto.isPositive ? "+" : ""}
                {crypto.change}%
              </span>
              <div className="w-px h-4 bg-border" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Scrolling prices pause on hover</span>
    </div>
  )
};
