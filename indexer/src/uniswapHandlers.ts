import {
  PoolManager,
  Pool,
  Token,
  Transaction,
  ProtocolStats,
  HourlySnapshot,
  WhaleActivity,
  BigDecimal,
} from "../generated";

import {
  PROTOCOL_UNISWAP,
  HOUR_IN_SECONDS,
  getTokenSymbol,
  getTokenDecimals,
  isWhaleTransaction,
} from "./common";

// ============ HELPER FUNCTIONS ============

async function getOrCreateProtocolStats(
  context: any,
  timestamp: bigint,
  blockNumber: bigint
): Promise<ProtocolStats> {
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

async function createHourlySnapshot(
  context: any,
  timestamp: bigint,
  stats: ProtocolStats
): Promise<void> {
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
    volumeToken0: pool.volumeToken0.plus(new BigDecimal((amount0 < 0 ? -amount0 : amount0).toString())),
    volumeToken1: pool.volumeToken1.plus(new BigDecimal((amount1 < 0 ? -amount1 : amount1).toString())),
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
  
  const statsVolumeTotalETH = new BigDecimal(stats.volumeTotalETH.toString());
  const statsVolume24hETH = new BigDecimal(stats.volume24hETH.toString());
  const statsVolumeTotalUSDC = new BigDecimal(stats.volumeTotalUSDC.toString());
  const statsVolume24hUSDC = new BigDecimal(stats.volume24hUSDC.toString());
  
  let updatedVolumeTotalETH = statsVolumeTotalETH;
  let updatedVolume24hETH = statsVolume24hETH;
  let updatedVolumeTotalUSDC = statsVolumeTotalUSDC;
  let updatedVolume24hUSDC = statsVolume24hUSDC;
  
  // Track volume by token
  const token0Symbol = getTokenSymbol(pool.currency0);
  const token1Symbol = getTokenSymbol(pool.currency1);
  
  if (token0Symbol === "ETH") {
    const volumeETH = new BigDecimal((amount0 < 0 ? -amount0 : amount0).toString());
    updatedVolumeTotalETH = statsVolumeTotalETH.plus(volumeETH);
    updatedVolume24hETH = statsVolume24hETH.plus(volumeETH);
  } else if (token1Symbol === "ETH") {
    const volumeETH = new BigDecimal((amount1 < 0 ? -amount1 : amount1).toString());
    updatedVolumeTotalETH = statsVolumeTotalETH.plus(volumeETH);
    updatedVolume24hETH = statsVolume24hETH.plus(volumeETH);
  }
  
  if (token0Symbol === "USDC") {
    const volumeUSDC = new BigDecimal((amount0 < 0 ? -amount0 : amount0).toString());
    updatedVolumeTotalUSDC = statsVolumeTotalUSDC.plus(volumeUSDC);
    updatedVolume24hUSDC = statsVolume24hUSDC.plus(volumeUSDC);
  } else if (token1Symbol === "USDC") {
    const volumeUSDC = new BigDecimal((amount1 < 0 ? -amount1 : amount1).toString());
    updatedVolumeTotalUSDC = statsVolumeTotalUSDC.plus(volumeUSDC);
    updatedVolume24hUSDC = statsVolume24hUSDC.plus(volumeUSDC);
  }
  
  const updatedStats = {
    ...stats,
    totalSwaps: stats.totalSwaps + BigInt(1),
    swaps24h: stats.swaps24h + BigInt(1),
    totalTransactions: stats.totalTransactions + BigInt(1),
    transactions24h: stats.transactions24h + BigInt(1),
    volumeTotalETH: updatedVolumeTotalETH,
    volume24hETH: updatedVolume24hETH,
    volumeTotalUSDC: updatedVolumeTotalUSDC,
    volume24hUSDC: updatedVolume24hUSDC,
  };
  
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
    
    const whaleVolumeETH = new BigDecimal(whale.volumeETH.toString());
    const whaleVolumeUSDC = new BigDecimal(whale.volumeUSDC.toString());
    const whaleLargestSwapETH = new BigDecimal(whale.largestSwapETH.toString());
    const whaleLargestSwapUSDC = new BigDecimal(whale.largestSwapUSDC.toString());
    
    const updatedWhale: any = {
      ...whale,
      poolsUsed: whale.poolsUsed.includes(id) ? whale.poolsUsed : [...whale.poolsUsed, id],
      poolCount: whale.poolsUsed.includes(id) ? whale.poolCount : whale.poolCount + 1,
      lastActiveTime: BigInt(event.block.timestamp),
      transactionCount: whale.transactionCount + 1,
      swapCount: whale.swapCount + 1,
      volumeETH: whaleVolumeETH,
      volumeUSDC: whaleVolumeUSDC,
      largestSwapETH: whaleLargestSwapETH,
      largestSwapUSDC: whaleLargestSwapUSDC,
    };
    
    // Track volume by token
    if (token0Symbol === "ETH") {
      const volETH = new BigDecimal((amount0 < 0 ? -amount0 : amount0).toString());
      updatedWhale.volumeETH = whaleVolumeETH.plus(volETH);
      if (volETH.isGreaterThan(whaleLargestSwapETH)) {
        updatedWhale.largestSwapETH = volETH;
      }
    } else if (token1Symbol === "ETH") {
      const volETH = new BigDecimal((amount1 < 0 ? -amount1 : amount1).toString());
      updatedWhale.volumeETH = whaleVolumeETH.plus(volETH);
      if (volETH.isGreaterThan(whaleLargestSwapETH)) {
        updatedWhale.largestSwapETH = volETH;
      }
    }
    
    if (token0Symbol === "USDC") {
      const volUSDC = new BigDecimal((amount0 < 0 ? -amount0 : amount0).toString());
      updatedWhale.volumeUSDC = whaleVolumeUSDC.plus(volUSDC);
      if (volUSDC.isGreaterThan(whaleLargestSwapUSDC)) {
        updatedWhale.largestSwapUSDC = volUSDC;
      }
    } else if (token1Symbol === "USDC") {
      const volUSDC = new BigDecimal((amount1 < 0 ? -amount1 : amount1).toString());
      updatedWhale.volumeUSDC = whaleVolumeUSDC.plus(volUSDC);
      if (volUSDC.isGreaterThan(whaleLargestSwapUSDC)) {
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
  
  // Update metrics
  await updateProtocolMetrics(
    context,
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    BigInt(event.transaction.gasPrice || 0)
  );
});
