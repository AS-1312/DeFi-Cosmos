"use client"

import type React from "react";

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Mode = "TVL" | "VOLUME" | "FLOW"
type Range = "24H" | "7D" | "30D"

const protocols = [
  { name: "Uniswap", symbol: "UNI", color: "#ff007a", position: { top: "20%", left: "65%" } as React.CSSProperties },
  { name: "Aave", symbol: "AAVE", color: "#8b5cf6", position: { top: "50%", left: "15%" } as React.CSSProperties },
  { name: "Curve", symbol: "CRV", color: "#3b82f6", position: { bottom: "20%", left: "60%" } as React.CSSProperties },
  { name: "Lido", symbol: "LDO", color: "#f97316", position: { top: "40%", right: "10%" } as React.CSSProperties },
];

export function CosmosVisualization() {
  const [mode, setMode] = useState<Mode>("TVL")
  const [range, setRange] = useState<Range>("30D")

  const particles = useMemo(
    () =>
      Array.from({ length: 50 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${5 + Math.random() * 10}s`,
      })),
    [],
  )

  return (
    <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-white">DeFi Cosmos</CardTitle>
            <p className="text-sm text-gray-400 mt-1">3D view (coming soon)</p>
          </div>

          <div className="flex gap-2" role="tablist" aria-label="Cosmos view mode">
            {(["TVL", "VOLUME", "FLOW"] as Mode[]).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "default" : "ghost"}
                size="sm"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={
                  mode === m
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    : "text-gray-400 hover:text-white"
                }
              >
                <span className="sr-only">{"View mode:"}</span>
                {m}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative h-[500px] rounded-xl bg-gradient-to-br from-indigo-950/50 via-purple-950/40 to-blue-950/50 border border-purple-500/20 overflow-hidden">
          <div className="absolute inset-0">
            {particles.map((p, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
                style={p}
                aria-hidden="true"
              />
            ))}
          </div>

          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 500 500" aria-hidden="true">
            <circle
              cx="250"
              cy="250"
              r="80"
              fill="none"
              stroke="rgba(59,130,246,0.4)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <circle
              cx="250"
              cy="250"
              r="130"
              fill="none"
              stroke="rgba(139,92,246,0.4)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <circle
              cx="250"
              cy="250"
              r="180"
              fill="none"
              stroke="rgba(236,72,153,0.4)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <circle
              cx="250"
              cy="250"
              r="230"
              fill="none"
              stroke="rgba(249,115,22,0.4)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            <circle cx="250" cy="250" r="30" fill="url(#sunGradient)" filter="url(#glow)" />
            <defs>
              <radialGradient id="sunGradient">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor="#1e40af" stopOpacity="0.8" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          {protocols.map((protocol) => (
            <div
              key={protocol.name}
              className="absolute transition-all duration-500 hover:scale-110"
              style={protocol.position}
            >
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl cursor-pointer group"
                style={{
                  background: `linear-gradient(135deg, ${protocol.color}, ${protocol.color}dd)`,
                  boxShadow: `0 0 30px ${protocol.color}80`,
                }}
                role="button"
                aria-label={`${protocol.name} planet`}
                tabIndex={0}
              >
                <span className="text-xs font-bold text-white">{protocol.symbol}</span>

                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20 whitespace-nowrap">
                    <p className="text-xs text-white font-semibold">{protocol.name}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <p className="text-gray-400 text-sm max-w-md">
              {
                "3D Cosmos visualization placeholder. Future: Three.js scene showing protocols as planets, orbits as liquidity flows, with interactive zoom and hover details."
              }
            </p>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-gray-500">
            <span>
              Mode: {mode} • Range: {range}
            </span>
            <span>FPS: 60 (mock)</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4 justify-end" role="tablist" aria-label="Time range">
          {(["24H", "7D", "30D"] as Range[]).map((r) => (
            <Button
              key={r}
              variant={range === r ? "default" : "ghost"}
              size="sm"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
              className={range === r ? "bg-white/10 hover:bg-white/20 text-white" : "text-gray-400 hover:text-white"}
            >
              <span className="sr-only">{"Time range:"}</span>
              {r}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default CosmosVisualization;
