// ============================================
// PROTOCOL STATS QUERIES
// ============================================

export const GET_ALL_PROTOCOL_STATS = `
  query GetAllProtocolStats {
    ProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      name
      poolCount
      volumeTotalETH
      volume24hETH
      volumeTotalUSDC
      volume24hUSDC
      totalTransactions
      transactions24h
      totalSwaps
      swaps24h
      uniqueUsers
      uniqueUsers24h
      avgGasPrice
      tps
      lastUpdateTime
      lastBlockNumber
    }
    AaveProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      name
      totalSuppliedETH
      totalSuppliedUSDC
      totalSuppliedDAI
      totalSuppliedWBTC
      totalBorrowedETH
      totalBorrowedUSDC
      totalBorrowedDAI
      totalBorrowedWBTC
      globalUtilizationRate
      totalSupplies
      supplies24h
      totalWithdrawals
      withdrawals24h
      totalBorrows
      borrows24h
      totalRepays
      repays24h
      totalLiquidations
      liquidations24h
      uniqueSuppliers
      uniqueBorrowers
      uniqueUsers24h
      avgGasPrice
      tps
      healthScore
      lastUpdateTime
      lastBlockNumber
    }
    LidoProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      name
      totalStakedETH
      totalStETH
      totalSubmissions
      submissions24h
      totalTransfers
      transfers24h
      uniqueStakers
      uniqueStakers24h
      avgStakeSize
      avgGasPrice
      tps
      lastUpdateTime
      lastBlockNumber
    }
    CurveProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      name
      poolCount
      volumeTotalUSDC
      volume24hUSDC
      volumeTotalETH
      volume24hETH
      volumeTotalDAI
      volume24hDAI
      totalSwaps
      swaps24h
      totalLiquidityAdds
      liquidityAdds24h
      totalLiquidityRemoves
      liquidityRemoves24h
      uniqueUsers
      uniqueUsers24h
      avgGasPrice
      tps
      lastUpdateTime
      lastBlockNumber
    }
  }
`;

// ============================================
// UNISWAP V4 SPECIFIC
// ============================================

export const GET_UNISWAP_STATS = `
  query GetUniswapStats {
    ProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      name
      poolCount
      volumeTotalETH
      volume24hETH
      volumeTotalUSDC
      volume24hUSDC
      totalTransactions
      transactions24h
      totalSwaps
      swaps24h
      totalLiquidityModifications
      uniqueUsers
      uniqueUsers24h
      avgGasPrice
      tps
      lastUpdateTime
      lastBlockNumber
    }
  }
`;

export const GET_UNISWAP_POOLS = `
  query GetUniswapPools($limit: Int = 10) {
    Pool(limit: $limit, order_by: { txCount: desc }) {
      id
      currency0
      currency1
      fee
      tickSpacing
      liquidity
      sqrtPriceX96
      tick
      volumeToken0
      volumeToken1
      txCount
      createdAtTimestamp
    }
  }
`;

export const GET_UNISWAP_TRANSACTIONS = `
  query GetUniswapTransactions($limit: Int = 50) {
    Transaction(limit: $limit, order_by: { timestamp: desc }) {
      id
      txType
      poolId
      sender
      amount0
      amount1
      token0
      token1
      sqrtPriceX96
      liquidity
      tick
      timestamp
      blockNumber
      transactionHash
      logIndex
      gasPrice
    }
  }
`;

export const GET_UNISWAP_WHALE_ACTIVITY = `
  query GetUniswapWhaleActivity($limit: Int = 20) {
    WhaleActivity(
      limit: $limit
      order_by: { lastActiveTime: desc }
    ) {
      id
      wallet
      volumeETH
      volumeUSDC
      volumeWBTC
      transactionCount
      swapCount
      liquidityModCount
      poolsUsed
      poolCount
      largestSwapETH
      largestSwapUSDC
      firstSeenTime
      lastActiveTime
    }
  }
`;

// ============================================
// AAVE V3 SPECIFIC
// ============================================

export const GET_AAVE_STATS = `
  query GetAaveStats {
    AaveProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      name
      totalSuppliedETH
      totalSuppliedUSDC
      totalSuppliedDAI
      totalSuppliedWBTC
      totalBorrowedETH
      totalBorrowedUSDC
      totalBorrowedDAI
      totalBorrowedWBTC
      globalUtilizationRate
      totalSupplies
      supplies24h
      totalWithdrawals
      withdrawals24h
      totalBorrows
      borrows24h
      totalRepays
      repays24h
      totalLiquidations
      liquidations24h
      uniqueSuppliers
      uniqueBorrowers
      uniqueUsers24h
      avgGasPrice
      tps
      healthScore
      lastUpdateTime
      lastBlockNumber
    }
  }
`;

export const GET_AAVE_RESERVES = `
  query GetAaveReserves {
    AaveReserve(order_by: { totalSupplied: desc }) {
      id
      symbol
      name
      decimals
      totalSupplied
      totalBorrowed
      liquidityRate
      stableBorrowRate
      variableBorrowRate
      liquidityIndex
      variableBorrowIndex
      utilizationRate
      supplyCount
      borrowCount
      liquidationCount
      lastUpdateTimestamp
    }
  }
`;

