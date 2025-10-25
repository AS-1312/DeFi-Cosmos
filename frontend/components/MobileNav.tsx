"use client"

import { useState } from "react"
import { Menu, Settings, Globe, BarChart3, Activity, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", icon: Globe, label: "Overview" },
  { href: "/protocols", icon: BarChart3, label: "Protocol Stats" },
  { href: "/feed", icon: Activity, label: "Live Activity" },
  { href: "/users", icon: Users, label: "User Analytics" },
]

const protocols = [
  { name: "Uniswap", health: 92, color: "#ff007a" },
  { name: "Aave", health: 88, color: "#8b5cf6" },
  { name: "Curve", health: 95, color: "#3b82f6" },
  { name: "Lido", health: 78, color: "#f97316" },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const getHealthColor = (health: number) => {
    if (health >= 80) return "#10b981"
    if (health >= 50) return "#eab308"
    return "#ef4444"
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white/80 hover:text-white hover:bg-white/10">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] bg-gradient-to-br from-purple-950/95 via-indigo-950/95 to-black/95 backdrop-blur-xl border-l border-white/10"
      >
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">DC</span>
            </div>
            DeFi Cosmos
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Navigation */}
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-purple-500/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Protocol List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Protocols</h3>
            {protocols.map((protocol) => (
              <div
                key={protocol.name}
                className="glass-card p-3 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: protocol.color }} />
                  <span className="text-white font-medium">{protocol.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getHealthColor(protocol.health) }} />
                  <span className="text-sm text-white/70">{protocol.health}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Settings */}
          <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
