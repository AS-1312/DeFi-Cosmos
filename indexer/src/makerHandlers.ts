import { BigDecimal } from "../generated";
import {
  MakerCDPManager,
  MakerVat,
  MakerDog,
  MakerVault,
  MakerProtocolStats,
  MakerTransaction,
} from "../generated";
import {
  PROTOCOL_MAKER,
  ilkToString,
} from "./common";

// ============ HELPER FUNCTIONS ============

async function getOrCreateMakerStats(
  timestamp: bigint,
  blockNumber: bigint,
  context: any
): Promise<MakerProtocolStats> {
  let stats = await context.MakerProtocolStats.get(PROTOCOL_MAKER);
  
  if (!stats) {
    stats = {
      id: PROTOCOL_MAKER,
      name: "MakerDAO",
      totalVaults: 0,
      activeVaults: 0,
      totalCollateralETH: new BigDecimal(0),
      totalCollateralWBTC: new BigDecimal(0),
      totalDAIMinted: new BigDecimal(0),
      totalDAIRepaid: new BigDecimal(0),
      outstandingDAI: new BigDecimal(0),
      totalVaultModifications: BigInt(0),
      vaultModifications24h: BigInt(0),
      totalLiquidations: BigInt(0),
      liquidations24h: BigInt(0),
      uniqueVaultOwners: BigInt(0),
      avgCollateralizationRatio: 0,
      avgGasPrice: BigInt(0),
      healthScore: 100,
      lastUpdateTime: timestamp,
      lastBlockNumber: blockNumber,
    };
  }
  
  return stats;
}

// ============ EVENT HANDLERS ============

/**
 * Handle new vault (CDP) creation
 */
MakerCDPManager.NewCdp.handler(async ({ event, context }: any) => {
  const { usr, own, cdp } = event.params;
  
  const vaultId = cdp.toString();
  const vault: MakerVault = {
    id: vaultId,
    owner: own,
    ilk: "UNKNOWN",
    collateralAmount: new BigDecimal(0),
    collateralType: "UNKNOWN",
    debtAmount: new BigDecimal(0),
    isActive: true,
    liquidated: false,
    modificationCount: 0,
    createdAtTimestamp: BigInt(event.block.timestamp),
    createdAtBlockNumber: BigInt(event.block.number),
    lastModifiedTimestamp: BigInt(event.block.timestamp),
  };
  context.MakerVault.set(vault);
  
  // Update stats
  const stats = await getOrCreateMakerStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.MakerProtocolStats.set({
    ...stats,
    totalVaults: stats.totalVaults + 1,
    activeVaults: stats.activeVaults + 1,
    uniqueVaultOwners: stats.uniqueVaultOwners + BigInt(1),
  });
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  context.MakerTransaction.set({
    id: txId,
    txType: "vault_open",
    vaultId: vaultId,
    owner: own,
    ilk: undefined,
    collateralDelta: undefined,
    debtDelta: undefined,
    liquidator: undefined,
    collateralLiquidated: undefined,
    debtCovered: undefined,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  });
});

/**
 * Handle vault modifications (frob)
 * Note: LogNote decoding is simplified here
 */
MakerVat.LogNote.handler(async ({ event, context }: any) => {
  const { sig, usr, arg1, arg2, data } = event.params;
  
  // Only process frob() calls
  // frob signature: 0x76088703
  const frobSig = sig.slice(0, 10);
  if (frobSig !== "0x76088703") return;
  
  const ilk = ilkToString(arg1);
  const urn = arg2;
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  context.MakerTransaction.set({
    id: txId,
    txType: "vault_modify",
    vaultId: undefined, // Would need CDP ID mapping
    owner: usr,
    ilk: ilk,
    collateralDelta: undefined, // Would decode from data
    debtDelta: undefined, // Would decode from data
    liquidator: undefined,
    collateralLiquidated: undefined,
    debtCovered: undefined,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  });
  
  // Update stats
  const stats = await getOrCreateMakerStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  context.MakerProtocolStats.set({
    ...stats,
    totalVaultModifications: stats.totalVaultModifications + BigInt(1),
    vaultModifications24h: stats.vaultModifications24h + BigInt(1),
  });
});

/**
 * Handle liquidations (Bark event from Dog contract)
 */
MakerDog.Bark.handler(async ({ event, context }: any) => {
  const { ilk, urn, ink, art, due, clip, id } = event.params;
  
  const ilkString = ilkToString(ilk);
  const inkDecimal = new BigDecimal(ink.toString());
  const artDecimal = new BigDecimal(art.toString());
  const dueDecimal = new BigDecimal(due.toString());
  
  // Create transaction
  const txId = `${event.transaction.hash}-${event.logIndex}`;
  context.MakerTransaction.set({
    id: txId,
    txType: "liquidation",
    vaultId: id.toString(),
    owner: urn,
    ilk: ilkString,
    collateralDelta: undefined,
    debtDelta: undefined,
    liquidator: clip,
    collateralLiquidated: inkDecimal,
    debtCovered: artDecimal,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    logIndex: Number(event.logIndex),
    gasPrice: BigInt(event.transaction.gasPrice || 0),
  });
  
  // Update vault if exists
  const vault = await context.MakerVault.get(id.toString());
  if (vault) {
    context.MakerVault.set({
      ...vault,
      isActive: false,
      liquidated: true,
      lastModifiedTimestamp: BigInt(event.block.timestamp),
    });
  }
  
  // Update stats
  const stats = await getOrCreateMakerStats(
    BigInt(event.block.timestamp),
    BigInt(event.block.number),
    context
  );
  
  // Reduce active vaults
  const newActiveVaults = Math.max(0, stats.activeVaults - 1);
  
  // Reduce health score for liquidations
  const newHealthScore = Math.max(0, stats.healthScore - 5);
  
  context.MakerProtocolStats.set({
    ...stats,
    totalLiquidations: stats.totalLiquidations + BigInt(1),
    liquidations24h: stats.liquidations24h + BigInt(1),
    activeVaults: newActiveVaults,
    healthScore: newHealthScore,
    lastUpdateTime: BigInt(event.block.timestamp),
    lastBlockNumber: BigInt(event.block.number),
  });
});