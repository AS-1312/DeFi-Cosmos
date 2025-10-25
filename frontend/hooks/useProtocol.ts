'use client';

import useSWR from 'swr';
import { fetchGraphQL } from '@/lib/graphql-client';
import {
  GET_UNISWAP_STATS,
  GET_AAVE_STATS,
  GET_LIDO_STATS,
  GET_CURVE_STATS,
} from '@/lib/graphql/queries';

const QUERY_MAP = {
  uniswap: GET_UNISWAP_STATS,
  aave: GET_AAVE_STATS,
  lido: GET_LIDO_STATS,
  curve: GET_CURVE_STATS,
} as const;

type ProtocolId = keyof typeof QUERY_MAP;

export function useProtocol(protocolId: ProtocolId) {
  const query = QUERY_MAP[protocolId];

  const { data, error, isLoading } = useSWR(
    ['protocol-detail', protocolId],
    () => fetchGraphQL(query),
    {
      refreshInterval: 3000, // Poll every 3 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    loading: isLoading,
    error,
  };
}