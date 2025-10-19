import { BigDecimal } from "../generated";
import {
  Lido,
  LidoProtocolStats,
  LidoTransaction,
  LidoStaker,
} from "../generated";
import {
  PROTOCOL_LIDO,
  WETH_ADDRESS,
  STETH_ADDRESS,
  isWhaleTransaction,
} from "./common";

// ============ HELPER FUNCTIONS ============

async function getOrCreateLidoStats(
  timestamp: bigint,
  blockNumber: bigint,
  context: any
): Promise<LidoProtocolStats> {
  let stats = await context.LidoProtocolStats.get(PROTOCOL_LIDO);
  
  if (!stats) {
    stats = {
      id: PROTOCOL_LIDO,
      name: "Lido",
      totalStakedETH: new BigDecimal(0),
      totalStETH: new BigDecimal(0),
      totalSubmissions: BigInt(0),
      submissions24h: BigInt(0),
      totalTransfers: BigInt(0),
      transfers24h: BigInt(0),
      uniqueStakers: BigInt(0),
      uniqueStakers24h: BigInt(0),
      avgStakeSize: new BigDecimal(0),
      avgGasPrice: BigInt(0),
      tps: 0,
      lastUpdateTime: timestamp,
      lastBlockNumber: blockNumber,
    };
  }
  
  return stats;
}

// ============ EVENT HANDLERS ============

/**
 * Handle ETH staking submissions
 */
Lido.Submitted.handler(async ({ event, context }: any) => {
  const { sender, amount, referral } = event.params;
  
  // Convert amount to BigDecimal
  const amountDecimal = new BigDecimal(amount.toString());
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction: LidoTransaction = {
    id: txId,
    txType: "stake",
    from: sender,
    to: undefined,
    amount: amountDecimal,
    referral: referral,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.LidoTransaction.set(transaction);
  
  // Update protocol stats
  const stats = await getOrCreateLidoStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  // Convert DB-retrieved BigDecimal fields
  const currentTotalStaked = new BigDecimal(stats.totalStakedETH.toString());
  const currentTotalStETH = new BigDecimal(stats.totalStETH.toString());
  
  // Calculate average stake size
  const newTotalSubmissions = stats.totalSubmissions + BigInt(1);
  const totalStaked = currentTotalStaked.plus(amountDecimal);
  const avgStakeSize = totalStaked.div(new BigDecimal(Number(newTotalSubmissions)));
  
  // Update stats (immutable)
  const updatedStats: LidoProtocolStats = {
    ...stats,
    totalStakedETH: totalStaked,
    totalStETH: currentTotalStETH.plus(amountDecimal),
    totalSubmissions: newTotalSubmissions,
    submissions24h: stats.submissions24h + BigInt(1),
    avgStakeSize: avgStakeSize,
    lastUpdateTime: BigInt(event.block.timestamp),
    lastBlockNumber: BigInt(event.block.number),
  };
  
  context.LidoProtocolStats.set(updatedStats);
  
  // Update staker
  let staker = await context.LidoStaker.get(sender);
  if (!staker) {
    staker = {
      id: sender,
      staker: sender,
      totalStakedETH: amountDecimal,
      stakeCount: 1,
      firstStakeTime: BigInt(event.block.timestamp),
      lastStakeTime: BigInt(event.block.timestamp),
    };
    
    // Increment unique stakers
    const finalStats: LidoProtocolStats = {
      ...updatedStats,
      uniqueStakers: updatedStats.uniqueStakers + BigInt(1),
    };
    context.LidoProtocolStats.set(finalStats);
  } else {
    const currentStaked = new BigDecimal(staker.totalStakedETH.toString());
    staker = {
      ...staker,
      totalStakedETH: currentStaked.plus(amountDecimal),
      stakeCount: staker.stakeCount + 1,
      lastStakeTime: BigInt(event.block.timestamp),
    };
  }
  context.LidoStaker.set(staker);
});

/**
 * Handle stETH transfers (for tracking large movements)
 */
Lido.Transfer.handler(async ({ event, context }: any) => {
  const { from, to, value } = event.params;
  
  // Skip minting/burning events
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  if (from === ZERO_ADDRESS || to === ZERO_ADDRESS) return;
  
  // Only track whale transfers
  if (!isWhaleTransaction(STETH_ADDRESS, value)) return;
  
  // Convert to BigDecimal
  const valueDecimal = new BigDecimal(value.toString());
  
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  const transaction: LidoTransaction = {
    id: txId,
    txType: "transfer",
    from: from,
    to: to,
    amount: valueDecimal,
    referral: undefined,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  };
  context.LidoTransaction.set(transaction);
  
  // Update stats
  const stats = await getOrCreateLidoStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.LidoProtocolStats.set({
    ...stats,
    totalTransfers: stats.totalTransfers + BigInt(1),
    transfers24h: stats.transfers24h + BigInt(1),
  });
});

/**
 * Handle TransferShares events (alternative transfer tracking)
 */
Lido.TransferShares.handler(async ({ event, context }: any) => {
  const { from, to, sharesValue } = event.params;
  
  // Skip minting/burning events
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  if (from === ZERO_ADDRESS || to === ZERO_ADDRESS) return;
  
  // Only track significant transfers
  const sharesThreshold = BigInt(50) * BigInt(10 ** 18); // 50 shares
  if (sharesValue < sharesThreshold) return;
  
  // Update stats
  const stats = await getOrCreateLidoStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.LidoProtocolStats.set({
    ...stats,
    totalTransfers: stats.totalTransfers + BigInt(1),
    transfers24h: stats.transfers24h + BigInt(1),
  });
});