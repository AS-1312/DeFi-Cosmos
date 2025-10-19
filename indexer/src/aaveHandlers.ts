import {
  AaveV3Pool,
  BigDecimal,
} from "../generated";

import {
  PROTOCOL_AAVE,
  getTokenSymbol,
  getTokenDecimals,
  calculateUtilization,
  updateMultiProtocolWhale,
  detectCrossProtocolFlow,
} from "./common";

// ============ HELPER FUNCTIONS ============

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

// ============ EVENT HANDLERS ============

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
    user,
    PROTOCOL_AAVE,
    amount,
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
