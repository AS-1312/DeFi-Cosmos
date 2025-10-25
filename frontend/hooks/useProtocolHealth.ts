'use client';

import useSWR from 'swr';
import { fetchGraphQL } from '@/lib/graphql-client';
import { GET_PROTOCOL_HEALTH } from '@/lib/graphql/queries';

interface HealthSnapshot {
  protocol: string;
  timestamp: string;
  healthScore: number;
  utilizationRate?: number;
  tvlChange24h?: number;
  whaleExits1h: number;
  gasMultiplier: number;
  warnings: string;
}

interface ProtocolHealthResponse {
  ProtocolHealthSnapshot: HealthSnapshot[];
}

export function useProtocolHealth() {
  const { data, error, isLoading } = useSWR<ProtocolHealthResponse>(
    'protocol-health',
    () => fetchGraphQL<ProtocolHealthResponse>(GET_PROTOCOL_HEALTH),
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: true,
    }
  );

  // Parse warnings from JSON string
  const health = (data?.ProtocolHealthSnapshot || []).map((snapshot) => ({
    ...snapshot,
    warnings: JSON.parse(snapshot.warnings || '[]') as string[],
  }));

  return {
    health,
    loading: isLoading,
    error,
  };
}