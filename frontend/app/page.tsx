import { Header } from "@/components/header"

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
          <div className="glass-card rounded-2xl p-12 text-center">
            <h1 className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-5xl font-bold text-transparent">
              Welcome to DeFi Cosmos
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Your real-time protocol observatory is ready to explore the DeFi universe
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
