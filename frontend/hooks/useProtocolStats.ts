'use client';

import useSWR from 'swr';
import { fetchGraphQL } from '@/lib/graphql-client';
import { GET_ALL_PROTOCOL_STATS } from '@/lib/graphql/queries';

interface UniswapStats {
  id: string;
  tvl: string;
  volume24h: string;
  transactionCount24h: string;
  tps: number;
  lastUpdateTime: string;
}

interface AaveStats {
  id: string;
  totalSupplied: string;
  totalBorrowed: string;
  utilizationRate: number;
  transactionCount24h: string;
  lastUpdateTime: string;
}

interface LidoStats {
  id: string;
  totalStakedETH: string;
  totalShares: string;
  aprCurrent: number;
  transactionCount24h: string;
  lastUpdateTime: string;
}

interface CurveStats {
  id: string;
  tvl: string;
  volume24h: string;
  transactionCount24h: string;
  lastUpdateTime: string;
}

interface AllProtocolStatsResponse {
  UniswapProtocolStats: UniswapStats[];
  AaveProtocolStats: AaveStats[];
  LidoProtocolStats: LidoStats[];
  CurveProtocolStats: CurveStats[];
}

interface ProtocolData {
  id: string;
  name: string;
  tvl: string;
  volume24h?: string;
  transactionCount24h: string;
  tps?: number;
  color: string;
  icon: string;
}

export function useProtocolStats() {
  const { data, error, isLoading } = useSWR<AllProtocolStatsResponse>(
    'all-protocol-stats',
    () => fetchGraphQL<AllProtocolStatsResponse>(GET_ALL_PROTOCOL_STATS),
    {
      refreshInterval: 2000, // Poll every 2 seconds for real-time feel
      revalidateOnFocus: true,
      dedupingInterval: 1000,
    }
  );

  const protocols: ProtocolData[] = [
    {
      id: 'uniswap-v4',
      name: 'Uniswap V4',
      tvl: data?.UniswapProtocolStats?.[0]?.tvl || '0',
      volume24h: data?.UniswapProtocolStats?.[0]?.volume24h || '0',
      transactionCount24h: data?.UniswapProtocolStats?.[0]?.transactionCount24h || '0',
      tps: data?.UniswapProtocolStats?.[0]?.tps || 0,
      color: '#ff007a',
      icon: '🦄',
    },
    {
      id: 'aave-v3',
      name: 'Aave V3',
      tvl: data?.AaveProtocolStats?.[0]?.totalSupplied || '0',
      transactionCount24h: data?.AaveProtocolStats?.[0]?.transactionCount24h || '0',
      color: '#8b5cf6',
      icon: '🏦',
    },
    {
      id: 'lido',
      name: 'Lido',
      tvl: data?.LidoProtocolStats?.[0]?.totalStakedETH || '0',
      transactionCount24h: data?.LidoProtocolStats?.[0]?.transactionCount24h || '0',
      color: '#f97316',
      icon: '🌊',
    },
    {
      id: 'curve',
      name: 'Curve',
      tvl: data?.CurveProtocolStats?.[0]?.tvl || '0',
      volume24h: data?.CurveProtocolStats?.[0]?.volume24h || '0',
      transactionCount24h: data?.CurveProtocolStats?.[0]?.transactionCount24h || '0',
      color: '#3b82f6',
      icon: '🔷',
    },
  ];

  return {
    protocols,
    loading: isLoading,
    error,
  };
}