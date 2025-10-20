import { BigDecimal } from "../generated";
import {
  Curve3Pool,
  CurveStETHPool,
  CurveTricryptoPool,
  CurvePool,
  CurveProtocolStats,
  CurveTransaction,
} from "../generated";
import {
  PROTOCOL_CURVE,
  CURVE_3POOL,
  CURVE_STETH_POOL,
  CURVE_TRICRYPTO,
  WETH_ADDRESS,
  WBTC_ADDRESS,
  USDC_ADDRESS,
  USDT_ADDRESS,
  DAI_ADDRESS,
  STETH_ADDRESS,
  updateMultiProtocolWhale,
  detectCrossProtocolFlow,
} from "./common";

// ============ HELPER FUNCTIONS ============

async function getOrCreateCurveStats(
  timestamp: bigint,
  blockNumber: bigint,
  context: any
): Promise<CurveProtocolStats> {
  let stats = await context.CurveProtocolStats.get(PROTOCOL_CURVE);
  
  if (!stats) {
    stats = {
      id: PROTOCOL_CURVE,
      name: "Curve Finance",
      poolCount: 3,
      volumeTotalUSDC: new BigDecimal(0),
      volume24hUSDC: new BigDecimal(0),
      volumeTotalETH: new BigDecimal(0),
      volume24hETH: new BigDecimal(0),
      volumeTotalDAI: new BigDecimal(0),
      volume24hDAI: new BigDecimal(0),
      totalSwaps: BigInt(0),
      swaps24h: BigInt(0),
      totalLiquidityAdds: BigInt(0),
      liquidityAdds24h: BigInt(0),
      totalLiquidityRemoves: BigInt(0),
      liquidityRemoves24h: BigInt(0),
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

async function getOrCreateCurvePool(
  poolAddress: string,
  poolName: string,
  poolType: string,
  tokens: string[],
  tokenSymbols: string[],
  timestamp: bigint,
  context: any
): Promise<CurvePool> {
  let pool = await context.CurvePool.get(poolAddress);
  
  if (!pool) {
    pool = {
      id: poolAddress,
      name: poolName,
      poolType: poolType,
      tokens: tokens,
      tokenSymbols: tokenSymbols,
      volumeTotal: new BigDecimal(0),
      volume24h: new BigDecimal(0),
      totalLiquidity: new BigDecimal(0),
      swapCount: BigInt(0),
      swapCount24h: BigInt(0),
      addLiquidityCount: BigInt(0),
      removeLiquidityCount: BigInt(0),
      uniqueUsers: BigInt(0),
      createdAtTimestamp: timestamp,
      lastActivityTimestamp: timestamp,
    };
  }
  
  return pool;
}

// ============ CURVE 3POOL HANDLERS ============

/**
 * Handle token exchanges in 3Pool
 */
Curve3Pool.TokenExchange.handler(async ({ event, context } : any) => {
  const { buyer, sold_id, tokens_sold, bought_id, tokens_bought } = event.params;
  
  // Convert to BigDecimal
  const tokensSoldDecimal = new BigDecimal(tokens_sold.toString());
  const tokensBoughtDecimal = new BigDecimal(tokens_bought.toString());
  
  // Get or create pool
  const pool = await getOrCreateCurvePool(
    CURVE_3POOL,
    "3Pool (USDC/USDT/DAI)",
    "3pool",
    [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS],
    ["USDC", "USDT", "DAI"],
    BigInt(event.block.timestamp),
    context
  );
  
  // Update pool (immutable)
  const currentVolumeTotal = new BigDecimal(pool.volumeTotal.toString());
  const currentVolume24h = new BigDecimal(pool.volume24h.toString());
  
  const updatedPool: CurvePool = {
    ...pool,
    volumeTotal: currentVolumeTotal.plus(tokensSoldDecimal),
    volume24h: currentVolume24h.plus(tokensSoldDecimal),
    swapCount: pool.swapCount + BigInt(1),
    swapCount24h: pool.swapCount24h + BigInt(1),
    lastActivityTimestamp: BigInt(event.block.timestamp),
  };
  context.CurvePool.set(updatedPool);
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction: CurveTransaction = {
    id: txId,
    pool_id: CURVE_3POOL,
    poolId: CURVE_3POOL,
    txType: "swap",
    user: buyer,
    soldTokenIndex: Number(sold_id),
    boughtTokenIndex: Number(bought_id),
    tokensSold: tokensSoldDecimal,
    tokensBought: tokensBoughtDecimal,
    tokenAmounts: undefined,
    lpTokenAmount: undefined,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.CurveTransaction.set(transaction);
  
  // Update protocol stats
  const stats = await getOrCreateCurveStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  // Track volume by token (0=USDC, 1=USDT, 2=DAI)
  const soldIdNum = Number(sold_id);
  const currentUSDC = new BigDecimal(stats.volumeTotalUSDC.toString());
  const current24hUSDC = new BigDecimal(stats.volume24hUSDC.toString());
  const currentDAI = new BigDecimal(stats.volumeTotalDAI.toString());
  const current24hDAI = new BigDecimal(stats.volume24hDAI.toString());
  
  const updatedStats: CurveProtocolStats = {
    ...stats,
    totalSwaps: stats.totalSwaps + BigInt(1),
    swaps24h: stats.swaps24h + BigInt(1),
    volumeTotalUSDC: soldIdNum === 0 ? currentUSDC.plus(tokensSoldDecimal) : currentUSDC,
    volume24hUSDC: soldIdNum === 0 ? current24hUSDC.plus(tokensSoldDecimal) : current24hUSDC,
    volumeTotalDAI: soldIdNum === 2 ? currentDAI.plus(tokensSoldDecimal) : currentDAI,
    volume24hDAI: soldIdNum === 2 ? current24hDAI.plus(tokensSoldDecimal) : current24hDAI,
  };
  
  context.CurveProtocolStats.set(updatedStats);

  // Whale tracking
  await updateMultiProtocolWhale(
    buyer,
    PROTOCOL_CURVE,
    USDC_ADDRESS,
    tokens_sold,
    "swap",
    BigInt(event.block.timestamp),
    context
  );
});

/**
 * Handle liquidity additions in 3Pool
 */
Curve3Pool.AddLiquidity.handler(async ({ event, context }: any) => {
  const { provider, token_amounts, fees, invariant, token_supply } = event.params;
  
  const tokenSupplyDecimal = new BigDecimal(token_supply.toString());
  
  const pool = await getOrCreateCurvePool(
    CURVE_3POOL,
    "3Pool (USDC/USDT/DAI)",
    "3pool",
    [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS],
    ["USDC", "USDT", "DAI"],
    BigInt(event.block.timestamp),
    context
  );
  
  // Update pool
  context.CurvePool.set({
    ...pool,
    addLiquidityCount: pool.addLiquidityCount + BigInt(1),
    totalLiquidity: tokenSupplyDecimal,
    lastActivityTimestamp: BigInt(event.block.timestamp),
  });
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction: CurveTransaction = {
    id: txId,
    pool_id: pool.id,
    poolId: CURVE_3POOL,
    txType: "add_liquidity",
    user: provider,
    soldTokenIndex: undefined,
    boughtTokenIndex: undefined,
    tokensSold: undefined,
    tokensBought: undefined,
    tokenAmounts: JSON.stringify(token_amounts.map((a: any) => a.toString())),
    lpTokenAmount: tokenSupplyDecimal,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.CurveTransaction.set(transaction);
  
  // Update stats
  const stats = await getOrCreateCurveStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.CurveProtocolStats.set({
    ...stats,
    totalLiquidityAdds: stats.totalLiquidityAdds + BigInt(1),
    liquidityAdds24h: stats.liquidityAdds24h + BigInt(1),
  });

  await detectCrossProtocolFlow(
    transaction,
    provider,
    PROTOCOL_CURVE,
    BigInt(event.block.timestamp),
    context
  );
  
  // Update whale tracking if significant
  const totalAmount = token_amounts.reduce((sum: bigint, amt: any) => sum + amt, BigInt(0));
  await updateMultiProtocolWhale(
    provider,
    PROTOCOL_CURVE,
    USDC_ADDRESS,
    totalAmount,
    "add_liquidity",
    BigInt(event.block.timestamp),
    context
  );
});

/**
 * Handle liquidity removals in 3Pool
 */
Curve3Pool.RemoveLiquidity.handler(async ({ event, context }: any) => {
  const { provider, token_amounts, fees, token_supply } = event.params;
  
  const tokenSupplyDecimal = new BigDecimal(token_supply.toString());
  
  const pool = await getOrCreateCurvePool(
    CURVE_3POOL,
    "3Pool (USDC/USDT/DAI)",
    "3pool",
    [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS],
    ["USDC", "USDT", "DAI"],
    BigInt(event.block.timestamp),
    context
  );
  
  // Update pool
  context.CurvePool.set({
    ...pool,
    removeLiquidityCount: pool.removeLiquidityCount + BigInt(1),
    totalLiquidity: tokenSupplyDecimal,
    lastActivityTimestamp: BigInt(event.block.timestamp),
  });
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  context.CurveTransaction.set({
    id: txId,
    pool_id: pool.id,
    poolId: CURVE_3POOL,
    txType: "remove_liquidity",
    user: provider,
    soldTokenIndex: undefined,
    boughtTokenIndex: undefined,
    tokensSold: undefined,
    tokensBought: undefined,
    tokenAmounts: JSON.stringify(token_amounts.map((a: any) => a.toString())),
    lpTokenAmount: tokenSupplyDecimal,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  });
  
  // Update stats
  const stats = await getOrCreateCurveStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.CurveProtocolStats.set({
    ...stats,
    totalLiquidityRemoves: stats.totalLiquidityRemoves + BigInt(1),
    liquidityRemoves24h: stats.liquidityRemoves24h + BigInt(1),
  });
});

/**
 * Handle single asset liquidity removal in 3Pool
 */
Curve3Pool.RemoveLiquidityOne.handler(async ({ event, context }: any) => {
  const { provider, token_amount, coin_amount } = event.params;
  
  const coinAmountDecimal = new BigDecimal(coin_amount.toString());
  
  const pool = await getOrCreateCurvePool(
    CURVE_3POOL,
    "3Pool (USDC/USDT/DAI)",
    "3pool",
    [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS],
    ["USDC", "USDT", "DAI"],
    BigInt(event.block.timestamp),
    context
  );
  
  // Update pool
  context.CurvePool.set({
    ...pool,
    removeLiquidityCount: pool.removeLiquidityCount + BigInt(1),
    lastActivityTimestamp: BigInt(event.block.timestamp),
  });
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  context.CurveTransaction.set({
    id: txId,
    pool_id: pool.id,
    poolId: CURVE_3POOL,
    txType: "remove_liquidity",
    user: provider,
    soldTokenIndex: undefined,
    boughtTokenIndex: undefined,
    tokensSold: undefined,
    tokensBought: coinAmountDecimal,
    tokenAmounts: undefined,
    lpTokenAmount: new BigDecimal(token_amount.toString()),
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  });
  
  // Update stats
  const stats = await getOrCreateCurveStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.CurveProtocolStats.set({
    ...stats,
    totalLiquidityRemoves: stats.totalLiquidityRemoves + BigInt(1),
    liquidityRemoves24h: stats.liquidityRemoves24h + BigInt(1),
  });
});

// ============ CURVE STETH POOL HANDLERS ============

/**
 * Handle token exchanges in stETH pool
 */
CurveStETHPool.TokenExchange.handler(async ({ event, context }: any) => {
  const { buyer, sold_id, tokens_sold, bought_id, tokens_bought } = event.params;
  
  const tokensSoldDecimal = new BigDecimal(tokens_sold.toString());
  const tokensBoughtDecimal = new BigDecimal(tokens_bought.toString());
  
  const pool = await getOrCreateCurvePool(
    CURVE_STETH_POOL,
    "stETH Pool",
    "steth",
    [WETH_ADDRESS, STETH_ADDRESS],
    ["ETH", "stETH"],
    BigInt(event.block.timestamp),
    context
  );
  
  // Update pool
  const currentVolumeTotal = new BigDecimal(pool.volumeTotal.toString());
  const currentVolume24h = new BigDecimal(pool.volume24h.toString());
  
  context.CurvePool.set({
    ...pool,
    volumeTotal: currentVolumeTotal.plus(tokensSoldDecimal),
    volume24h: currentVolume24h.plus(tokensSoldDecimal),
    swapCount: pool.swapCount + BigInt(1),
    swapCount24h: pool.swapCount24h + BigInt(1),
    lastActivityTimestamp: BigInt(event.block.timestamp),
  });
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  context.CurveTransaction.set({
    id: txId,
    pool_id: pool.id,
    poolId: CURVE_STETH_POOL,
    txType: "swap",
    user: buyer,
    soldTokenIndex: Number(sold_id),
    boughtTokenIndex: Number(bought_id),
    tokensSold: tokensSoldDecimal,
    tokensBought: tokensBoughtDecimal,
    tokenAmounts: undefined,
    lpTokenAmount: undefined,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  });
  
  // Update stats
  const stats = await getOrCreateCurveStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  const currentETH = new BigDecimal(stats.volumeTotalETH.toString());
  const current24hETH = new BigDecimal(stats.volume24hETH.toString());
  
  context.CurveProtocolStats.set({
    ...stats,
    totalSwaps: stats.totalSwaps + BigInt(1),
    swaps24h: stats.swaps24h + BigInt(1),
    volumeTotalETH: currentETH.plus(tokensSoldDecimal),
    volume24hETH: current24hETH.plus(tokensSoldDecimal),
  });

  // Whale tracking
  await updateMultiProtocolWhale(
    buyer,
    PROTOCOL_CURVE,
    WETH_ADDRESS,
    tokens_sold,
    "swap",
    BigInt(event.block.timestamp),
    context
  );
});

/**
 * Handle liquidity additions in stETH pool
 */
CurveStETHPool.AddLiquidity.handler(async ({ event, context }: any) => {
  const { provider, token_amounts, fees, invariant, token_supply } = event.params;
  
  const tokenSupplyDecimal = new BigDecimal(token_supply.toString());
  
  const pool = await getOrCreateCurvePool(
    CURVE_STETH_POOL,
    "stETH Pool",
    "steth",
    [WETH_ADDRESS, STETH_ADDRESS],
    ["ETH", "stETH"],
    BigInt(event.block.timestamp),
    context
  );
  
  context.CurvePool.set({
    ...pool,
    addLiquidityCount: pool.addLiquidityCount + BigInt(1),
    totalLiquidity: tokenSupplyDecimal,
    lastActivityTimestamp: BigInt(event.block.timestamp),
  });
  
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction: CurveTransaction = {
    id: txId,
    pool_id: pool.id,
    poolId: CURVE_STETH_POOL,
    txType: "add_liquidity",
    user: provider,
    soldTokenIndex: undefined,
    boughtTokenIndex: undefined,
    tokensSold: undefined,
    tokensBought: undefined,
    tokenAmounts: JSON.stringify(token_amounts.map((a: any) => a.toString())),
    lpTokenAmount: tokenSupplyDecimal,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.CurveTransaction.set(transaction);
  
  const stats = await getOrCreateCurveStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.CurveProtocolStats.set({
    ...stats,
    totalLiquidityAdds: stats.totalLiquidityAdds + BigInt(1),
    liquidityAdds24h: stats.liquidityAdds24h + BigInt(1),
  });

  await detectCrossProtocolFlow(
    transaction,
    provider,
    PROTOCOL_CURVE,
    BigInt(event.block.timestamp),
    context
  );
  
  const totalAmount = token_amounts.reduce((sum: bigint, amt: any) => sum + amt, BigInt(0));
  await updateMultiProtocolWhale(
    provider,
    PROTOCOL_CURVE,
    WETH_ADDRESS,
    totalAmount,
    "add_liquidity",
    BigInt(event.block.timestamp),
    context
  );
});

/**
 * Handle liquidity removals in stETH pool
 */
CurveStETHPool.RemoveLiquidity.handler(async ({ event, context }: any) => {
  const { provider, token_amounts, fees, token_supply } = event.params;
  
  const tokenSupplyDecimal = new BigDecimal(token_supply.toString());
  
  const pool = await getOrCreateCurvePool(
    CURVE_STETH_POOL,
    "stETH Pool",
    "steth",
    [WETH_ADDRESS, STETH_ADDRESS],
    ["ETH", "stETH"],
    BigInt(event.block.timestamp),
    context
  );
  
  context.CurvePool.set({
    ...pool,
    removeLiquidityCount: pool.removeLiquidityCount + BigInt(1),
    totalLiquidity: tokenSupplyDecimal,
    lastActivityTimestamp: BigInt(event.block.timestamp),
  });
  
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  context.CurveTransaction.set({
    id: txId,
    pool_id: pool.id,
    poolId: CURVE_STETH_POOL,
    txType: "remove_liquidity",
    user: provider,
    soldTokenIndex: undefined,
    boughtTokenIndex: undefined,
    tokensSold: undefined,
    tokensBought: undefined,
    tokenAmounts: JSON.stringify(token_amounts.map((a: any) => a.toString())),
    lpTokenAmount: tokenSupplyDecimal,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  });
  
  const stats = await getOrCreateCurveStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.CurveProtocolStats.set({
    ...stats,
    totalLiquidityRemoves: stats.totalLiquidityRemoves + BigInt(1),
    liquidityRemoves24h: stats.liquidityRemoves24h + BigInt(1),
  });
});

/**
 * Handle single asset liquidity removal in stETH pool
 */
CurveStETHPool.RemoveLiquidityOne.handler(async ({ event, context }: any) => {
  const { provider, token_amount, coin_amount } = event.params;
  
  const coinAmountDecimal = new BigDecimal(coin_amount.toString());
  
  const pool = await getOrCreateCurvePool(
    CURVE_STETH_POOL,
    "stETH Pool",
    "steth",
    [WETH_ADDRESS, STETH_ADDRESS],
    ["ETH", "stETH"],
    BigInt(event.block.timestamp),
    context
  );
  
  context.CurvePool.set({
    ...pool,
    removeLiquidityCount: pool.removeLiquidityCount + BigInt(1),
    lastActivityTimestamp: BigInt(event.block.timestamp),
  });
  
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  context.CurveTransaction.set({
    id: txId,
    pool_id: pool.id,
    poolId: CURVE_STETH_POOL,
    txType: "remove_liquidity",
    user: provider,
    soldTokenIndex: undefined,
    boughtTokenIndex: undefined,
    tokensSold: undefined,
    tokensBought: coinAmountDecimal,
    tokenAmounts: undefined,
    lpTokenAmount: new BigDecimal(token_amount.toString()),
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  });
  
  const stats = await getOrCreateCurveStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.CurveProtocolStats.set({
    ...stats,
    totalLiquidityRemoves: stats.totalLiquidityRemoves + BigInt(1),
    liquidityRemoves24h: stats.liquidityRemoves24h + BigInt(1),
  });
});

// ============ CURVE TRICRYPTO HANDLERS ============

/**
 * Handle token exchanges in Tricrypto pool
 */
CurveTricryptoPool.TokenExchange.handler(async ({ event, context }: any) => {
  const { buyer, sold_id, tokens_sold, bought_id, tokens_bought } = event.params;
  
  const tokensSoldDecimal = new BigDecimal(tokens_sold.toString());
  const tokensBoughtDecimal = new BigDecimal(tokens_bought.toString());
  
  const pool = await getOrCreateCurvePool(
    CURVE_TRICRYPTO,
    "Tricrypto (USDT/WBTC/ETH)",
    "tricrypto",
    [USDT_ADDRESS, WBTC_ADDRESS, WETH_ADDRESS],
    ["USDT", "WBTC", "ETH"],
    BigInt(event.block.timestamp),
    context
  );
  
  const currentVolumeTotal = new BigDecimal(pool.volumeTotal.toString());
  const currentVolume24h = new BigDecimal(pool.volume24h.toString());
  
  context.CurvePool.set({
    ...pool,
    volumeTotal: currentVolumeTotal.plus(tokensSoldDecimal),
    volume24h: currentVolume24h.plus(tokensSoldDecimal),
    swapCount: pool.swapCount + BigInt(1),
    swapCount24h: pool.swapCount24h + BigInt(1),
    lastActivityTimestamp: BigInt(event.block.timestamp),
  });
  
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  context.CurveTransaction.set({
    id: txId,
    pool_id: pool.id,
    poolId: CURVE_TRICRYPTO,
    txType: "swap",
    user: buyer,
    soldTokenIndex: Number(sold_id),
    boughtTokenIndex: Number(bought_id),
    tokensSold: tokensSoldDecimal,
    tokensBought: tokensBoughtDecimal,
    tokenAmounts: undefined,
    lpTokenAmount: undefined,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  });
  
  const stats = await getOrCreateCurveStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.CurveProtocolStats.set({
    ...stats,
    totalSwaps: stats.totalSwaps + BigInt(1),
    swaps24h: stats.swaps24h + BigInt(1),
  });
});

/**
 * Handle liquidity additions in Tricrypto
 */
CurveTricryptoPool.AddLiquidity.handler(async ({ event, context }: any) => {
  const { provider, token_amounts, token_supply } = event.params;
  
  const tokenSupplyDecimal = new BigDecimal(token_supply.toString());
  
  const pool = await getOrCreateCurvePool(
    CURVE_TRICRYPTO,
    "Tricrypto (USDT/WBTC/ETH)",
    "tricrypto",
    [USDT_ADDRESS, WBTC_ADDRESS, WETH_ADDRESS],
    ["USDT", "WBTC", "ETH"],
    BigInt(event.block.timestamp),
    context
  );
  
  context.CurvePool.set({
    ...pool,
    addLiquidityCount: pool.addLiquidityCount + BigInt(1),
    totalLiquidity: tokenSupplyDecimal,
    lastActivityTimestamp: BigInt(event.block.timestamp),
  });
  
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction: CurveTransaction = {
    id: txId,
    pool_id: pool.id,
    poolId: CURVE_TRICRYPTO,
    txType: "add_liquidity",
    user: provider,
    soldTokenIndex: undefined,
    boughtTokenIndex: undefined,
    tokensSold: undefined,
    tokensBought: undefined,
    tokenAmounts: JSON.stringify(token_amounts.map((a: any) => a.toString())),
    lpTokenAmount: tokenSupplyDecimal,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.CurveTransaction.set(transaction);
  
  const stats = await getOrCreateCurveStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.CurveProtocolStats.set({
    ...stats,
    totalLiquidityAdds: stats.totalLiquidityAdds + BigInt(1),
    liquidityAdds24h: stats.liquidityAdds24h + BigInt(1),
  });

  await detectCrossProtocolFlow(
    transaction,
    provider,
    PROTOCOL_CURVE,
    BigInt(event.block.timestamp),
    context
  );
  
  const totalAmount = token_amounts.reduce((sum: bigint, amt: any) => sum + amt, BigInt(0));
  await updateMultiProtocolWhale(
    provider,
    PROTOCOL_CURVE,
    USDT_ADDRESS,
    totalAmount,
    "add_liquidity",
    BigInt(event.block.timestamp),
    context
  );
});

/**
 * Handle liquidity removals in Tricrypto
 */
CurveTricryptoPool.RemoveLiquidity.handler(async ({ event, context }: any) => {
  const { provider, token_amounts, token_supply } = event.params;
  
  const tokenSupplyDecimal = new BigDecimal(token_supply.toString());
  
  const pool = await getOrCreateCurvePool(
    CURVE_TRICRYPTO,
    "Tricrypto (USDT/WBTC/ETH)",
    "tricrypto",
    [USDT_ADDRESS, WBTC_ADDRESS, WETH_ADDRESS],
    ["USDT", "WBTC", "ETH"],
    BigInt(event.block.timestamp),
    context
  );
  
  context.CurvePool.set({
    ...pool,
    removeLiquidityCount: pool.removeLiquidityCount + BigInt(1),
    totalLiquidity: tokenSupplyDecimal,
    lastActivityTimestamp: BigInt(event.block.timestamp),
  });
  
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  context.CurveTransaction.set({
    id: txId,
    pool_id: pool.id,
    poolId: CURVE_TRICRYPTO,
    txType: "remove_liquidity",
    user: provider,
    soldTokenIndex: undefined,
    boughtTokenIndex: undefined,
    tokensSold: undefined,
    tokensBought: undefined,
    tokenAmounts: JSON.stringify(token_amounts.map((a: any) => a.toString())),
    lpTokenAmount: tokenSupplyDecimal,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  });
  
  const stats = await getOrCreateCurveStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.CurveProtocolStats.set({
    ...stats,
    totalLiquidityRemoves: stats.totalLiquidityRemoves + BigInt(1),
    liquidityRemoves24h: stats.liquidityRemoves24h + BigInt(1),
  });
});
