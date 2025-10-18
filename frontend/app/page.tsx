import { Header } from "@/components/Header"
import { LiveActivityFeed } from "@/components/LiveActivityFeed"
import { ProtocolStatsGrid } from "@/components/ProtocolStatsGrid"
import { WhaleTracker } from "@/components/WhaleTracker"

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Protocol Observatory
            </span>
          </h2>
          <ProtocolStatsGrid />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <LiveActivityFeed />
          </div>
          <div className="lg:col-span-5">
            <WhaleTracker />
          </div>
        </div>
      </main>
    </div>
  )
}
