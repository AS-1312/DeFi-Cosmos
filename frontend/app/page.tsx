import LiveActivityFeed from "@/components/LiveActivityFeed";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed inset-0 z-0" suppressHydrationWarning>
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.8,
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="relative z-10">
        <header className="container mx-auto px-6 py-6">
          <h1 className="text-pretty text-lg font-semibold text-foreground/90">{"DeFi Cosmos"}</h1>
        </header>

        <main className="container mx-auto px-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <aside className="md:col-span-3">
              <div className="rounded-lg bg-[color:var(--color-cosmic-card)] p-4 text-foreground/90">
                {"Left Sidebar"}
              </div>
            </aside>

            <section className="md:col-span-6">
              <div className="rounded-lg bg-[color:var(--color-cosmic-card)] p-4 text-foreground">
                {"Center Content"}
              </div>
            </section>

            <aside className="md:col-span-3">
              <LiveActivityFeed />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
