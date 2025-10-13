"use client"

import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RiskLevel = "low" | "medium" | "high"

const protocolRisks: Array<{
  id: string
  name: string
  risk: RiskLevel
  riskScore: number // 0-100
  description: string
}> = [
  {
    id: "aave",
    name: "Aave",
    risk: "low",
    riskScore: 20,
    description: "Mature protocol with diversified collateral.",
  },
  {
    id: "uniswap",
    name: "Uniswap",
    risk: "medium",
    riskScore: 55,
    description: "Volatility-driven LP risk; concentrated liquidity.",
  },
  {
    id: "maker",
    name: "Maker",
    risk: "low",
    riskScore: 25,
    description: "Robust governance; oracle improvements.",
  },
  {
    id: "lido",
    name: "Lido",
    risk: "medium",
    riskScore: 50,
    description: "Validator set concentration; ongoing audits.",
  },
];

const riskConfig: Record<RiskLevel, { badge: string; bar: string }> = {
  low: {
    badge: "bg-green-500/20 text-green-300 border border-green-500/30",
    bar: "bg-green-500",
  },
  medium: {
    badge: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    bar: "bg-yellow-500",
  },
  high: {
    badge: "bg-red-500/20 text-red-300 border border-red-500/30",
    bar: "bg-red-500",
  },
};

export function RiskDashboard() {
  return (
    <Card className="backdrop-blur-xl bg-background/40 border border-red-500/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <AlertTriangle className="h-5 w-5 text-orange-400" aria-hidden="true" />
          <span className="text-balance">Risk Dashboard</span>
        </CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">Heuristics (mock)</p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {protocolRisks.map((protocol) => {
            const cfg = riskConfig[protocol.risk]

            return (
              <div
                key={protocol.id}
                className="rounded-lg border border-border/20 bg-background/30 p-3 transition-colors hover:border-border/40"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-foreground">{protocol.name}</span>
                  <Badge className={cfg.badge}>{protocol.risk.charAt(0).toUpperCase() + protocol.risk.slice(1)}</Badge>
                </div>

                <div
                  className="relative mb-2 h-2 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={protocol.riskScore}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`absolute left-0 top-0 h-full ${cfg.bar} transition-all duration-500 ease-out`}
                    style={{ width: `${protocol.riskScore}%` }}
                  />
                </div>

                <p className="text-xs text-muted-foreground">{protocol.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-6 rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-400" aria-hidden="true" />
            <div>
              <p className="mb-1 text-sm font-semibold text-orange-200">Market Conditions</p>
              <p className="text-xs text-orange-300/80">
                Moderate volatility detected. Monitor high-leverage positions across all protocols.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RiskDashboard;
