'use client';

import useSWR from 'swr';
import { fetchGraphQL } from '@/lib/graphql-client';
import { GET_RECENT_TRANSACTIONS } from '@/lib/graphql/queries';

interface BaseTransaction {
  id: string;
  txType: string;
  timestamp: string;
  transactionHash: string;
  logIndex: number;
  gasPrice: string;
}

interface UniswapTransaction extends BaseTransaction {
  poolId: string;
  sender: string;
  amount0: string;
  amount1: string;
  token0: string;
  token1: string;
}

interface AaveTransaction extends BaseTransaction {
  user: string;
  reserve: string;
  reserveSymbol: string;
  amount: string;
}

interface LidoTransaction extends BaseTransaction {
  from: string;
  amount: string;
}

interface CurveTransaction extends BaseTransaction {
  poolId: string;
  user: string;
  tokensSold?: string;
  tokensBought?: string;
  lpTokenAmount?: string;
}

interface RecentTransactionsResponse {
  Transaction: UniswapTransaction[];
  AaveTransaction: AaveTransaction[];
  LidoTransaction: LidoTransaction[];
  CurveTransaction: CurveTransaction[];
}

interface Transaction {
  id: string;
  txType: string;
  wallet: string;
  amount?: string;
  timestamp: string;
  transactionHash: string;
  protocol: string;
  protocolColor: string;
  protocolIcon: string;
}

export function useActivityFeed(limit: number = 50) {
  const { data, error, isLoading } = useSWR<RecentTransactionsResponse>(
    ['recent-transactions', limit],
    () => fetchGraphQL<RecentTransactionsResponse>(GET_RECENT_TRANSACTIONS, { limit }),
    {
      refreshInterval: 2000, // Poll every 2 seconds
      revalidateOnFocus: true,
      dedupingInterval: 1000,
    }
  );

  // Combine all transactions from different protocols
  const allTransactions: Transaction[] = [
    ...(data?.Transaction || []).map((tx) => ({
      id: tx.id,
      txType: tx.txType,
      wallet: tx.sender,
      amount: tx.amount0, // Use amount0 for display
      timestamp: tx.timestamp,
      transactionHash: tx.transactionHash,
      protocol: 'uniswap',
      protocolColor: '#ff007a',
      protocolIcon: '🦄',
    })),
    ...(data?.AaveTransaction || []).map((tx) => ({
      id: tx.id,
      txType: tx.txType,
      wallet: tx.user,
      amount: tx.amount,
      timestamp: tx.timestamp,
      transactionHash: tx.transactionHash,
      protocol: 'aave',
      protocolColor: '#8b5cf6',
      protocolIcon: '🏦',
    })),
    ...(data?.LidoTransaction || []).map((tx) => ({
      id: tx.id,
      txType: tx.txType,
      wallet: tx.from,
      amount: tx.amount,
      timestamp: tx.timestamp,
      transactionHash: tx.transactionHash,
      protocol: 'lido',
      protocolColor: '#f97316',
      protocolIcon: '🌊',
    })),
    ...(data?.CurveTransaction || []).map((tx) => ({
      id: tx.id,
      txType: tx.txType,
      wallet: tx.user,
      amount: tx.tokensSold || tx.lpTokenAmount || '0',
      timestamp: tx.timestamp,
      transactionHash: tx.transactionHash,
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