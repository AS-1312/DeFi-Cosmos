"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Globe,
  BarChart3,
  TrendingUp,
  Wallet,
  Activity,
  Clock,
  Fish,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

const navItems = [
  {
    href: "/",
    icon: Globe,
    label: "Overview",
    description: "Cosmos view",
  },
  {
    href: "/protocols",
    icon: BarChart3,
    label: "Protocols",
    badge: "5",
  },
  {
    href: "/flows",
    icon: TrendingUp,
    label: "Capital Flows",
    badge: "Live",
    badgeType: "pulse" as const,
  },
  {
    href: "/whales",
    icon: Fish,
    label: "Whale Tracker",
    badge: "12",
  },
  {
    href: "/portfolio",
    icon: Wallet,
    label: "My Portfolio",
    badge: "Connect",
    badgeType: "connect" as const,
  },
  {
    href: "/feed",
    icon: Activity,
    label: "Live Activity",
    badgeType: "pulse" as const,
  },
  {
    href: "/time-machine",
    icon: Clock,
    label: "Time Machine",
    description: "Historical playback",
  },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-[64px] bottom-[60px] w-[240px] bg-black/40 backdrop-blur-xl border-r border-white/10 z-30 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                isActive ? "bg-purple-500/20 text-white" : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r" />
              )}

              <Icon className="w-5 h-5 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{item.label}</div>
                {item.description && <div className="text-xs text-white/40">{item.description}</div>}
              </div>

              {/* Badges */}
              {item.badge && (
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.badgeType === "pulse"
                      ? "bg-green-500/20 text-green-400"
                      : item.badgeType === "connect"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-white/10 text-white/70"
                  }`}
                >
                  {item.badgeType === "pulse" && (
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  )}
                  {item.badge}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Health Status Summary */}
      <div className="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="text-xs font-medium text-white/60 mb-2">Health Status</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span className="text-white/80">3 Healthy</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-white/80">1 Caution</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-white/80">1 Alert</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/40">v1.0 • Built with Envio</div>
      </div>
    </aside>
  )
}
