"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import type * as React from "react";

type Protocol = {
  id: "aave" | "uniswap" | "lido" | "maker"
  name: string
  symbol: string
  color: string
  tvl: string
  volume24h: string
  apy: string
  change24h: number
  sparkline: number[]
}

const protocols: Protocol[] = [
  {
    id: "aave",
    name: "Aave",
    symbol: "AAVE",
    color: "#8b5cf6",
    tvl: "$8.4B",
    volume24h: "$320.0M",
    apy: "4.2%",
    change24h: 1.23,
    sparkline: [100, 105, 102, 108, 110, 107, 112],
  },
  {
    id: "uniswap",
    name: "Uniswap",
    symbol: "UNI",
    color: "#ff007a",
    tvl: "$5.2B",
    volume24h: "$910.0M",
    apy: "2.8%",
    change24h: -0.84,
    sparkline: [120, 118, 122, 119, 115, 117, 116],
  },
  {
    id: "lido",
    name: "Lido",
    symbol: "LDO",
    color: "#f97316",
    tvl: "$28.0B",
    volume24h: "$140.0M",
    apy: "3.7%",
    change24h: 0.41,
    sparkline: [95, 97, 99, 102, 100, 104, 106],
  },
  {
    id: "maker",
    name: "Maker",
    symbol: "MKR",
    color: "#1aab9b",
    tvl: "$7.0B",
    volume24h: "$120.0M",
    apy: "5.8%",
    change24h: 0.12,
    sparkline: [110, 108, 112, 115, 113, 116, 118],
  },
];

function parsePercent(str: string) {
  const n = Number.parseFloat(str.replace("%", ""))
  return Number.isFinite(n) ? n : 0
}

export function ProtocolStatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {protocols.map((p) => (
        <Card
          key={p.id}
          className="group backdrop-blur-xl bg-card/50 border border-border transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
          style={{
            borderColor: `${p.color}33`,
            boxShadow: `0 0 0 0 ${p.color}00`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${p.color}88`
            e.currentTarget.style.boxShadow = `0 0 30px ${p.color}40`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${p.color}33`
            e.currentTarget.style.boxShadow = `0 0 0 0 ${p.color}00`
          }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                  style={{
                    backgroundColor: `${p.color}22`,
                    color: p.color,
                    boxShadow: `0 0 20px ${p.color}40`,
                  }}
                  aria-label={`${p.name} logo`}
                >
                  {p.symbol.charAt(0)}
                </div>
                <CardTitle className="text-foreground text-balance">{p.name}</CardTitle>
              </div>

              <Badge
                className="border"
                style={{
                  backgroundColor: p.change24h >= 0 ? "#22c55e33" : "#ef444433",
                  color: p.change24h >= 0 ? "#86efac" : "#fca5a5",
                  borderColor: p.change24h >= 0 ? "#22c55e55" : "#ef444455",
                }}
              >
                {p.change24h >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" aria-hidden />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" aria-hidden />
                )}
                {p.change24h >= 0 ? "+" : ""}
                {p.change24h}%
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Value Locked</p>
                <p className="text-3xl font-bold text-foreground">{p.tvl}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Vol 24h</p>
                  <p className="text-sm font-semibold text-foreground">{p.volume24h}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">APY</p>
                  <p className="text-sm font-semibold text-foreground">{p.apy}</p>
                  <Progress
                    value={parsePercent(p.apy)}
                    className="h-1 mt-1"
                    style={{ ["--progress-background" as any]: p.color } as React.CSSProperties}
                    aria-label={`${p.name} APY progress`}
                  />
                </div>
              </div>

              <div className="h-16 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={p.sparkline.map((value, index) => ({ value, index }))}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  >
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={p.color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive
                      animationDuration={300}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ProtocolStatsGrid;
