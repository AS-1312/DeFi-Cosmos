"use client"

import { useState } from "react"
import { Orbit } from "lucide-react"

export function CosmosVisualization() {
  const [isRotating] = useState(true)

  return (
    <div className="glass-card p-6 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Orbit className="w-5 h-5 text-purple-400" />
          Protocol Cosmos
        </h3>
        <div className="text-xs text-white/60">3D Visualization</div>
      </div>

      {/* Placeholder for 3D visualization */}
      <div className="flex-1 relative rounded-lg bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div
              className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-2 border-purple-400/50 flex items-center justify-center ${isRotating ? "animate-spin" : ""}`}
              style={{ animationDuration: "20s" }}
            >
              <Orbit className="w-16 h-16 text-purple-400" />
            </div>
            <div>
              <p className="text-white/80 font-semibold">3D Protocol Network</p>
              <p className="text-white/40 text-sm">Interactive visualization coming soon</p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
        <div
          className="absolute top-20 right-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-20 w-2 h-2 bg-pink-400 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-10 right-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>
    </div>
  )
}
