'use client';

import { useMemo } from 'react';
import { useActivityFeed } from './useActivityFeed';
import { useProtocolStats } from './useProtocolStats';

interface TPSDataPoint {
  timestamp: string;
  uniswap: number;
  aave: number;
  lido: number;
  curve: number;
}

interface VolumeDistribution {
  name: string;
  value: number;
  color: string;
}

interface TransactionTypeCount {
  type: string;
  count: number;
  color: string;
}

export function useFeedAnalytics() {
  const { transactions } = useActivityFeed(100);
  const { protocols } = useProtocolStats();

  // Calculate TPS data by protocol (current TPS from stats)
  const tpsData = useMemo<TPSDataPoint[]>(() => {
    const now = new Date();
    const dataPoints: TPSDataPoint[] = [];

    // Create 10 time points over the last 30 seconds
    for (let i = 9; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 3000);
      dataPoints.push({
        timestamp: timestamp.toLocaleTimeString('en-US', { 
          hour12: false, 
          minute: '2-digit', 
          second: '2-digit' 
        }),
        uniswap: protocols.find(p => p.id === 'uniswap-v4')?.tps || 0,
        aave: protocols.find(p => p.id === 'aave-v3')?.tps || 0,
        lido: protocols.find(p => p.id === 'lido')?.tps || 0,
        curve: protocols.find(p => p.id === 'curve')?.tps || 0,
      });
    }

    return dataPoints;
  }, [protocols]);

  // Calculate volume distribution by protocol
  const volumeDistribution = useMemo<VolumeDistribution[]>(() => {
    return protocols.map(protocol => {
      const tvlValue = Number(protocol.tvl) / 1e18; // Convert from Wei
      return {
        name: protocol.name,
        value: Math.round(tvlValue * 100) / 100,
        color: protocol.color,
      };
    }).filter(item => item.value > 0);
  }, [protocols]);

  // Calculate transaction type breakdown
  const transactionTypes = useMemo<TransactionTypeCount[]>(() => {
    const typeCounts = new Map<string, { count: number; protocol: string }>();

    transactions.forEach(tx => {
      const type = tx.type;
      const existing = typeCounts.get(type) || { count: 0, protocol: tx.protocol };
      typeCounts.set(type, { 
        count: existing.count + 1, 
        protocol: tx.protocol 
      });
    });

    // Convert to array and sort by count
    return Array.from(typeCounts.entries())
      .map(([type, data]) => {
        const protocol = protocols.find(p => p.id === data.protocol);
        return {
          type: type.replace(/([A-Z])/g, ' $1').trim(),
          count: data.count,
          color: protocol?.color || '#6b7280',
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 types
  }, [transactions, protocols]);

  // Calculate totals
  const totalVolume = volumeDistribution.reduce((sum, item) => sum + item.value, 0);
  const totalTransactions = transactions.length;
  const whaleCount = transactions.filter(tx => tx.isWhale).length;

  return {
    tpsData,
    volumeDistribution,
    transactionTypes,
    totalVolume,
    totalTransactions,
    whaleCount,
  };
}
