'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, Users, Zap } from 'lucide-react';

interface Protocol {
  id: string;
  name: string;
  tvl: string;
  volume24h?: string;
  transactionCount24h: string;
  tps?: number;
  color: string;
  icon: string;
  healthScore?: number;
  lastBlockNumber?: string;
}

interface ProtocolStatsModalProps {
  protocol: Protocol | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProtocolStatsModal({ protocol, open, onOpenChange }: ProtocolStatsModalProps) {
  if (!protocol) return null;

  const tvlEth = Number(BigInt(protocol.tvl || '0')) / 1e18;
  const volume24hEth = protocol.volume24h ? Number(BigInt(protocol.volume24h)) / 1e18 : undefined;

  const getHealthColor = (score?: number) => {
    if (!score) return 'bg-gray-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHealthLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'Moderate';
    return 'At Risk';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">{protocol.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                {protocol.name}
                {protocol.healthScore !== undefined && (
                  <Badge 
                    className={`${getHealthColor(protocol.healthScore)} text-white border-0`}
                  >
                    {getHealthLabel(protocol.healthScore)}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-400 font-normal mt-1">
                Protocol Analytics & Metrics
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* TVL Card */}
          <div 
            className="p-4 rounded-lg border"
            style={{
              background: `linear-gradient(135deg, ${protocol.color}15 0%, transparent 100%)`,
              borderColor: `${protocol.color}30`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={{ color: protocol.color }} />
              <span className="text-sm text-gray-400">Total Value Locked</span>
            </div>
            <div className="text-2xl font-bold">{tvlEth.toFixed(2)} ETH</div>
            <div className="text-xs text-gray-500 mt-1">
              ${(tvlEth * 3000).toLocaleString()} USD
            </div>
          </div>

          {/* 24h Volume Card */}
          {volume24hEth !== undefined && (
            <div 
              className="p-4 rounded-lg border"
              style={{
                background: `linear-gradient(135deg, ${protocol.color}15 0%, transparent 100%)`,
                borderColor: `${protocol.color}30`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4" style={{ color: protocol.color }} />
                <span className="text-sm text-gray-400">24h Volume</span>
              </div>
              <div className="text-2xl font-bold">{volume24hEth.toFixed(2)} ETH</div>
              <div className="text-xs text-gray-500 mt-1">
                ${(volume24hEth * 3000).toLocaleString()} USD
              </div>
            </div>
          )}

          {/* Transactions Card */}
          <div 
            className="p-4 rounded-lg border"
            style={{
              background: `linear-gradient(135deg, ${protocol.color}15 0%, transparent 100%)`,
              borderColor: `${protocol.color}30`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" style={{ color: protocol.color }} />
              <span className="text-sm text-gray-400">24h Transactions</span>
            </div>
            <div className="text-2xl font-bold">
              {Number(protocol.transactionCount24h || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {((Number(protocol.transactionCount24h || 0) / 86400) * 60).toFixed(1)} per minute
            </div>
          </div>

          {/* TPS Card */}
          {protocol.tps !== undefined && (
            <div 
              className="p-4 rounded-lg border"
              style={{
                background: `linear-gradient(135deg, ${protocol.color}15 0%, transparent 100%)`,
                borderColor: `${protocol.color}30`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4" style={{ color: protocol.color }} />
                <span className="text-sm text-gray-400">Transactions Per Second</span>
              </div>
              <div className="text-2xl font-bold">{protocol.tps.toFixed(3)} TPS</div>
              <div className="text-xs text-gray-500 mt-1">
                Real-time throughput
              </div>
            </div>
          )}
        </div>

        {/* Health Score Detail */}
        {protocol.healthScore !== undefined && (
          <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Health Score</span>
              <span className="text-2xl font-bold" style={{ color: protocol.color }}>
                {protocol.healthScore}/100
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${protocol.healthScore}%`,
                  backgroundColor: protocol.color,
                }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Based on utilization rate, TVL stability, and network activity
            </div>
          </div>
        )}

        {/* Block Info */}
        {protocol.lastBlockNumber && (
          <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Last Indexed Block</span>
              <span className="font-mono font-semibold">#{protocol.lastBlockNumber}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
