'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Activity, Users, TrendingUp } from 'lucide-react';
import { HealthIndicator } from './HealthIndicator';

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
}

interface ProtocolCardProps {
  protocol: Protocol;
}

export function ProtocolCard({ protocol }: ProtocolCardProps) {
  // Format TVL (convert from wei/smallest unit to ETH/tokens)
  const tvlNumber = Number(BigInt(protocol.tvl || '0')) / 1e18;
  const tvlFormatted = formatLargeNumber(tvlNumber);

  // Format 24h transactions
  const txCount24h = Number(protocol.transactionCount24h || '0');
  const txFormatted = formatNumber(txCount24h);

  // Format 24h volume (if available)
  const volume24h = protocol.volume24h 
    ? formatLargeNumber(Number(BigInt(protocol.volume24h)) / 1e18)
    : null;

  // TPS with 2 decimal places - handle string/number/null/undefined
  const tpsValue = protocol.tps ? Number(protocol.tps) : 0;
  const tpsFormatted = tpsValue > 0 ? tpsValue.toFixed(2) : '0.00';

  return (
    <Link href={`/protocols/${protocol.id}`}>
      <Card 
        className="glass border-white/10 hover:border-white/30 transition-all cursor-pointer group relative overflow-hidden"
        style={{
          boxShadow: `0 0 20px ${protocol.color}15`,
        }}
      >
        {/* Gradient overlay on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${protocol.color} 0%, transparent 100%)`,
          }}
        />

        <CardHeader className="space-y-1 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{protocol.icon}</span>
              <div>
                <CardTitle className="text-lg text-white">
                  {protocol.name}
                </CardTitle>
                <p className="text-xs text-gray-400 mt-1">
                  {getProtocolType(protocol.id)}
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          {/* Primary Metric (TVL) */}
          <div>
            <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {getPrimaryMetricLabel(protocol.id)}
            </p>
            <p className="text-2xl font-bold text-white">
              {tvlFormatted}
            </p>
          </div>

          {/* Secondary Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* 24h Activity */}
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                24h Activity
              </p>
              <p className="text-sm font-semibold text-white">
                {txFormatted} txs
              </p>
            </div>

            {/* TPS or Health Score */}
            <div>
              {protocol.healthScore !== undefined && protocol.healthScore > 0 ? (
                <>
                  <p className="text-xs text-gray-400 mb-1">Health</p>
                  <HealthIndicator protocolId={protocol.id} compact />
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-1">TPS</p>
                  <p className="text-sm font-semibold text-white">
                    {tpsFormatted}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* 24h Volume (if available) */}
          {volume24h && (
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs text-gray-400 mb-1">24h Volume</p>
              <p className="text-sm font-semibold text-white">
                {volume24h} ETH
              </p>
            </div>
          )}

          {/* Live indicator badge */}
          <Badge
            className="w-full justify-center border-0"
            style={{ 
              backgroundColor: `${protocol.color}20`, 
              color: protocol.color 
            }}
          >
            <span className="relative flex h-2 w-2 mr-2">
              <span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: protocol.color }}
              ></span>
              <span 
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: protocol.color }}
              ></span>
            </span>
            Live Data
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

// Helper functions
function formatLargeNumber(num: number): string {
  if (!num || num === 0) return '0';
  
  // Handle NaN
  if (isNaN(num)) return '0';
  
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  } else {
    return num.toFixed(2);
  }
}

function formatNumber(num: number): string {
  if (!num || num === 0) return '0';
  
  // Handle NaN
  if (isNaN(num)) return '0';
  
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  } else {
    return num.toString();
  }
}

function getProtocolType(protocolId: string): string {
  const types: Record<string, string> = {
    uniswap: 'DEX • Liquidity Protocol',
    aave: 'Lending • Borrowing',
    lido: 'Liquid Staking',
    curve: 'Stableswap • DEX',
  };
  return types[protocolId] || 'DeFi Protocol';
}

function getPrimaryMetricLabel(protocolId: string): string {
  const labels: Record<string, string> = {
    uniswap: 'Total Volume',
    aave: 'Total Supplied',
    lido: 'Total Staked',
    curve: 'Total Volume',
  };
  return labels[protocolId] || 'TVL';
}