'use client';

import useSWR from 'swr';
import { fetchGraphQL } from '@/lib/graphql-client';
import { GET_WHALE_ACTIVITY } from '@/lib/graphql/queries';

interface WhaleActivity {
  wallet: string;
  protocols: string[];
  transactionCount: number;
  totalVolumeUSD: string;
  largestTransactionUSD: string;
  lastActiveTime: string;
  crossProtocolMoves: number;
}

interface WhaleActivityResponse {
  WhaleActivity: WhaleActivity[];
}

export function useWhaleActivity(limit: number = 20) {
  const { data, error, isLoading } = useSWR<WhaleActivityResponse>(
    ['whale-activity', limit],
    () => fetchGraphQL<WhaleActivityResponse>(GET_WHALE_ACTIVITY, { limit }),
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    whales: data?.WhaleActivity || [],
    loading: isLoading,
    error,
  };
}