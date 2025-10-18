"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import { LiveActivityFeed } from "@/components/LiveActivityFeed"
import { ProtocolStatsGrid } from "@/components/ProtocolStatsGrid"
import { WhaleTracker } from "@/components/WhaleTracker"
import { ProtocolHealthPanel } from "@/components/ProtocolHealthPanel"
import { PersonalDashboard } from "@/components/PersonalDashboard"
import { CrossProtocolActivity } from "@/components/CrossProtocolActivity"
import { TimeScrubber } from "@/components/TimeScrubber"
import { CosmosVisualization } from "@/components/CosmosVisualization"
import { WelcomeScreen } from "@/components/WelcomeScreen"
import { Globe, BarChart3, Haze as Whale, Wallet, Activity } from "lucide-react"

type MobileTab = "overview" | "protocols" | "whales" | "portfolio" | "activity"

export default function Page() {
  const [activeTab, setActiveTab] = useState<MobileTab>("overview")

  return (
    <div className="min-h-screen pb-20">
      <WelcomeScreen />

      <Header />

      {/* Desktop Layout - 3 Column Grid */}
      <main className="container mx-auto px-6 py-6 hidden lg:block">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR - Activity Feeds */}
          <aside className="lg:col-span-3 space-y-6">
            <LiveActivityFeed />
            <WhaleTracker />
          </aside>

          {/* CENTER PANEL - Main Visualization & Stats */}
          <section className="lg:col-span-6 space-y-6">
            <CosmosVisualization />
            <TimeScrubber />
            <ProtocolStatsGrid />
          </section>

          {/* RIGHT SIDEBAR - Personal & Health */}
          <aside className="lg:col-span-3 space-y-6">
            <PersonalDashboard />
            <ProtocolHealthPanel />
            <CrossProtocolActivity />
          </aside>
        </div>
      </main>

      <main className="lg:hidden">
        {/* Mobile Tab Navigation */}
        <div className="sticky top-[72px] z-40 bg-black/40 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-around px-2 py-3">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[44px] min-h-[44px] ${
                activeTab === "overview"
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Globe className="w-5 h-5" />
              <span className="text-[10px] font-medium">Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("protocols")}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[44px] min-h-[44px] ${
                activeTab === "protocols"
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px] font-medium">Protocols</span>
            </button>
            <button
              onClick={() => setActiveTab("whales")}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[44px] min-h-[44px] ${
                activeTab === "whales"
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Whale className="w-5 h-5" />
              <span className="text-[10px] font-medium">Whales</span>
            </button>
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[44px] min-h-[44px] ${
                activeTab === "portfolio"
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-[10px] font-medium">Portfolio</span>
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[44px] min-h-[44px] ${
                activeTab === "activity"
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px] font-medium">Activity</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Content */}
        <div className="px-4 py-4 space-y-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <CosmosVisualization />
              <TimeScrubber />
              <ProtocolHealthPanel />
              <CrossProtocolActivity />
            </div>
          )}

          {activeTab === "protocols" && (
            <div className="space-y-4">
              <ProtocolStatsGrid />
              <ProtocolHealthPanel />
            </div>
          )}

          {activeTab === "whales" && (
            <div className="space-y-4">
              <WhaleTracker />
            </div>
          )}

          {activeTab === "portfolio" && (
            <div className="space-y-4">
              <PersonalDashboard />
              <CrossProtocolActivity />
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <LiveActivityFeed />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
