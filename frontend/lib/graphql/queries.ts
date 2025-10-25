// Protocol Stats Queries
export const GET_ALL_PROTOCOL_STATS = `
  query GetAllProtocolStats {
    UniswapProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      tvl
      volume24h
      transactionCount24h
      tps
      lastUpdateTime
    }
    AaveProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      totalSupplied
      totalBorrowed
      utilizationRate
      transactionCount24h
      lastUpdateTime
    }
    LidoProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      totalStakedETH
      totalShares
      aprCurrent
      transactionCount24h
      lastUpdateTime
    }
    CurveProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      tvl
      volume24h
      transactionCount24h
      lastUpdateTime
    }
  }
`;

// Protocol Health Query
export const GET_PROTOCOL_HEALTH = `
  query GetProtocolHealth {
    ProtocolHealthSnapshot(
      order_by: { timestamp: desc }
      distinct_on: protocol
      limit: 4
    ) {
      protocol
      timestamp
      healthScore
      utilizationRate
      tvlChange24h
      whaleExits1h
      gasMultiplier
      warnings
    }
  }
`;

// Recent Transactions Query
export const GET_RECENT_TRANSACTIONS = `
  query GetRecentTransactions($limit: Int = 50) {
    UniswapTransaction(limit: $limit, order_by: { timestamp: desc }) {
      id
      txType
      wallet
      amount
      timestamp
      transactionHash
      logIndex
    }
    AaveTransaction(limit: $limit, order_by: { timestamp: desc }) {
      id
      txType
      wallet
      reserve
      amount
      timestamp
      transactionHash
      logIndex
    }
    LidoTransaction(limit: $limit, order_by: { timestamp: desc }) {
      id
      txType
      wallet
      amount
      shares
      timestamp
      transactionHash
      logIndex
    }
    CurveTransaction(limit: $limit, order_by: { timestamp: desc }) {
      id
      txType
      wallet
      amountIn
      amountOut
      timestamp
      transactionHash
      logIndex
    }
  }
`;

// Single Protocol Detail Queries
export const GET_UNISWAP_STATS = `
  query GetUniswapStats {
    UniswapProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      tvl
      volume24h
      volumeTotal
      transactionCount
      transactionCount24h
      poolCount
      tps
      lastUpdateTime
    }
  }
`;

export const GET_AAVE_STATS = `
  query GetAaveStats {
    AaveProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      totalSupplied
      totalBorrowed
      utilizationRate
      transactionCount24h
      lastUpdateTime
    }
  }
`;

export const GET_LIDO_STATS = `
  query GetLidoStats {
    LidoProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      totalStakedETH
      totalShares
      aprCurrent
      transactionCount24h
      lastUpdateTime
    }
  }
`;

export const GET_CURVE_STATS = `
  query GetCurveStats {
    CurveProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      tvl
      volume24h
      transactionCount24h
      lastUpdateTime
    }
  }
`;

// Whale Activity Query
export const GET_WHALE_ACTIVITY = `
  query GetWhaleActivity($limit: Int = 20) {
    WhaleActivity(
      limit: $limit
      order_by: { lastActiveTime: desc }
      where: { totalVolumeUSD: { _gte: "100000000000000000000000" } }
    ) {
      wallet
      protocols
      transactionCount
      totalVolumeUSD
      largestTransactionUSD
      lastActiveTime
      crossProtocolMoves
    }
  }
`;