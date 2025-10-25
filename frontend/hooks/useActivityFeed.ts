'use client';

import useSWR from 'swr';
import { fetchGraphQL } from '@/lib/graphql-client';
import { GET_RECENT_TRANSACTIONS } from '@/lib/graphql/queries';

interface BaseTransaction {
  id: string;
  txType: string;
  wallet: string;
  timestamp: string;
  transactionHash: string;
  logIndex: number;
}

interface UniswapTransaction extends BaseTransaction {
  amount: string;
}

interface AaveTransaction extends BaseTransaction {
  reserve: string;
  amount: string;
}

interface LidoTransaction extends BaseTransaction {
  amount: string;
  shares: string;
}

interface CurveTransaction extends BaseTransaction {
  amountIn: string;
  amountOut: string;
}

interface RecentTransactionsResponse {
  UniswapTransaction: UniswapTransaction[];
  AaveTransaction: AaveTransaction[];
  LidoTransaction: LidoTransaction[];
  CurveTransaction: CurveTransaction[];
}

interface Transaction extends BaseTransaction {
  amount?: string;
  amountIn?: string;
  amountOut?: string;
  protocol: string;
  protocolColor: string;
  protocolIcon: string;
}

export function useActivityFeed(limit: number = 50) {
  const { data, error, isLoading } = useSWR<RecentTransactionsResponse>(
    ['recent-transactions', limit],
    () => fetchGraphQL<RecentTransactionsResponse>(GET_RECENT_TRANSACTIONS, { limit }),
    {
      refreshInterval: 2000, // Poll every 2 seconds for live feel
      revalidateOnFocus: true,
      dedupingInterval: 1000,
    }
  );

  // Combine all transactions from different protocols
  const allTransactions: Transaction[] = [
    ...(data?.UniswapTransaction || []).map((tx) => ({
      ...tx,
      protocol: 'uniswap',
      protocolColor: '#ff007a',
      protocolIcon: '🦄',
    })),
    ...(data?.AaveTransaction || []).map((tx) => ({
      ...tx,
      protocol: 'aave',
      protocolColor: '#8b5cf6',
      protocolIcon: '🏦',
    })),
    ...(data?.LidoTransaction || []).map((tx) => ({
      ...tx,
      protocol: 'lido',
      protocolColor: '#f97316',
      protocolIcon: '🌊',
    })),
    ...(data?.CurveTransaction || []).map((tx) => ({
      ...tx,
      protocol: 'curve',
      protocolColor: '#3b82f6',
      protocolIcon: '🔷',
    })),
  ].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  return {
    transactions: allTransactions,
    loading: isLoading,
    error,
  };
}