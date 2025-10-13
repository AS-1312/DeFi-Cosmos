"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRightLeft, TrendingUp, ArrowDownRight, ArrowUpRight, AlertTriangle } from "lucide-react";

type ActivityType = "swap" | "stake" | "borrow" | "lend" | "liquidation"

type Activity = {
  id: string
  type: ActivityType
  wallet: string
  action: string
  protocol: "Uniswap" | "Aave" | "Lido" | "Maker" | string
  amount: string
  time: string
}

const activities: Activity[] = [
  {
    id: "1",
    type: "swap",
    wallet: "0x8c1...f2d",
    action: "swapped ETH→USDC",
    protocol: "Uniswap",
    amount: "$128.4K",
    time: "2m ago",
  },
  {
    id: "2",
    type: "stake",
    wallet: "0x19b...a44",
    action: "staked ETH",
    protocol: "Lido",
    amount: "$45.2K",
    time: "5m ago",
  },
  {
    id: "3",
    type: "borrow",
    wallet: "0xa33...911",
    action: "borrowed USDT",
    protocol: "Aave",
    amount: "$98.0K",
    time: "8m ago",
  },
  {
    id: "4",
    type: "lend",
    wallet: "0x991...0cc",
    action: "lent DAI",
    protocol: "Aave",
    amount: "$15.0K",
    time: "9m ago",
  },
  {
    id: "5",
    type: "liquidation",
    wallet: "0x55a...77e",
    action: "was liquidated in ETH Vault",
    protocol: "Maker",
    amount: "$305.0K",
    time: "12m ago",
  },
]

const typeConfig: Record<
  ActivityType,
  {
    icon: any
    bgColor: string
    borderColor: string
    hoverBorder: string
    iconColor: string
    shadow: string
    badgeBg: string
    badgeText: string
  }
> = {
  swap: {
    icon: ArrowRightLeft,
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500/20",
    hoverBorder: "hover:border-pink-500/50",
    iconColor: "text-pink-400",
    shadow: "hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]",
    badgeBg: "bg-pink-500/15",
    badgeText: "text-pink-300",
  },
  stake: {
    icon: TrendingUp,
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/20",
    hoverBorder: "hover:border-orange-500/50",
    iconColor: "text-orange-400",
    shadow: "hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]",
    badgeBg: "bg-orange-500/15",
    badgeText: "text-orange-300",
  },
  borrow: {
    icon: ArrowDownRight,
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/20",
    hoverBorder: "hover:border-purple-500/50",
    iconColor: "text-purple-400",
    shadow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-300",
  },
  lend: {
    icon: ArrowUpRight,
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/50",
    iconColor: "text-blue-400",
    shadow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-300",
  },
  liquidation: {
    icon: AlertTriangle,
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/20",
    hoverBorder: "hover:border-red-500/50",
    iconColor: "text-red-400",
    shadow: "hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    badgeBg: "bg-red-500/15",
    badgeText: "text-red-300",
  },
}

export function LiveActivityFeed() {
  return (
    <Card className="relative backdrop-blur-xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl" />
      </div>

      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Live Activity
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          </CardTitle>
          <Badge variant="secondary" className="bg-white/10 text-foreground/80 border-white/10">
            {activities.length} events
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
          <div className="space-y-3">
            {activities.map((activity) => {
              const config = typeConfig[activity.type]
              const Icon = config.icon
              return (
                <div
                  key={activity.id}
                  className={[
                    "group cursor-pointer rounded-lg p-4 transition-all",
                    config.bgColor,
                    "border",
                    config.borderColor,
                    config.hoverBorder,
                    config.shadow,
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                        config.bgColor,
                      ].join(" ")}
                    >
                      <Icon className={["h-5 w-5", config.iconColor].join(" ")} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge
                          className={[
                            "text-xs capitalize border border-white/10",
                            config.badgeBg,
                            config.badgeText,
                          ].join(" ")}
                        >
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-foreground/50">{activity.time}</span>
                      </div>
                      <p className="mb-1 truncate text-sm text-foreground/80">
                        {activity.wallet} {activity.action}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">{activity.amount}</span>
                        <Badge variant="outline" className="border-white/20 text-xs text-foreground/60">
                          {activity.protocol}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default LiveActivityFeed;
