"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HazeIcon as WhaleIcon } from "lucide-react";

type WhaleSize = "mega" | "large" | "medium"
type WhaleActivity = {
  id: string
  address: string
  fullAddress: string
  action: string
  amount: string
  time: string
  size: WhaleSize
}

const whaleActivities: WhaleActivity[] = [
  {
    id: "1",
    address: "0xAbC...91f",
    fullAddress: "0xAbC1234567890123456789012345678901234591f",
    action: "bought ETH",
    amount: "$2.1M",
    time: "3m ago",
    size: "mega",
  },
  {
    id: "2",
    address: "0x1iD...0a2",
    fullAddress: "0x1iD2345678901234567890123456789012345670a2",
    action: "deposited USDC",
    amount: "$750.0K",
    time: "7m ago",
    size: "large",
  },
  {
    id: "3",
    address: "0x77F...9C1",
    fullAddress: "0x77F3456789012345678901234567890123456789C1",
    action: "sold ARB",
    amount: "$410.0K",
    time: "16m ago",
    size: "medium",
  },
  {
    id: "4",
    address: "0x5bE...3A8",
    fullAddress: "0x5bE4567890123456789012345678901234567893A8",
    action: "staked ETH",
    amount: "$890.0K",
    time: "22m ago",
    size: "large",
  },
  {
    id: "5",
    address: "0x9fC...2D4",
    fullAddress: "0x9fC5678901234567890123456789012345678902D4",
    action: "borrowed DAI",
    amount: "$320.0K",
    time: "28m ago",
    size: "medium",
  },
];

const sizeConfig: Record<WhaleSize, { borderColor: string; hoverBorder: string; badge: string }> = {
  mega: {
    borderColor: "border-purple-500/30",
    hoverBorder: "hover:border-purple-500/60",
    badge: "bg-purple-500/20 text-purple-300",
  },
  large: {
    borderColor: "border-blue-500/30",
    hoverBorder: "hover:border-blue-500/60",
    badge: "bg-blue-500/20 text-blue-300",
  },
  medium: {
    borderColor: "border-gray-500/30",
    hoverBorder: "hover:border-gray-500/60",
    badge: "bg-gray-500/20 text-gray-300",
  },
};

export function WhaleTracker() {
  return (
    <Card
      className="sticky top-20 backdrop-blur-xl bg-white/5 border border-white/10"
      role="region"
      aria-label="Whale tracker - top wallet activity"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <WhaleIcon className="w-5 h-5 text-blue-400" aria-hidden="true" />
            <span className="text-pretty">Whale Tracker</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs text-muted-foreground border-border">
            Top wallets
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Top movers (Last hour)</p>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3" role="list">
          {whaleActivities.map((whale) => {
            const config = sizeConfig[whale.size]
            return (
              <li key={whale.id} role="listitem">
                <div
                  className={[
                    "group p-3 rounded-lg bg-white/5 border transition-all duration-300 cursor-pointer",
                    config.borderColor,
                    config.hoverBorder,
                  ].join(" ")}
                  title={whale.fullAddress}
                >
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-xs text-blue-300 font-mono group-hover:hidden">{whale.address}</code>
                    <code className="text-xs text-blue-300 font-mono hidden group-hover:block">
                      {whale.fullAddress}
                    </code>
                    <span className="text-xs text-muted-foreground">{whale.time}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{whale.action}</span>
                    <span className="text-lg font-bold text-foreground">{whale.amount}</span>
                  </div>

                  {whale.size === "mega" && (
                    <Badge className={`${config.badge} mt-2 text-xs inline-flex items-center gap-1`}>
                      <WhaleIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      Mega Whale
                    </Badge>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export default WhaleTracker;
