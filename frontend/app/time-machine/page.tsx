"use client"

import { TimeScrubber } from "@/components/TimeScrubber"
import { CosmosVisualization } from "@/components/CosmosVisualization"
import { LineChart, Clock } from "lucide-react"

export default function TimeMachinePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Time Machine</h1>
        <p className="text-lg text-gray-400">Travel through DeFi history and replay major events</p>
      </div>

      {/* Time Machine Controls */}
      <TimeScrubber />

      {/* Historical Cosmos View */}
      <div className="h-[500px]">
        <CosmosVisualization />
      </div>

      {/* Bottom Section - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT - Historical Metrics Chart (60%) */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6 rounded-xl border border-white/10 h-[400px]">
            <h2 className="text-xl font-semibold text-white mb-4">Historical Metrics</h2>
            <div className="flex items-center justify-center h-[320px] text-gray-400">
              <div className="text-center">
                <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Multi-protocol comparison chart</p>
                <p className="text-sm mt-2">TVL, Volume, and Health trends over time</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Events at Selected Time (40%) */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-xl border border-white/10 h-[400px]">
            <h2 className="text-xl font-semibold text-white mb-4">Events at This Time</h2>
            <div className="space-y-4 overflow-y-auto h-[320px]">
              {[
                { time: "14:23:15", event: "Large whale deposit", protocol: "Aave", amount: "$2.3M" },
                { time: "14:23:42", event: "Protocol health alert", protocol: "Maker", status: "Caution" },
                { time: "14:24:08", event: "Capital flow spike", from: "Curve", to: "Uniswap" },
                { time: "14:24:35", event: "Transaction surge", protocol: "Lido", tps: "45.2" },
                { time: "14:25:12", event: "Whale withdrawal", protocol: "Compound", amount: "$1.8M" },
              ].map((event, i) => (
                <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{event.time}</span>
                  </div>
                  <div className="text-sm font-medium text-white mb-1">{event.event}</div>
                  <div className="text-xs text-gray-400">
                    {event.protocol && `Protocol: ${event.protocol}`}
                    {event.amount && ` • ${event.amount}`}
                    {event.status && ` • Status: ${event.status}`}
                    {event.from && ` • ${event.from} → ${event.to}`}
                    {event.tps && ` • TPS: ${event.tps}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
