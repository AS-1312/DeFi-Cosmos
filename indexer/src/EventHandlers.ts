import {
  PoolManager,
  Pool,
  Token,
  Transaction,
  ProtocolStats,
  HourlySnapshot,
  WhaleActivity,
  CapitalFlow,
  BigDecimal,
  AaveV3Pool,
} from "../generated";

// ============ CONSTANTS ============

const PROTOCOL_UNISWAP = "uniswap-v4";
const PROTOCOL_AAVE = "aave-v3";
const HOUR_IN_SECONDS = 3600;
const CAPITAL_FLOW_WINDOW = 300; // 5 minutes

// Token addresses (Ethereum mainnet)
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const WBTC_ADDRESS = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

// Whale thresholds (in token base units)
const WHALE_THRESHOLDS: { [key: string]: bigint } = {
  [WETH_ADDRESS.toLowerCase()]: BigInt(50) * BigInt(10 ** 18), // 50 ETH
  [USDC_ADDRESS.toLowerCase()]: BigInt(250000) * BigInt(10 ** 6), // 250K USDC
  [WBTC_ADDRESS.toLowerCase()]: BigInt(10) * BigInt(10 ** 8), // 10 WBTC
  [DAI_ADDRESS.toLowerCase()]: BigInt(250000) * BigInt(10 ** 18), // 250K DAI
};

// Token symbols for display
const TOKEN_SYMBOLS: { [key: string]: string } = {
  [WETH_ADDRESS.toLowerCase()]: "ETH",
  [USDC_ADDRESS.toLowerCase()]: "USDC",
  [WBTC_ADDRESS.toLowerCase()]: "WBTC",
  [DAI_ADDRESS.toLowerCase()]: "DAI",
};

const TOKEN_DECIMALS: { [key: string]: number } = {
  [WETH_ADDRESS]: 18,
  [USDC_ADDRESS]: 6,
  [WBTC_ADDRESS]: 8,
  [DAI_ADDRESS]: 18,
};

// ============ HELPER FUNCTIONS ============

async function getOrCreateProtocolStats(context: any, timestamp: bigint, blockNumber: bigint): Promise<ProtocolStats> {
  let stats = await context.ProtocolStats.get(PROTOCOL_UNISWAP);
  
  if (!stats) {
    stats = {
      id: PROTOCOL_UNISWAP,
      name: "Uniswap V4",
      poolCount: 0,
      volumeTotalETH: new BigDecimal(0),
      volume24hETH: new BigDecimal(0),
      volumeTotalUSDC: new BigDecimal(0),
      volume24hUSDC: new BigDecimal(0),
      totalTransactions: BigInt(0),
      transactions24h: BigInt(0),
      totalSwaps: BigInt(0),
      swaps24h: BigInt(0),
      totalLiquidityModifications: BigInt(0),
      uniqueUsers: BigInt(0),
      uniqueUsers24h: BigInt(0),
      avgGasPrice: BigInt(0),
      tps: 0,
      lastUpdateTime: timestamp,
      lastBlockNumber: blockNumber,
    };
  }
  
  return stats;
}

function getTokenSymbol(address: string): string {
  const lowerAddress = address.toLowerCase();
  return TOKEN_SYMBOLS[lowerAddress] || "UNKNOWN";
}

function getTokenDecimals(address: string): number {
  const lowerAddress = address.toLowerCase();
  return TOKEN_DECIMALS[lowerAddress] || 18;
}

function isWhaleTransaction(tokenAddress: string, amount: bigint): boolean {
  const threshold = WHALE_THRESHOLDS[tokenAddress.toLowerCase()];
  if (!threshold) return false;
  
  const absAmount = amount < 0 ? -amount : amount;
  return absAmount >= threshold;
}

async function updateProtocolMetrics(
  context: any,
  timestamp: bigint,
  blockNumber: bigint,
  gasPrice: bigint
): Promise<void> {
  const stats = await getOrCreateProtocolStats(context, timestamp, blockNumber);
  
  // Update gas price (rolling average)
  const newAvgGasPrice = stats.avgGasPrice === BigInt(0) 
    ? gasPrice 
    : (stats.avgGasPrice * BigInt(99) + gasPrice) / BigInt(100);
  
  // Calculate TPS (simple approximation)
  const timeDiff = Number(timestamp - stats.lastUpdateTime);
  const newTps = timeDiff > 0 ? Number(stats.transactions24h) / (24 * 3600) : stats.tps;
  
  const updatedStats = {
    ...stats,
    avgGasPrice: newAvgGasPrice,
    tps: newTps,
    lastUpdateTime: timestamp,
    lastBlockNumber: blockNumber,
  };
  
  context.ProtocolStats.set(updatedStats);
}

async function createHourlySnapshot(context: any, timestamp: bigint, stats: ProtocolStats): Promise<void> {
  const hourTimestamp = (timestamp / BigInt(HOUR_IN_SECONDS)) * BigInt(HOUR_IN_SECONDS);
  const snapshotId = `${PROTOCOL_UNISWAP}-${hourTimestamp}`;
  
  // Check if already exists
  const existing = await context.HourlySnapshot.get(snapshotId);
  if (existing) return;
  
  const snapshot: HourlySnapshot = {
    id: snapshotId,
    timestamp: hourTimestamp,
    totalVolumeETH: stats.volumeTotalETH,
    totalVolumeUSDC: stats.volumeTotalUSDC,
    transactions: Number(stats.totalTransactions),
    swaps: Number(stats.totalSwaps),
    uniqueUsers: Number(stats.uniqueUsers),
    poolCount: stats.poolCount,
    avgGasPrice: stats.avgGasPrice,
  };
  
  context.HourlySnapshot.set(snapshot);
}

// ============ EVENT HANDLERS ============

/**
 * Handle pool initialization
 */
PoolManager.Initialize.handler(async ({ event, context }: any) => {
  const { id, currency0, currency1, fee, tickSpacing, hooks } = event.params;
  
  // Create pool entity
  const pool: Pool = {
    id: id,
    currency0: currency0,
    currency1: currency1,
    fee: Number(fee),
    tickSpacing: Number(tickSpacing),
    hooks: hooks,
    liquidity: BigInt(0),
    sqrtPriceX96: BigInt(0),
    tick: 0,
    volumeToken0: new BigDecimal(0),
    volumeToken1: new BigDecimal(0),
    txCount: BigInt(0),
    createdAtTimestamp: BigInt(event.block.timestamp),
    createdAtBlockNumber: BigInt(event.block.number),
  };
  
  context.Pool.set(pool);
  
  // Update protocol stats
  const stats = await getOrCreateProtocolStats(
    context,
    BigInt(event.block.timestamp),
    BigInt(event.block.number)
  );
  
  const updatedStats = {
    ...stats,
    poolCount: stats.poolCount + 1,
  };
  context.ProtocolStats.set(updatedStats);
  
  // Create token entities if they don't exist
  const existingToken0 = await context.Token.get(currency0);
  if (!existingToken0) {
    context.Token.set({
      id: currency0,
      symbol: getTokenSymbol(currency0),
      name: "",
      decimals: 18, // Default, should fetch from contract
      poolCount: 1,
      totalVolume: new BigDecimal(0),
    });
  }
  
  const existingToken1 = await context.Token.get(currency1);
  if (!existingToken1) {
    context.Token.set({
      id: currency1,
      symbol: getTokenSymbol(currency1),
      name: "",
      decimals: 18,
      poolCount: 1,
      totalVolume: new BigDecimal(0),
    });
  }
});