export const GET_AAVE_TRANSACTIONS = `
  query GetAaveTransactions($limit: Int = 50) {
    AaveTransaction(limit: $limit, order_by: { timestamp: desc }) {
      id
      txType
      user
      onBehalfOf
      reserve
      reserveSymbol
      amount
      collateralAsset
      debtAsset
      liquidator
      debtToCover
      liquidatedCollateralAmount
      interestRateMode
      borrowRate
      timestamp
      blockNumber
      transactionHash
      logIndex
      gasPrice
    }
  }
`;

// ============================================
// LIDO SPECIFIC
// ============================================

export const GET_LIDO_STATS = `
  query GetLidoStats {
    LidoProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      name
      totalStakedETH
      totalStETH
      totalSubmissions
      submissions24h
      totalTransfers
      transfers24h
      uniqueStakers
      uniqueStakers24h
      avgStakeSize
      avgGasPrice
      tps
      lastUpdateTime
      lastBlockNumber
    }
  }
`;

export const GET_LIDO_TRANSACTIONS = `
  query GetLidoTransactions($limit: Int = 50) {
    LidoTransaction(limit: $limit, order_by: { timestamp: desc }) {
      id
      txType
      from
      to
      amount
      referral
      timestamp
      blockNumber
      transactionHash
      logIndex
      gasPrice
    }
  }
`;

export const GET_LIDO_TOP_STAKERS = `
  query GetLidoTopStakers($limit: Int = 20) {
    LidoStaker(
      limit: $limit
      order_by: { totalStakedETH: desc }
    ) {
      id
      staker
      totalStakedETH
      stakeCount
      firstStakeTime
      lastStakeTime
    }
  }
`;

// ============================================
// CURVE SPECIFIC
// ============================================

export const GET_CURVE_STATS = `
  query GetCurveStats {
    CurveProtocolStats(limit: 1, order_by: { lastUpdateTime: desc }) {
      id
      name
      poolCount
      volumeTotalUSDC
      volume24hUSDC
      volumeTotalETH
      volume24hETH
      volumeTotalDAI
      volume24hDAI
      totalSwaps
      swaps24h
      totalLiquidityAdds
      liquidityAdds24h
      totalLiquidityRemoves
      liquidityRemoves24h
      uniqueUsers
      uniqueUsers24h
      avgGasPrice
      tps
      lastUpdateTime
      lastBlockNumber
    }
  }
`;

export const GET_CURVE_POOLS = `
  query GetCurvePools {
    CurvePool(order_by: { volume24h: desc }) {
      id
      name
      poolType
      tokens
      tokenSymbols
      volumeTotal
      volume24h
      totalLiquidity
      swapCount
      swapCount24h
      addLiquidityCount
      removeLiquidityCount
      uniqueUsers
      createdAtTimestamp
      lastActivityTimestamp
    }
  }
`;

export const GET_CURVE_TRANSACTIONS = `
  query GetCurveTransactions($limit: Int = 50) {
    CurveTransaction(limit: $limit, order_by: { timestamp: desc }) {
      id
      poolId
      txType
      user
      soldTokenIndex
      boughtTokenIndex
      tokensSold
      tokensBought
      tokenAmounts
      lpTokenAmount
      timestamp
      blockNumber
      transactionHash
      logIndex
      gasPrice
    }
  }
`;

// ============================================
// PROTOCOL HEALTH
// ============================================

export const GET_PROTOCOL_HEALTH = `
  query GetProtocolHealth {
    ProtocolHealthSnapshot(
      distinct_on: protocol
      order_by: [{protocol: asc}, {timestamp: desc}]
      limit: 10
    ) {
      id
      protocol
      timestamp
      healthScore
      utilizationRate
      tvlChangePercent24h
      whaleExits1h
      gasSpike
      liquidationCount1h
      warnings
    }
  }
`;

// ============================================
// COMBINED ACTIVITY FEED
// ============================================

export const GET_RECENT_TRANSACTIONS = `
  query GetRecentTransactions($limit: Int = 50) {
    Transaction(limit: $limit, order_by: { timestamp: desc }) {
      id
      txType
      poolId
      sender
      amount0
      amount1
      token0
      token1
      timestamp
      transactionHash
      logIndex
      gasPrice
    }
    AaveTransaction(limit: $limit, order_by: { timestamp: desc }) {
      id
      txType
      user
      reserve
      reserveSymbol
      amount
      timestamp
      transactionHash
      logIndex
      gasPrice
    }
    LidoTransaction(limit: $limit, order_by: { timestamp: desc }) {
      id
      txType
      from
      amount
      timestamp
      transactionHash
      logIndex
      gasPrice
    }
    CurveTransaction(limit: $limit, order_by: { timestamp: desc }) {
      id
      txType
      poolId
      user
      tokensSold
      tokensBought
      lpTokenAmount
      timestamp
      transactionHash
      logIndex
      gasPrice
    }
  }
`;

// ============================================
// TOKEN REGISTRY
// ============================================

export const GET_TOKENS = `
  query GetTokens($limit: Int = 20) {
    Token(limit: $limit, order_by: { totalVolume: desc }) {
      id
      symbol
      name
      decimals
      poolCount
      totalVolume
    }
  }
`;