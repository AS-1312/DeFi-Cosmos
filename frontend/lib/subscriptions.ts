import { gql } from '@apollo/client';

export const PROTOCOL_STATS_SUBSCRIPTION = gql`
  subscription ProtocolStats {
    ProtocolStats {
      id
      name
      poolCount
      volumeTotalETH
      volume24hETH
      volumeTotalUSDC
      volume24hUSDC
      totalSwaps
      swaps24h
      totalTransactions
      transactions24h
      uniqueUsers
      tps
      avgGasPrice
      lastUpdateTime
    }
  }
`;

export const RECENT_SWAPS_SUBSCRIPTION = gql`
  subscription RecentSwaps($limit: Int = 20) {
    Transaction(
      where: { txType: { _eq: "swap" } }
      order_by: { timestamp: desc }
      limit: $limit
    ) {
      id
      sender
      amount0
      amount1
      poolId
      token0
      token1
      timestamp
      transactionHash
      gasPrice
    }
  }
`;

export const WHALE_ACTIVITY_SUBSCRIPTION = gql`
  subscription WhaleActivity {
    WhaleActivity(
      order_by: { lastActiveTime: desc }
      limit: 10
    ) {
      wallet
      volumeETH
      volumeUSDC
      transactionCount
      swapCount
      liquidityModCount
      poolCount
      poolsUsed
      largestSwapETH
      lastActiveTime
    }
  }
`;

export const CAPITAL_FLOWS_SUBSCRIPTION = gql`
  subscription CapitalFlows {
    CapitalFlow(
      order_by: { timestamp: desc }
      limit: 20
    ) {
      id
      wallet
      fromPoolId
      toPoolId
      tokenSymbol
      amount
      timestamp
      timeDelta
      flowType
    }
  }
`;