/**
 * Handle swaps
 */
PoolManager.Swap.handler(async ({ event, context }: any) => {
  const { id, sender, amount0, amount1, sqrtPriceX96, liquidity, tick, fee } = event.params;
  
  // Get pool
  const pool = await context.Pool.get(id);
  if (!pool) {
    return;
  }
  
  // Update pool state
  const updatedPool = {
    ...pool,
    sqrtPriceX96: sqrtPriceX96,
    liquidity: liquidity,
    tick: Number(tick),
    volumeToken0: pool.volumeToken0.plus(amount0 < 0 ? -amount0 : amount0),
    volumeToken1: pool.volumeToken1.plus(amount1 < 0 ? -amount1 : amount1),
    txCount: pool.txCount + BigInt(1),
  };
  context.Pool.set(updatedPool);
  
  // Create transaction record
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction: Transaction = {
    id: txId,
    pool_id: id,
    txType: "swap",
    poolId: id,
    sender: sender,
    amount0: new BigDecimal(amount0.toString()),
    amount1: new BigDecimal(amount1.toString()),
    token0: pool.currency0,
    token1: pool.currency1,
    sqrtPriceX96: sqrtPriceX96,
    liquidity: liquidity,
    tick: Number(tick),
    tickLower: undefined,
    tickUpper: undefined,
    liquidityDelta: undefined,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash || "",
    logIndex: event.logIndex,
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.Transaction.set(transaction);
  
  // Update protocol stats
  const stats = await getOrCreateProtocolStats(
    context,
    BigInt(event.block.timestamp),
    BigInt(event.block.number)
  );
  
  const updatedStats = {
    ...stats,
    totalSwaps: stats.totalSwaps + BigInt(1),
    swaps24h: stats.swaps24h + BigInt(1),
    totalTransactions: stats.totalTransactions + BigInt(1),
    transactions24h: stats.transactions24h + BigInt(1),
  };
  
  // Track volume by token
  const token0Symbol = getTokenSymbol(pool.currency0);
  const token1Symbol = getTokenSymbol(pool.currency1);
  
  if (token0Symbol === "ETH") {
    const volumeETH = new BigDecimal((amount0 < 0 ? -amount0 : amount0).toString());
    updatedStats.volumeTotalETH = updatedStats.volumeTotalETH.plus(volumeETH);
    updatedStats.volume24hETH = updatedStats.volume24hETH.plus(volumeETH);
  } else if (token1Symbol === "ETH") {
    const volumeETH = new BigDecimal((amount1 < 0 ? -amount1 : amount1).toString());
    updatedStats.volumeTotalETH = updatedStats.volumeTotalETH.plus(volumeETH);
    updatedStats.volume24hETH = updatedStats.volume24hETH.plus(volumeETH);
  }
  
  if (token0Symbol === "USDC") {
    const volumeUSDC = new BigDecimal((amount0 < 0 ? -amount0 : amount0).toString());
    updatedStats.volumeTotalUSDC = updatedStats.volumeTotalUSDC.plus(volumeUSDC);
    updatedStats.volume24hUSDC = updatedStats.volume24hUSDC.plus(volumeUSDC);
  } else if (token1Symbol === "USDC") {
    const volumeUSDC = new BigDecimal((amount1 < 0 ? -amount1 : amount1).toString());
    updatedStats.volumeTotalUSDC = updatedStats.volumeTotalUSDC.plus(volumeUSDC);
    updatedStats.volume24hUSDC = updatedStats.volume24hUSDC.plus(volumeUSDC);
  }
  
  context.ProtocolStats.set(updatedStats);
  
  // Update whale tracking
  const isWhale0 = isWhaleTransaction(pool.currency0, amount0);
  const isWhale1 = isWhaleTransaction(pool.currency1, amount1);
  
  if (isWhale0 || isWhale1) {
    let whale = await context.WhaleActivity.get(sender);
    
    if (!whale) {
      whale = {
        id: sender,
        wallet: sender,
        volumeETH: new BigDecimal(0),
        volumeUSDC: new BigDecimal(0),
        volumeWBTC: new BigDecimal(0),
        transactionCount: 0,
        swapCount: 0,
        liquidityModCount: 0,
        poolsUsed: [id],
        poolCount: 1,
        largestSwapETH: new BigDecimal(0),
        largestSwapUSDC: new BigDecimal(0),
        firstSeenTime: BigInt(event.block.timestamp),
        lastActiveTime: BigInt(event.block.timestamp),
      };
    }
    
    const updatedWhale = {
      ...whale,
      poolsUsed: whale.poolsUsed.includes(id) ? whale.poolsUsed : [...whale.poolsUsed, id],
      poolCount: whale.poolsUsed.includes(id) ? whale.poolCount : whale.poolCount + 1,
      lastActiveTime: BigInt(event.block.timestamp),
      transactionCount: whale.transactionCount + 1,
      swapCount: whale.swapCount + 1,
    };
    
    // Track volume by token
    if (token0Symbol === "ETH") {
      const volETH = new BigDecimal((amount0 < 0 ? -amount0 : amount0).toString());
      updatedWhale.volumeETH = updatedWhale.volumeETH.plus(volETH);
      if (volETH.isGreaterThan(updatedWhale.largestSwapETH)) {
        updatedWhale.largestSwapETH = volETH;
      }
    } else if (token1Symbol === "ETH") {
      const volETH = new BigDecimal((amount1 < 0 ? -amount1 : amount1).toString());
      updatedWhale.volumeETH = updatedWhale.volumeETH.plus(volETH);
      if (volETH.isGreaterThan(updatedWhale.largestSwapETH)) {
        updatedWhale.largestSwapETH = volETH;
      }
    }
    
    if (token0Symbol === "USDC") {
      const volUSDC = new BigDecimal((amount0 < 0 ? -amount0 : amount0).toString());
      updatedWhale.volumeUSDC = updatedWhale.volumeUSDC.plus(volUSDC);
      if (volUSDC.isGreaterThan(updatedWhale.largestSwapUSDC)) {
        updatedWhale.largestSwapUSDC = volUSDC;
      }
    } else if (token1Symbol === "USDC") {
      const volUSDC = new BigDecimal((amount1 < 0 ? -amount1 : amount1).toString());
      updatedWhale.volumeUSDC = updatedWhale.volumeUSDC.plus(volUSDC);
      if (volUSDC.isGreaterThan(updatedWhale.largestSwapUSDC)) {
        updatedWhale.largestSwapUSDC = volUSDC;
      }
    }
    
    context.WhaleActivity.set(updatedWhale);
  }
  
  // Create hourly snapshot
  await createHourlySnapshot(context, BigInt(event.block.timestamp), updatedStats);
  
  // Update metrics
  await updateProtocolMetrics(
    context,
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    BigInt(event.transaction.gasPrice || 0)
  );
});

/**
 * Handle liquidity modifications (add/remove)
 */
PoolManager.ModifyLiquidity.handler(async ({ event, context }: any) => {
  const { id, sender, tickLower, tickUpper, liquidityDelta, salt } = event.params;
  
  // Get pool
  const pool = await context.Pool.get(id);
  if (!pool) {
    return;
  }
  
  // Determine if adding or removing liquidity
  const isAddingLiquidity = liquidityDelta > 0;
  const txType = isAddingLiquidity ? "add_liquidity" : "remove_liquidity";
  
  // Create transaction record
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction: Transaction = {
    id: txId,
    pool_id: id,
    txType: txType,
    poolId: id,
    sender: sender,
    amount0: new BigDecimal(0), // Not provided in V4 ModifyLiquidity event
    amount1: new BigDecimal(0),
    token0: pool.currency0,
    token1: pool.currency1,
    sqrtPriceX96: undefined,
    liquidity: undefined,
    tick: undefined,
    tickLower: Number(tickLower),
    tickUpper: Number(tickUpper),
    liquidityDelta: new BigDecimal(liquidityDelta.toString()),
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash || "",
    logIndex: event.logIndex,
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.Transaction.set(transaction);
  
  // Update protocol stats
  const stats = await getOrCreateProtocolStats(
    context,
    BigInt(event.block.timestamp),
    BigInt(event.block.number)
  );
  
  const updatedStats = {
    ...stats,
    totalLiquidityModifications: stats.totalLiquidityModifications + BigInt(1),
    totalTransactions: stats.totalTransactions + BigInt(1),
    transactions24h: stats.transactions24h + BigInt(1),
  };
  
  context.ProtocolStats.set(updatedStats);
  
  // Update whale tracking for large liquidity changes
  let whale = await context.WhaleActivity.get(sender);
  
  if (!whale) {
    whale = {
      id: sender,
      wallet: sender,
      volumeETH: new BigDecimal(0),
      volumeUSDC: new BigDecimal(0),
      volumeWBTC: new BigDecimal(0),
      transactionCount: 0,
      swapCount: 0,
      liquidityModCount: 0,
      poolsUsed: [id],
      poolCount: 1,
      largestSwapETH: new BigDecimal(0),
      largestSwapUSDC: new BigDecimal(0),
      firstSeenTime: BigInt(event.block.timestamp),
      lastActiveTime: BigInt(event.block.timestamp),
    };
  }
  
  const updatedWhale = {
    ...whale,
    poolsUsed: whale.poolsUsed.includes(id) ? whale.poolsUsed : [...whale.poolsUsed, id],
    poolCount: whale.poolsUsed.includes(id) ? whale.poolCount : whale.poolCount + 1,
    lastActiveTime: BigInt(event.block.timestamp),
    transactionCount: whale.transactionCount + 1,
    liquidityModCount: whale.liquidityModCount + 1,
  };
  
  context.WhaleActivity.set(updatedWhale);
  
  // Check for capital flows (liquidity rebalancing between pools)
  // Note: Transaction entity doesn't have indexed poolId field according to the types
  // This feature would need schema changes to work properly
  // Commenting out to fix compilation errors
  
  /*
  if (isAddingLiquidity) {
    const recentTxs = await context.Transaction.getWhere.poolId.eq(sender).limit(10);
    
    for (const prevTx of recentTxs) {
      if (
        prevTx.txType === "remove_liquidity" &&
        prevTx.poolId !== id &&
        prevTx.timestamp >= BigInt(event.block.timestamp) - BigInt(CAPITAL_FLOW_WINDOW)
      ) {
        const timeDelta = Number(BigInt(event.block.timestamp) - prevTx.timestamp);
        
        const flowId = `${prevTx.transactionHash}-${event.transaction.transactionHash}`;
        const flow: CapitalFlow = {
          id: flowId,
          wallet: sender,
          fromPoolId: prevTx.poolId,
          toPoolId: id,
          tokenAddress: pool.currency0,
          tokenSymbol: getTokenSymbol(pool.currency0),
          amount: new BigDecimal(liquidityDelta.toString()),
          timestamp: BigInt(event.block.timestamp),
          timeDelta: timeDelta,
          flowType: timeDelta < 60 ? "fast_move" : "rebalancing",
          withdrawTxHash: prevTx.transactionHash,
          depositTxHash: event.transaction.transactionHash || "",
        };
        
        context.CapitalFlow.set(flow);
        break;
      }
    }
  }
  */
  
  // Update metrics
  await updateProtocolMetrics(
    context,
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    BigInt(event.transaction.gasPrice || 0)
  );
});

// ============ AAVE HELPERS ============

async function getOrCreateAaveProtocolStats(
  timestamp: bigint,
  blockNumber: bigint,
  context: any
): Promise<any> {
  let stats = await context.AaveProtocolStats.get(PROTOCOL_AAVE);
  
  if (!stats) {
    stats = {
      id: PROTOCOL_AAVE,
      name: "Aave V3",
      totalSuppliedETH: new BigDecimal(0),
      totalSuppliedUSDC: new BigDecimal(0),
      totalSuppliedDAI: new BigDecimal(0),
      totalSuppliedWBTC: new BigDecimal(0),
      totalBorrowedETH: new BigDecimal(0),
      totalBorrowedUSDC: new BigDecimal(0),
      totalBorrowedDAI: new BigDecimal(0),
      totalBorrowedWBTC: new BigDecimal(0),
      globalUtilizationRate: 0,
      totalSupplies: BigInt(0),
      supplies24h: BigInt(0),
      totalWithdrawals: BigInt(0),
      withdrawals24h: BigInt(0),
      totalBorrows: BigInt(0),
      borrows24h: BigInt(0),
      totalRepays: BigInt(0),
      repays24h: BigInt(0),
      totalLiquidations: BigInt(0),
      liquidations24h: BigInt(0),
      uniqueSuppliers: BigInt(0),
      uniqueBorrowers: BigInt(0),
      uniqueUsers24h: BigInt(0),
      avgGasPrice: BigInt(0),
      tps: 0,
      healthScore: 100,
      lastUpdateTime: timestamp,
      lastBlockNumber: blockNumber,
    };
  }
  
  return stats;
}

async function getOrCreateAaveReserve(reserve: string, context: any): Promise<any> {
  let reserveEntity = await context.AaveReserve.get(reserve);
  
  if (!reserveEntity) {
    const symbol = getTokenSymbol(reserve);
    const decimals = getTokenDecimals(reserve);
    
    reserveEntity = {
      id: reserve,
      symbol: symbol,
      name: symbol,
      decimals: decimals,
      totalSupplied: new BigDecimal(0),
      totalBorrowed: new BigDecimal(0),
      liquidityRate: BigInt(0),
      stableBorrowRate: BigInt(0),
      variableBorrowRate: BigInt(0),
      liquidityIndex: BigInt(0),
      variableBorrowIndex: BigInt(0),
      utilizationRate: 0,
      supplyCount: BigInt(0),
      borrowCount: BigInt(0),
      liquidationCount: BigInt(0),
      lastUpdateTimestamp: BigInt(0),
      lastUpdateBlockNumber: BigInt(0),
    };
  }
  
  return reserveEntity;
}

function calculateUtilization(totalSupplied: any, totalBorrowed: any): number {
  // Convert to BigDecimal in case they come from DB as plain values
  const supplied = new BigDecimal(totalSupplied.toString());
  const borrowed = new BigDecimal(totalBorrowed.toString());
  
  if (supplied.isEqualTo(0)) return 0;
  return borrowed.dividedBy(supplied).toNumber();
}

async function detectCrossProtocolFlow(
  currentTx: any,
  wallet: string,
  protocol: string,
  timestamp: bigint,
  context: any
): Promise<void> {
  // Simplified: Skip cross-protocol flow detection for now
  // The query API doesn't support .limit() after .eq()
  // and we can't efficiently query recent transactions by user
  // This feature would require a different indexing approach
  
  // TODO: Implement cross-protocol flow detection when:
  // 1. Query API supports more complex filtering
  // 2. Or maintain a separate in-memory cache of recent transactions
  // 3. Or use a different data structure for efficient time-based queries
  
  return;
}

async function updateMultiProtocolWhale(
  wallet: string,
  protocol: string,
  tokenAddress: string,
  amount: bigint,
  txType: string,
  timestamp: bigint,
  context: any
): Promise<void> {
  if (!isWhaleTransaction(tokenAddress, amount)) return;
  
  let whale = await context.MultiProtocolWhale.get(wallet);
  
  const tokenSymbol = getTokenSymbol(tokenAddress);
  const absAmount = amount < 0 ? -amount : amount;
  const absAmountDecimal = new BigDecimal(absAmount.toString());
  
  if (!whale) {
    whale = {
      id: wallet,
      wallet: wallet,
      uniswapVolumeETH: new BigDecimal(0),
      uniswapVolumeUSDC: new BigDecimal(0),
      uniswapSwapCount: 0,
      aaveSuppliedETH: new BigDecimal(0),
      aaveSuppliedUSDC: new BigDecimal(0),
      aaveBorrowedETH: new BigDecimal(0),
      aaveBorrowedUSDC: new BigDecimal(0),
      aaveSupplyCount: 0,
      aaveBorrowCount: 0,
      protocolsUsed: [protocol],
      crossProtocolFlows: 0,
      totalTransactionCount: 1,
      largestTransactionETH: tokenSymbol === "ETH" ? absAmountDecimal : new BigDecimal(0),
      firstSeenTime: timestamp,
      lastActiveTime: timestamp,
    };
    
    // Set initial amounts based on protocol and token
    if (protocol === PROTOCOL_AAVE) {
      if (txType === "supply") {
        whale.aaveSupplyCount = 1;
        if (tokenSymbol === "ETH") whale.aaveSuppliedETH = absAmountDecimal;
        else if (tokenSymbol === "USDC") whale.aaveSuppliedUSDC = absAmountDecimal;
      } else if (txType === "borrow") {
        whale.aaveBorrowCount = 1;
        if (tokenSymbol === "ETH") whale.aaveBorrowedETH = absAmountDecimal;
        else if (tokenSymbol === "USDC") whale.aaveBorrowedUSDC = absAmountDecimal;
      }
    } else if (protocol === PROTOCOL_UNISWAP) {
      whale.uniswapSwapCount = 1;
      if (tokenSymbol === "ETH") whale.uniswapVolumeETH = absAmountDecimal;
      else if (tokenSymbol === "USDC") whale.uniswapVolumeUSDC = absAmountDecimal;
    }
  } else {
    // Convert DB BigDecimal fields to BigDecimal instances
    const whaleUniswapVolumeETH = new BigDecimal(whale.uniswapVolumeETH.toString());
    const whaleUniswapVolumeUSDC = new BigDecimal(whale.uniswapVolumeUSDC.toString());
    const whaleAaveSuppliedETH = new BigDecimal(whale.aaveSuppliedETH.toString());
    const whaleAaveSuppliedUSDC = new BigDecimal(whale.aaveSuppliedUSDC.toString());
    const whaleAaveBorrowedETH = new BigDecimal(whale.aaveBorrowedETH.toString());
    const whaleAaveBorrowedUSDC = new BigDecimal(whale.aaveBorrowedUSDC.toString());
    const whaleLargestTransactionETH = new BigDecimal(whale.largestTransactionETH.toString());
    
    // Update existing whale with immutable pattern
    const updatedProtocolsUsed = whale.protocolsUsed.includes(protocol) 
      ? whale.protocolsUsed 
      : [...whale.protocolsUsed, protocol];
    
    const updatedWhale: any = {
      ...whale,
      protocolsUsed: updatedProtocolsUsed,
      lastActiveTime: timestamp,
      totalTransactionCount: whale.totalTransactionCount + 1,
      uniswapVolumeETH: whaleUniswapVolumeETH,
      uniswapVolumeUSDC: whaleUniswapVolumeUSDC,
      aaveSuppliedETH: whaleAaveSuppliedETH,
      aaveSuppliedUSDC: whaleAaveSuppliedUSDC,
      aaveBorrowedETH: whaleAaveBorrowedETH,
      aaveBorrowedUSDC: whaleAaveBorrowedUSDC,
      largestTransactionETH: whaleLargestTransactionETH,
    };
    
    if (protocol === PROTOCOL_AAVE) {
      if (txType === "supply") {
        updatedWhale.aaveSupplyCount = whale.aaveSupplyCount + 1;
        if (tokenSymbol === "ETH") {
          updatedWhale.aaveSuppliedETH = whaleAaveSuppliedETH.plus(absAmountDecimal);
        } else if (tokenSymbol === "USDC") {
          updatedWhale.aaveSuppliedUSDC = whaleAaveSuppliedUSDC.plus(absAmountDecimal);
        }
      } else if (txType === "borrow") {
        updatedWhale.aaveBorrowCount = whale.aaveBorrowCount + 1;
        if (tokenSymbol === "ETH") {
          updatedWhale.aaveBorrowedETH = whaleAaveBorrowedETH.plus(absAmountDecimal);
        } else if (tokenSymbol === "USDC") {
          updatedWhale.aaveBorrowedUSDC = whaleAaveBorrowedUSDC.plus(absAmountDecimal);
        }
      }
    } else if (protocol === PROTOCOL_UNISWAP) {
      updatedWhale.uniswapSwapCount = whale.uniswapSwapCount + 1;
      if (tokenSymbol === "ETH") {
        updatedWhale.uniswapVolumeETH = whaleUniswapVolumeETH.plus(absAmountDecimal);
        if (absAmountDecimal.isGreaterThan(whaleLargestTransactionETH)) {
          updatedWhale.largestTransactionETH = absAmountDecimal;
        }
      } else if (tokenSymbol === "USDC") {
        updatedWhale.uniswapVolumeUSDC = whaleUniswapVolumeUSDC.plus(absAmountDecimal);
      }
    }
    
    whale = updatedWhale;
  }
  
  context.MultiProtocolWhale.set(whale);
}

async function calculateAaveHealthScore(
  stats: any,
  timestamp: bigint,
  context: any
): Promise<number> {
  let score = 100;
  const warnings: string[] = [];
  
  // High global utilization
  if (stats.globalUtilizationRate > 0.85) {
    warnings.push(`High utilization: ${(stats.globalUtilizationRate * 100).toFixed(1)}%`);
    score -= 20;
  }
  
  // Use stats counters instead of querying transactions
  // Recent liquidations based on 24h counter
  if (stats.liquidations24h >= BigInt(10)) {
    warnings.push(`${stats.liquidations24h} liquidations in last 24h`);
    score -= 30;
  }
  
  // Check utilization as proxy for whale exits
  // (since we can't efficiently query recent transactions)
  if (stats.withdrawals24h > stats.supplies24h * BigInt(2)) {
    warnings.push(`High withdrawal activity: ${stats.withdrawals24h} withdrawals vs ${stats.supplies24h} supplies`);
    score -= 25;
  }
  
  // Save health snapshot
  const snapshot = {
    id: `${PROTOCOL_AAVE}-${timestamp}`,
    protocol: PROTOCOL_AAVE,
    timestamp: timestamp,
    healthScore: Math.max(0, score),
    utilizationRate: stats.globalUtilizationRate,
    tvlChangePercent24h: 0, // Calculate from snapshots
    whaleExits1h: 0, // Would need efficient time-based queries
    gasSpike: 1.0,
    liquidationCount1h: Number(stats.liquidations24h),
    warnings: JSON.stringify(warnings),
  };
  
  context.ProtocolHealthSnapshot.set(snapshot);
  
  return Math.max(0, score);
}

// ============ AAVE EVENT HANDLERS ============

/**
 * Handle Supply events
 */
AaveV3Pool.Supply.handler(async ({ event, context }: any) => {
  const { reserve, user, onBehalfOf, amount, referralCode } = event.params;
  
  // Get or create reserve
  const reserveEntity = await getOrCreateAaveReserve(reserve, context);
  const amountDecimal = new BigDecimal(amount.toString());
  const reserveTotalSupplied = new BigDecimal(reserveEntity.totalSupplied.toString());
  const reserveTotalBorrowed = new BigDecimal(reserveEntity.totalBorrowed.toString());
  const newTotalSupplied = reserveTotalSupplied.plus(amountDecimal);
  
  const updatedReserve = {
    ...reserveEntity,
    totalSupplied: newTotalSupplied,
    supplyCount: reserveEntity.supplyCount + BigInt(1),
    utilizationRate: calculateUtilization(
      newTotalSupplied,
      reserveTotalBorrowed
    ),
    lastUpdateTimestamp: BigInt(event.block.timestamp),
    lastUpdateBlockNumber: BigInt(event.block.number),
  };
  context.AaveReserve.set(updatedReserve);
  
  // Create transaction record
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction = {
    id: txId,
    txType: "supply",
    user: user,
    onBehalfOf: onBehalfOf,
    reserve: reserve,
    reserveSymbol: getTokenSymbol(reserve),
    amount: amount,
    collateralAsset: undefined,
    debtAsset: undefined,
    liquidator: undefined,
    debtToCover: undefined,
    liquidatedCollateralAmount: undefined,
    interestRateMode: undefined,
    borrowRate: undefined,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.AaveTransaction.set(transaction);
  
  // Update protocol stats
  const stats = await getOrCreateAaveProtocolStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  const tokenSymbol = getTokenSymbol(reserve);
  const amountBigDecimal = new BigDecimal(amount.toString());
  
  // Convert DB BigDecimal fields to BigDecimal instances
  const statsTotalSuppliedETH = new BigDecimal(stats.totalSuppliedETH.toString());
  const statsTotalSuppliedUSDC = new BigDecimal(stats.totalSuppliedUSDC.toString());
  const statsTotalSuppliedDAI = new BigDecimal(stats.totalSuppliedDAI.toString());
  const statsTotalSuppliedWBTC = new BigDecimal(stats.totalSuppliedWBTC.toString());
  const statsTotalBorrowedETH = new BigDecimal(stats.totalBorrowedETH.toString());
  const statsTotalBorrowedUSDC = new BigDecimal(stats.totalBorrowedUSDC.toString());
  
  const updatedStats = {
    ...stats,
    totalSupplies: stats.totalSupplies + BigInt(1),
    supplies24h: stats.supplies24h + BigInt(1),
    totalSuppliedETH: tokenSymbol === "ETH" ? statsTotalSuppliedETH.plus(amountBigDecimal) : statsTotalSuppliedETH,
    totalSuppliedUSDC: tokenSymbol === "USDC" ? statsTotalSuppliedUSDC.plus(amountBigDecimal) : statsTotalSuppliedUSDC,
    totalSuppliedDAI: tokenSymbol === "DAI" ? statsTotalSuppliedDAI.plus(amountBigDecimal) : statsTotalSuppliedDAI,
    totalSuppliedWBTC: tokenSymbol === "WBTC" ? statsTotalSuppliedWBTC.plus(amountBigDecimal) : statsTotalSuppliedWBTC,
  };
  
  // Calculate global utilization - convert to BigDecimal for arithmetic
  const updatedTotalSuppliedETH = new BigDecimal(updatedStats.totalSuppliedETH.toString());
  const updatedTotalSuppliedUSDC = new BigDecimal(updatedStats.totalSuppliedUSDC.toString());
  const updatedTotalBorrowedETH = new BigDecimal(updatedStats.totalBorrowedETH.toString());
  const updatedTotalBorrowedUSDC = new BigDecimal(updatedStats.totalBorrowedUSDC.toString());
  
  const totalSupplied = updatedTotalSuppliedETH.plus(updatedTotalSuppliedUSDC);
  const totalBorrowed = updatedTotalBorrowedETH.plus(updatedTotalBorrowedUSDC);
  
  const finalStats = {
    ...updatedStats,
    globalUtilizationRate: calculateUtilization(totalSupplied, totalBorrowed),
    healthScore: await calculateAaveHealthScore(
      updatedStats,
      BigInt(event.block.timestamp),
      context
    ),
    lastUpdateTime: BigInt(event.block.timestamp),
    lastBlockNumber: BigInt(event.block.number),
  };
  
  context.AaveProtocolStats.set(finalStats);
  
  // Update user position
  const positionId = `${user}-${reserve}`;
  let position = await context.AaveUserPosition.get(positionId);
  
  if (!position) {
    position = {
      id: positionId,
      user: user,
      reserve: reserve,
      reserveSymbol: tokenSymbol,
      suppliedAmount: amountBigDecimal,
      borrowedAmount: new BigDecimal(0),
      supplyCount: 1,
      withdrawCount: 0,
      borrowCount: 0,
      repayCount: 0,
      firstSupplyTime: BigInt(event.block.timestamp),
      lastActivityTime: BigInt(event.block.timestamp),
    };
  } else {
    const positionSuppliedAmount = new BigDecimal(position.suppliedAmount.toString());
    position = {
      ...position,
      suppliedAmount: positionSuppliedAmount.plus(amountBigDecimal),
      supplyCount: position.supplyCount + 1,
      lastActivityTime: BigInt(event.block.timestamp),
    };
  }
  context.AaveUserPosition.set(position);
  
  // Whale tracking
  await updateMultiProtocolWhale(
    user,
    PROTOCOL_AAVE,
    reserve,
    amount,
    "supply",
    BigInt(event.block.timestamp),
    context
  );
  
  // Cross-protocol flow detection
  await detectCrossProtocolFlow(
    transaction,
    user,
    PROTOCOL_AAVE,
    BigInt(event.block.timestamp),
    context
  );
});

/**
 * Handle Withdraw events
 */
AaveV3Pool.Withdraw.handler(async ({ event, context }: any) => {
  const { reserve, user, to, amount } = event.params;
  
  // Update reserve
  const reserveEntity = await getOrCreateAaveReserve(reserve, context);
  const amountDecimal = new BigDecimal(amount.toString());
  const reserveTotalSupplied = new BigDecimal(reserveEntity.totalSupplied.toString());
  const reserveTotalBorrowed = new BigDecimal(reserveEntity.totalBorrowed.toString());
  const newTotalSupplied = reserveTotalSupplied.minus(amountDecimal);
  
  const updatedReserve = {
    ...reserveEntity,
    totalSupplied: newTotalSupplied,
    utilizationRate: calculateUtilization(
      newTotalSupplied,
      reserveTotalBorrowed
    ),
    lastUpdateTimestamp: BigInt(event.block.timestamp),
  };
  context.AaveReserve.set(updatedReserve);
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction = {
    id: txId,
    txType: "withdraw",
    user: user,
    onBehalfOf: to,
    reserve: reserve,
    reserveSymbol: getTokenSymbol(reserve),
    amount: amount,
    collateralAsset: undefined,
    debtAsset: undefined,
    liquidator: undefined,
    debtToCover: undefined,
    liquidatedCollateralAmount: undefined,
    interestRateMode: undefined,
    borrowRate: undefined,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.AaveTransaction.set(transaction);
  
  // Update protocol stats
  const stats = await getOrCreateAaveProtocolStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  const tokenSymbol = getTokenSymbol(reserve);
  const amountBigDecimal = new BigDecimal(amount.toString());
  
  // Convert DB BigDecimal fields to BigDecimal instances
  const statsTotalSuppliedETH = new BigDecimal(stats.totalSuppliedETH.toString());
  const statsTotalSuppliedUSDC = new BigDecimal(stats.totalSuppliedUSDC.toString());
  const statsTotalSuppliedDAI = new BigDecimal(stats.totalSuppliedDAI.toString());
  const statsTotalSuppliedWBTC = new BigDecimal(stats.totalSuppliedWBTC.toString());
  const statsTotalBorrowedETH = new BigDecimal(stats.totalBorrowedETH.toString());
  const statsTotalBorrowedUSDC = new BigDecimal(stats.totalBorrowedUSDC.toString());
  
  const updatedStats = {
    ...stats,
    totalWithdrawals: stats.totalWithdrawals + BigInt(1),
    withdrawals24h: stats.withdrawals24h + BigInt(1),
    totalSuppliedETH: tokenSymbol === "ETH" ? statsTotalSuppliedETH.minus(amountBigDecimal) : statsTotalSuppliedETH,
    totalSuppliedUSDC: tokenSymbol === "USDC" ? statsTotalSuppliedUSDC.minus(amountBigDecimal) : statsTotalSuppliedUSDC,
    totalSuppliedDAI: tokenSymbol === "DAI" ? statsTotalSuppliedDAI.minus(amountBigDecimal) : statsTotalSuppliedDAI,
    totalSuppliedWBTC: tokenSymbol === "WBTC" ? statsTotalSuppliedWBTC.minus(amountBigDecimal) : statsTotalSuppliedWBTC,
  };
  
  // Convert to BigDecimal for arithmetic
  const updatedTotalSuppliedETH = new BigDecimal(updatedStats.totalSuppliedETH.toString());
  const updatedTotalSuppliedUSDC = new BigDecimal(updatedStats.totalSuppliedUSDC.toString());
  const updatedTotalBorrowedETH = new BigDecimal(updatedStats.totalBorrowedETH.toString());
  const updatedTotalBorrowedUSDC = new BigDecimal(updatedStats.totalBorrowedUSDC.toString());
  
  const totalSupplied = updatedTotalSuppliedETH.plus(updatedTotalSuppliedUSDC);
  const totalBorrowed = updatedTotalBorrowedETH.plus(updatedTotalBorrowedUSDC);
  
  const finalStats = {
    ...updatedStats,
    globalUtilizationRate: calculateUtilization(totalSupplied, totalBorrowed),
    healthScore: await calculateAaveHealthScore(
      updatedStats,
      BigInt(event.block.timestamp),
      context
    ),
  };
  
  context.AaveProtocolStats.set(finalStats);
  
  // Update user position
  const positionId = `${user}-${reserve}`;
  const position = await context.AaveUserPosition.get(positionId);
  if (position) {
    const positionSuppliedAmount = new BigDecimal(position.suppliedAmount.toString());
    const updatedPosition = {
      ...position,
      suppliedAmount: positionSuppliedAmount.minus(amountBigDecimal),
      withdrawCount: position.withdrawCount + 1,
      lastActivityTime: BigInt(event.block.timestamp),
    };
    context.AaveUserPosition.set(updatedPosition);
  }
  
  // Whale tracking
  await updateMultiProtocolWhale(
    user,
    PROTOCOL_AAVE,
    reserve,
    amount,
    "withdraw",
    BigInt(event.block.timestamp),
    context
  );
});

/**
 * Handle Borrow events
 */
AaveV3Pool.Borrow.handler(async ({ event, context }: any) => {
  const { reserve, user, onBehalfOf, amount, interestRateMode, borrowRate, referralCode } = event.params;
  
  // Update reserve
  const reserveEntity = await getOrCreateAaveReserve(reserve, context);
  const amountBigInt = BigInt(amount);
  const amountDecimal = new BigDecimal(amount.toString());
  const reserveTotalSupplied = new BigDecimal(reserveEntity.totalSupplied.toString());
  const reserveTotalBorrowed = new BigDecimal(reserveEntity.totalBorrowed.toString());
  const newTotalBorrowed = reserveTotalBorrowed.plus(amountDecimal);
  
  const updatedReserve = {
    ...reserveEntity,
    totalBorrowed: newTotalBorrowed,
    borrowCount: reserveEntity.borrowCount + BigInt(1),
    utilizationRate: calculateUtilization(
      reserveTotalSupplied,
      newTotalBorrowed
    ),
  };
  context.AaveReserve.set(updatedReserve);
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction = {
    id: txId,
    txType: "borrow",
    user: user,
    onBehalfOf: onBehalfOf,
    reserve: reserve,
    reserveSymbol: getTokenSymbol(reserve),
    amount: amount,
    collateralAsset: undefined,
    debtAsset: undefined,
    liquidator: undefined,
    debtToCover: undefined,
    liquidatedCollateralAmount: undefined,
    interestRateMode: Number(interestRateMode),
    borrowRate: borrowRate,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.AaveTransaction.set(transaction);
  
  // Update protocol stats
  const stats = await getOrCreateAaveProtocolStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  const tokenSymbol = getTokenSymbol(reserve);
  const amountBigDecimal = new BigDecimal(amount.toString());
  
  // Convert DB BigDecimal fields to BigDecimal instances
  const statsTotalSuppliedETH = new BigDecimal(stats.totalSuppliedETH.toString());
  const statsTotalSuppliedUSDC = new BigDecimal(stats.totalSuppliedUSDC.toString());
  const statsTotalBorrowedETH = new BigDecimal(stats.totalBorrowedETH.toString());
  const statsTotalBorrowedUSDC = new BigDecimal(stats.totalBorrowedUSDC.toString());
  const statsTotalBorrowedDAI = new BigDecimal(stats.totalBorrowedDAI.toString());
  const statsTotalBorrowedWBTC = new BigDecimal(stats.totalBorrowedWBTC.toString());
  
  const updatedStats = {
    ...stats,
    totalBorrows: stats.totalBorrows + BigInt(1),
    borrows24h: stats.borrows24h + BigInt(1),
    totalBorrowedETH: tokenSymbol === "ETH" ? statsTotalBorrowedETH.plus(amountBigDecimal) : statsTotalBorrowedETH,
    totalBorrowedUSDC: tokenSymbol === "USDC" ? statsTotalBorrowedUSDC.plus(amountBigDecimal) : statsTotalBorrowedUSDC,
    totalBorrowedDAI: tokenSymbol === "DAI" ? statsTotalBorrowedDAI.plus(amountBigDecimal) : statsTotalBorrowedDAI,
    totalBorrowedWBTC: tokenSymbol === "WBTC" ? statsTotalBorrowedWBTC.plus(amountBigDecimal) : statsTotalBorrowedWBTC,
  };
  
  // Convert to BigDecimal for arithmetic
  const updatedTotalSuppliedETH = new BigDecimal(updatedStats.totalSuppliedETH.toString());
  const updatedTotalSuppliedUSDC = new BigDecimal(updatedStats.totalSuppliedUSDC.toString());
  const updatedTotalBorrowedETH = new BigDecimal(updatedStats.totalBorrowedETH.toString());
  const updatedTotalBorrowedUSDC = new BigDecimal(updatedStats.totalBorrowedUSDC.toString());
  
  const totalSupplied = updatedTotalSuppliedETH.plus(updatedTotalSuppliedUSDC);
  const totalBorrowed = updatedTotalBorrowedETH.plus(updatedTotalBorrowedUSDC);
  
  const finalStats = {
    ...updatedStats,
    globalUtilizationRate: calculateUtilization(totalSupplied, totalBorrowed),
    healthScore: await calculateAaveHealthScore(
      updatedStats,
      BigInt(event.block.timestamp),
      context
    ),
  };
  
  context.AaveProtocolStats.set(finalStats);
  
  // Update user position
  const positionId = `${user}-${reserve}`;
  let position = await context.AaveUserPosition.get(positionId);
  if (!position) {
    position = {
      id: positionId,
      user: user,
      reserve: reserve,
      reserveSymbol: tokenSymbol,
      suppliedAmount: new BigDecimal(0),
      borrowedAmount: amountBigDecimal,
      supplyCount: 0,
      withdrawCount: 0,
      borrowCount: 1,
      repayCount: 0,
      firstSupplyTime: undefined,
      lastActivityTime: BigInt(event.block.timestamp),
    };
  } else {
    const positionBorrowedAmount = new BigDecimal(position.borrowedAmount.toString());
    position = {
      ...position,
      borrowedAmount: positionBorrowedAmount.plus(amountBigDecimal),
      borrowCount: position.borrowCount + 1,
      lastActivityTime: BigInt(event.block.timestamp),
    };
  }
  context.AaveUserPosition.set(position);
  
  // Whale tracking
  await updateMultiProtocolWhale(
    user,
    PROTOCOL_AAVE,
    reserve,
    amount,
    "borrow",
    BigInt(event.block.timestamp),
    context
  );
});

/**
 * Handle Repay events
 */
AaveV3Pool.Repay.handler(async ({ event, context }: any) => {
  const { reserve, user, repayer, amount, useATokens } = event.params;
  
  // Update reserve
  const reserveEntity = await getOrCreateAaveReserve(reserve, context);
  const amountDecimal = new BigDecimal(amount.toString());
  const reserveTotalSupplied = new BigDecimal(reserveEntity.totalSupplied.toString());
  const reserveTotalBorrowed = new BigDecimal(reserveEntity.totalBorrowed.toString());
  const newTotalBorrowed = reserveTotalBorrowed.minus(amountDecimal);
  
  const updatedReserve = {
    ...reserveEntity,
    totalBorrowed: newTotalBorrowed,
    utilizationRate: calculateUtilization(
      reserveTotalSupplied,
      newTotalBorrowed
    ),
  };
  context.AaveReserve.set(updatedReserve);
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction = {
    id: txId,
    txType: "repay",
    user: user,
    onBehalfOf: repayer,
    reserve: reserve,
    reserveSymbol: getTokenSymbol(reserve),
    amount: amount,
    collateralAsset: undefined,
    debtAsset: undefined,
    liquidator: undefined,
    debtToCover: undefined,
    liquidatedCollateralAmount: undefined,
    interestRateMode: undefined,
    borrowRate: undefined,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.AaveTransaction.set(transaction);
  
  // Update protocol stats
  const stats = await getOrCreateAaveProtocolStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  const tokenSymbol = getTokenSymbol(reserve);
  const amountBigDecimal = new BigDecimal(amount.toString());
  
  // Convert DB BigDecimal fields to BigDecimal instances
  const statsTotalSuppliedETH = new BigDecimal(stats.totalSuppliedETH.toString());
  const statsTotalSuppliedUSDC = new BigDecimal(stats.totalSuppliedUSDC.toString());
  const statsTotalBorrowedETH = new BigDecimal(stats.totalBorrowedETH.toString());
  const statsTotalBorrowedUSDC = new BigDecimal(stats.totalBorrowedUSDC.toString());
  const statsTotalBorrowedDAI = new BigDecimal(stats.totalBorrowedDAI.toString());
  const statsTotalBorrowedWBTC = new BigDecimal(stats.totalBorrowedWBTC.toString());
  
  const updatedStats = {
    ...stats,
    totalRepays: stats.totalRepays + BigInt(1),
    repays24h: stats.repays24h + BigInt(1),
    totalBorrowedETH: tokenSymbol === "ETH" ? statsTotalBorrowedETH.minus(amountBigDecimal) : statsTotalBorrowedETH,
    totalBorrowedUSDC: tokenSymbol === "USDC" ? statsTotalBorrowedUSDC.minus(amountBigDecimal) : statsTotalBorrowedUSDC,
    totalBorrowedDAI: tokenSymbol === "DAI" ? statsTotalBorrowedDAI.minus(amountBigDecimal) : statsTotalBorrowedDAI,
    totalBorrowedWBTC: tokenSymbol === "WBTC" ? statsTotalBorrowedWBTC.minus(amountBigDecimal) : statsTotalBorrowedWBTC,
  };
  
  // Convert to BigDecimal for arithmetic
  const updatedTotalSuppliedETH = new BigDecimal(updatedStats.totalSuppliedETH.toString());
  const updatedTotalSuppliedUSDC = new BigDecimal(updatedStats.totalSuppliedUSDC.toString());
  const updatedTotalBorrowedETH = new BigDecimal(updatedStats.totalBorrowedETH.toString());
  const updatedTotalBorrowedUSDC = new BigDecimal(updatedStats.totalBorrowedUSDC.toString());
  
  const totalSupplied = updatedTotalSuppliedETH.plus(updatedTotalSuppliedUSDC);
  const totalBorrowed = updatedTotalBorrowedETH.plus(updatedTotalBorrowedUSDC);
  
  const finalStats = {
    ...updatedStats,
    globalUtilizationRate: calculateUtilization(totalSupplied, totalBorrowed),
  };
  
  context.AaveProtocolStats.set(finalStats);
  
  // Update user position
  const positionId = `${user}-${reserve}`;
  const position = await context.AaveUserPosition.get(positionId);
  if (position) {
    const positionBorrowedAmount = new BigDecimal(position.borrowedAmount.toString());
    const updatedPosition = {
      ...position,
      borrowedAmount: positionBorrowedAmount.minus(amountBigDecimal),
      repayCount: position.repayCount + 1,
      lastActivityTime: BigInt(event.block.timestamp),
    };
    context.AaveUserPosition.set(updatedPosition);
  }
});

/**
 * Handle Liquidation events
 */
AaveV3Pool.LiquidationCall.handler(async ({ event, context }: any) => {
  const { 
    collateralAsset, 
    debtAsset, 
    user, 
    debtToCover, 
    liquidatedCollateralAmount, 
    liquidator, 
    receiveAToken 
  } = event.params;
  
  // Update reserves
  const debtReserve = await getOrCreateAaveReserve(debtAsset, context);
  const debtTotalBorrowed = new BigDecimal(debtReserve.totalBorrowed.toString());
  const updatedDebtReserve = {
    ...debtReserve,
    totalBorrowed: debtTotalBorrowed.minus(new BigDecimal(debtToCover.toString())),
    liquidationCount: debtReserve.liquidationCount + BigInt(1),
  };
  context.AaveReserve.set(updatedDebtReserve);
  
  const collateralReserve = await getOrCreateAaveReserve(collateralAsset, context);
  const collateralTotalSupplied = new BigDecimal(collateralReserve.totalSupplied.toString());
  const updatedCollateralReserve = {
    ...collateralReserve,
    totalSupplied: collateralTotalSupplied.minus(new BigDecimal(liquidatedCollateralAmount.toString())),
    liquidationCount: collateralReserve.liquidationCount + BigInt(1),
  };
  context.AaveReserve.set(updatedCollateralReserve);
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction = {
    id: txId,
    txType: "liquidation",
    user: user,
    onBehalfOf: undefined,
    reserve: debtAsset,
    reserveSymbol: getTokenSymbol(debtAsset),
    amount: debtToCover,
    collateralAsset: collateralAsset,
    debtAsset: debtAsset,
    liquidator: liquidator,
    debtToCover: debtToCover,
    liquidatedCollateralAmount: liquidatedCollateralAmount,
    interestRateMode: undefined,
    borrowRate: undefined,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.AaveTransaction.set(transaction);
  
  // Update protocol stats
  const stats = await getOrCreateAaveProtocolStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  const updatedStats = {
    ...stats,
    totalLiquidations: stats.totalLiquidations + BigInt(1),
    liquidations24h: stats.liquidations24h + BigInt(1),
    // Liquidations are health warning - reduce health score
    healthScore: Math.max(0, stats.healthScore - 5),
  };
  
  context.AaveProtocolStats.set(updatedStats);
});

/**
 * Handle ReserveDataUpdated - Updates interest rates
 */
AaveV3Pool.ReserveDataUpdated.handler(async ({ event, context }: any) => {
  const { 
    reserve, 
    liquidityRate, 
    stableBorrowRate, 
    variableBorrowRate, 
    liquidityIndex, 
    variableBorrowIndex 
  } = event.params;
  
  const reserveEntity = await getOrCreateAaveReserve(reserve, context);
  const updatedReserve = {
    ...reserveEntity,
    liquidityRate: liquidityRate,
    stableBorrowRate: stableBorrowRate,
    variableBorrowRate: variableBorrowRate,
    liquidityIndex: liquidityIndex,
    variableBorrowIndex: variableBorrowIndex,
    lastUpdateTimestamp: BigInt(event.block.timestamp),
  };
  
  context.AaveReserve.set(updatedReserve);
});