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
  type: string;
  from: string;
  amount: string;
  timestamp: number;
  txHash: string;
  protocol: 'uniswap' | 'aave' | 'lido' | 'curve';
  protocolColor: string;
  protocolIcon: string;
  isWhale: boolean;
}

const formatAmount = (amount: string, decimals: number = 18): number => {
  try {
    const amountBigInt = BigInt(amount || '0');
    return Number(amountBigInt) / Math.pow(10, decimals);
  } catch {
    return 0;
  }
};

const isWhaleTransaction = (amountEth: number): boolean => {
  return amountEth > 100; // Consider > 100 ETH as whale
};

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
    ...(data?.Transaction || []).map((tx) => {
      const amount0 = formatAmount(tx.amount0);
      const amount1 = formatAmount(tx.amount1);
      const avgAmount = (Math.abs(amount0) + Math.abs(amount1)) / 2;
      
      return {
        id: tx.id,
        type: tx.txType,
        from: tx.sender,
        amount: `${avgAmount.toFixed(4)} ${tx.token0 || 'tokens'}`,
        timestamp: Number(tx.timestamp) * 1000,
        txHash: tx.transactionHash,
        protocol: 'uniswap' as const,
        protocolColor: '#ff007a',
        protocolIcon: '🦄',
        isWhale: isWhaleTransaction(avgAmount),
      };
    }),
    ...(data?.AaveTransaction || []).map((tx) => {
      const amount = formatAmount(tx.amount);
      
      return {
        id: tx.id,
        type: tx.txType,
        from: tx.user,
        amount: `${amount.toFixed(4)} ${tx.reserveSymbol}`,
        timestamp: Number(tx.timestamp) * 1000,
        txHash: tx.transactionHash,
        protocol: 'aave' as const,
        protocolColor: '#8b5cf6',
        protocolIcon: '🏦',
        isWhale: isWhaleTransaction(amount),
      };
    }),
    ...(data?.LidoTransaction || []).map((tx) => {
      const amount = formatAmount(tx.amount);
      
      return {
        id: tx.id,
        type: tx.txType,
        from: tx.from,
        amount: `${amount.toFixed(4)} ETH`,
        timestamp: Number(tx.timestamp) * 1000,
        txHash: tx.transactionHash,
        protocol: 'lido' as const,
        protocolColor: '#f97316',
        protocolIcon: '🌊',
        isWhale: isWhaleTransaction(amount),
      };
    }),
    ...(data?.CurveTransaction || []).map((tx) => {
      const tokensSold = formatAmount(tx.tokensSold || '0');
      const lpTokenAmount = formatAmount(tx.lpTokenAmount || '0');
      const amount = tokensSold > 0 ? tokensSold : lpTokenAmount;
      
      return {
        id: tx.id,
        type: tx.txType,
        from: tx.user,
        amount: tokensSold > 0 ? `${tokensSold.toFixed(4)} tokens` : `${lpTokenAmount.toFixed(4)} LP`,
        timestamp: Number(tx.timestamp) * 1000,
        txHash: tx.transactionHash,
        protocol: 'curve' as const,
        protocolColor: '#3b82f6',
        protocolIcon: '🔷',
        isWhale: isWhaleTransaction(amount),
      };
    }),
  ].sort((a, b) => b.timestamp - a.timestamp);

  return {
    transactions: allTransactions,
    loading: isLoading,
    error,
  };
}