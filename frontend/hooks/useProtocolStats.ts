'use client';

import useSWR from 'swr';
import { fetchGraphQL } from '@/lib/graphql-client';
import { GET_ALL_PROTOCOL_STATS } from '@/lib/graphql/queries';

interface UniswapStats {
  id: string;
  name: string;
  poolCount: number;
  volumeTotalETH: string;
  volume24hETH: string;
  volumeTotalUSDC: string;
  volume24hUSDC: string;
  totalTransactions: string;
  transactions24h: string;
  totalSwaps: string;
  swaps24h: string;
  uniqueUsers: string;
  uniqueUsers24h: string;
  avgGasPrice: string;
  tps: number;
  lastUpdateTime: string;
  lastBlockNumber: string;
}

interface AaveStats {
  id: string;
  name: string;
  totalSuppliedETH: string;
  totalSuppliedUSDC: string;
  totalSuppliedDAI: string;
  totalSuppliedWBTC: string;
  totalBorrowedETH: string;
  totalBorrowedUSDC: string;
  totalBorrowedDAI: string;
  totalBorrowedWBTC: string;
  globalUtilizationRate: number;
  totalSupplies: string;
  supplies24h: string;
  totalWithdrawals: string;
  withdrawals24h: string;
  totalBorrows: string;
  borrows24h: string;
  totalRepays: string;
  repays24h: string;
  totalLiquidations: string;
  liquidations24h: string;
  uniqueSuppliers: string;
  uniqueBorrowers: string;
  uniqueUsers24h: string;
  avgGasPrice: string;
  tps: number;
  healthScore: number;
  lastUpdateTime: string;
  lastBlockNumber: string;
}

interface LidoStats {
  id: string;
  name: string;
  totalStakedETH: string;
  totalStETH: string;
  totalSubmissions: string;
  submissions24h: string;
  totalTransfers: string;
  transfers24h: string;
  uniqueStakers: string;
  uniqueStakers24h: string;
  avgStakeSize: string;
  avgGasPrice: string;
  tps: number;
  lastUpdateTime: string;
  lastBlockNumber: string;
}

interface CurveStats {
  id: string;
  name: string;
  poolCount: number;
  volumeTotalUSDC: string;
  volume24hUSDC: string;
  volumeTotalETH: string;
  volume24hETH: string;
  volumeTotalDAI: string;
  volume24hDAI: string;
  totalSwaps: string;
  swaps24h: string;
  totalLiquidityAdds: string;
  liquidityAdds24h: string;
  totalLiquidityRemoves: string;
  liquidityRemoves24h: string;
  uniqueUsers: string;
  uniqueUsers24h: string;
  avgGasPrice: string;
  tps: number;
  lastUpdateTime: string;
  lastBlockNumber: string;
}

interface AllProtocolStatsResponse {
  ProtocolStats: UniswapStats[];
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
  healthScore?: number;
}

export function useProtocolStats() {
  const { data, error, isLoading } = useSWR<AllProtocolStatsResponse>(
    'all-protocol-stats',
    () => fetchGraphQL<AllProtocolStatsResponse>(GET_ALL_PROTOCOL_STATS),
    {
      refreshInterval: 2000, // Poll every 2 seconds
      revalidateOnFocus: true,
      dedupingInterval: 1000,
    }
  );

  const protocols: ProtocolData[] = [
    {
      id: 'uniswap-v4',
      name: 'Uniswap V4',
      tvl: data?.ProtocolStats?.[0]?.volumeTotalETH || '0',
      volume24h: data?.ProtocolStats?.[0]?.volume24hETH || '0',
      transactionCount24h: data?.ProtocolStats?.[0]?.transactions24h || '0',
      tps: data?.ProtocolStats?.[0]?.tps ? Number(data.ProtocolStats[0].tps) : 0, // Convert to number
      color: '#ff007a',
      icon: '🦄',
    },
    {
      id: 'aave-v3',
      name: 'Aave V3',
      tvl: data?.AaveProtocolStats?.[0]?.totalSuppliedETH || '0',
      transactionCount24h: data?.AaveProtocolStats?.[0]?.supplies24h || '0',
      tps: data?.AaveProtocolStats?.[0]?.tps ? Number(data.AaveProtocolStats[0].tps) : 0, // Convert to number
      color: '#8b5cf6',
      icon: '🏦',
      healthScore: data?.AaveProtocolStats?.[0]?.healthScore ? Number(data.AaveProtocolStats[0].healthScore) : undefined, // Convert to number
    },
    {
      id: 'lido',
      name: 'Lido',
      tvl: data?.LidoProtocolStats?.[0]?.totalStakedETH || '0',
      transactionCount24h: data?.LidoProtocolStats?.[0]?.submissions24h || '0',
      tps: data?.LidoProtocolStats?.[0]?.tps ? Number(data.LidoProtocolStats[0].tps) : 0, // Convert to number
      color: '#f97316',
      icon: '🌊',
    },
    {
      id: 'curve',
      name: 'Curve',
      tvl: data?.CurveProtocolStats?.[0]?.volumeTotalETH || '0',
      volume24h: data?.CurveProtocolStats?.[0]?.volume24hETH || '0',
      transactionCount24h: data?.CurveProtocolStats?.[0]?.swaps24h || '0',
      tps: data?.CurveProtocolStats?.[0]?.tps ? Number(data.CurveProtocolStats[0].tps) : 0, // Convert to number
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