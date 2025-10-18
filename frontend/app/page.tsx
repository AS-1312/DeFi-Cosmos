import { Header } from "@/components/Header"
import { LiveActivityFeed } from "@/components/LiveActivityFeed"
import { ProtocolStatsGrid } from "@/components/ProtocolStatsGrid"
import { WhaleTracker } from "@/components/WhaleTracker"
import { ProtocolHealthPanel } from "@/components/ProtocolHealthPanel"
import { PersonalDashboard } from "@/components/PersonalDashboard"
import { CrossProtocolActivity } from "@/components/CrossProtocolActivity"
import { TimeScrubber } from "@/components/TimeScrubber"
import { CosmosVisualization } from "@/components/CosmosVisualization"

export default function Page() {
  return (
    <div className="min-h-screen pb-20">
      <Header />

      {/* Main Content - 3 Column Layout */}
      <main className="container mx-auto px-6 py-6">
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
    </div>
  )
}
