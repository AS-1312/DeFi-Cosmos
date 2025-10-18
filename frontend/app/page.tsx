import { Header } from "@/components/Header"
import { LiveActivityFeed } from "@/components/LiveActivityFeed"

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid-12">
          <div className="col-span-12 lg:col-span-8">
            <LiveActivityFeed />
          </div>
        </div>
      </main>
    </div>
  )
}
