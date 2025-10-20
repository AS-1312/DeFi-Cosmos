import { BigDecimal } from "../generated";
import {
  CrossProtocolFlow,
} from "../generated";

// ============ PROTOCOL CONSTANTS ============

export const PROTOCOL_UNISWAP = "uniswap-v4";
export const PROTOCOL_AAVE = "aave-v3";
export const PROTOCOL_LIDO = "lido";
export const PROTOCOL_CURVE = "curve";
export const PROTOCOL_MAKER = "maker";

// ============ TOKEN ADDRESSES (Ethereum mainnet) ============

export const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const WBTC_ADDRESS = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
export const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
export const STETH_ADDRESS = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84";

// ============ CURVE POOL ADDRESSES ============

export const CURVE_3POOL = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
export const CURVE_STETH_POOL = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";
export const CURVE_TRICRYPTO = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";

// ============ WHALE THRESHOLDS (in token base units) ============

export const WHALE_THRESHOLDS: { [key: string]: bigint } = {
  [WETH_ADDRESS.toLowerCase()]: BigInt(50) * BigInt(10 ** 18), // 50 ETH
  [USDC_ADDRESS.toLowerCase()]: BigInt(250000) * BigInt(10 ** 6), // 250K USDC
  [USDT_ADDRESS.toLowerCase()]: BigInt(250000) * BigInt(10 ** 6), // 250K USDT
  [WBTC_ADDRESS.toLowerCase()]: BigInt(10) * BigInt(10 ** 8), // 10 WBTC
  [DAI_ADDRESS.toLowerCase()]: BigInt(250000) * BigInt(10 ** 18), // 250K DAI
  [STETH_ADDRESS.toLowerCase()]: BigInt(50) * BigInt(10 ** 18), // 50 stETH
};

// ============ TOKEN METADATA ============

export const TOKEN_SYMBOLS: { [key: string]: string } = {
  [WETH_ADDRESS.toLowerCase()]: "ETH",
  [USDC_ADDRESS.toLowerCase()]: "USDC",
  [USDT_ADDRESS.toLowerCase()]: "USDT",
  [WBTC_ADDRESS.toLowerCase()]: "WBTC",
  [DAI_ADDRESS.toLowerCase()]: "DAI",
  [STETH_ADDRESS.toLowerCase()]: "stETH",
};

export const TOKEN_DECIMALS: { [key: string]: number } = {
  [WETH_ADDRESS.toLowerCase()]: 18,
  [USDC_ADDRESS.toLowerCase()]: 6,
  [USDT_ADDRESS.toLowerCase()]: 6,
  [WBTC_ADDRESS.toLowerCase()]: 8,
  [DAI_ADDRESS.toLowerCase()]: 18,
  [STETH_ADDRESS.toLowerCase()]: 18,
};

// ============ TIME CONSTANTS ============

export const HOUR_IN_SECONDS = 3600;
export const CAPITAL_FLOW_WINDOW = 300; // 5 minutes

// ============ UTILITY FUNCTIONS ============

/**
 * Get the symbol for a token address
 */
export function getTokenSymbol(address: string): string {
  const lowerAddress = address.toLowerCase();
  return TOKEN_SYMBOLS[lowerAddress] || "UNKNOWN";
}

/**
 * Get the decimals for a token address
 */
export function getTokenDecimals(address: string): number {
  const lowerAddress = address.toLowerCase();
  return TOKEN_DECIMALS[lowerAddress] || 18;
}

/**
 * Check if a transaction qualifies as a whale transaction
 */
export function isWhaleTransaction(tokenAddress: string, amount: bigint): boolean {
  const threshold = WHALE_THRESHOLDS[tokenAddress.toLowerCase()];
  if (!threshold) return false;
  
  const absAmount = amount < BigInt(0) ? -amount : amount;
  return absAmount >= threshold;
}

/**
 * Convert MakerDAO ilk bytes32 to string
 */
export function ilkToString(ilkBytes: string): string {
  try {
    const hex = ilkBytes.replace('0x', '');
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substr(i, 2), 16);
      if (charCode === 0) break;
      str += String.fromCharCode(charCode);
    }
    return str;
  } catch (e) {
    return 'UNKNOWN';
  }
}

/**
 * Safely convert BigDecimal from database
 */
export function toBigDecimal(value: any): BigDecimal {
  if (value instanceof BigDecimal) {
    return value;
  }
  return new BigDecimal(value.toString());
}

/**
 * Create hourly snapshot timestamp
 */
export function getHourlyTimestamp(timestamp: bigint): bigint {
  return (timestamp / BigInt(HOUR_IN_SECONDS)) * BigInt(HOUR_IN_SECONDS);
}

/**
 * Calculate utilization rate (borrowed / supplied)
 * Returns a number between 0 and 1 (or 0 if supplied is 0)
 */
export function calculateUtilization(totalSupplied: any, totalBorrowed: any): number {
  const supplied = new BigDecimal(totalSupplied.toString());
  const borrowed = new BigDecimal(totalBorrowed.toString());
  
  if (supplied.isEqualTo(new BigDecimal(0))) {
    return 0;
  }
  
  return Number(borrowed.dividedBy(supplied).toString());
}

/**
 * Multi-protocol whale tracking
 * Tracks whale activity across both Uniswap V4 and Aave V3
 */
export async function updateMultiProtocolWhale(
  wallet: string,
  protocol: string,
  tokenAddress: string,
  amount: bigint,
  txType: string,
  timestamp: bigint,
  context: any
): Promise<void> {
  // Check if this is a whale transaction
  if (!isWhaleTransaction(tokenAddress, amount)) return;
  
  // Get or create whale entity
  let whale = await context.MultiProtocolWhale.get(wallet);
  
  const tokenSymbol = getTokenSymbol(tokenAddress);
  const absAmount = amount < BigInt(0) ? -amount : amount;
  const absAmountDecimal = new BigDecimal(absAmount.toString());
  
  if (!whale) {
    // Create new whale entity
    whale = {
      id: wallet,
      wallet: wallet,
      
      // Uniswap V4 activity
      uniswapVolumeETH: new BigDecimal(0),
      uniswapVolumeUSDC: new BigDecimal(0),
      uniswapSwapCount: 0,
      
      // Aave V3 activity
      aaveSuppliedETH: new BigDecimal(0),
      aaveSuppliedUSDC: new BigDecimal(0),
      aaveBorrowedETH: new BigDecimal(0),
      aaveBorrowedUSDC: new BigDecimal(0),
      aaveSupplyCount: 0,
      aaveBorrowCount: 0,
      
      // Lido activity
      lidoStakedETH: new BigDecimal(0),
      lidoStakeCount: 0,
      
      // Curve activity
      curveVolumeETH: new BigDecimal(0),
      curveVolumeUSDC: new BigDecimal(0),
      curveSwapCount: 0,
      
      // Maker activity
      makerCollateralETH: new BigDecimal(0),
      makerDebtDAI: new BigDecimal(0),
      makerVaultCount: 0,
      
      // Cross-protocol
      protocolsUsed: [protocol],
      crossProtocolFlows: 0,
      
      // Overall
      totalTransactionCount: 0,
      largestTransactionETH: new BigDecimal(0),
      
      firstSeenTime: timestamp,
      lastActiveTime: timestamp,
    };
  }
  
  // Build updated whale object (immutable pattern)
  const currentProtocols = whale.protocolsUsed || [];
  const protocolsUsed = currentProtocols.includes(protocol) 
    ? currentProtocols 
    : [...currentProtocols, protocol];
  
  let updatedWhale = {
    ...whale,
    protocolsUsed,
    lastActiveTime: timestamp,
    totalTransactionCount: whale.totalTransactionCount + 1,
  };
  
  // Update protocol-specific metrics based on protocol and transaction type
  switch (protocol) {
    case PROTOCOL_UNISWAP:
      updatedWhale = {
        ...updatedWhale,
        uniswapSwapCount: whale.uniswapSwapCount + 1,
      };
      
      if (tokenSymbol === "ETH") {
        const currentVolume = new BigDecimal(whale.uniswapVolumeETH.toString());
        const newVolume = currentVolume.plus(absAmountDecimal);
        
        const currentLargest = new BigDecimal(whale.largestTransactionETH.toString());
        const newLargest = absAmountDecimal.isGreaterThan(currentLargest) 
          ? absAmountDecimal 
          : currentLargest;
        
        updatedWhale = {
          ...updatedWhale,
          uniswapVolumeETH: newVolume,
          largestTransactionETH: newLargest,
        };
      } else if (tokenSymbol === "USDC") {
        const currentVolume = new BigDecimal(whale.uniswapVolumeUSDC.toString());
        updatedWhale = {
          ...updatedWhale,
          uniswapVolumeUSDC: currentVolume.plus(absAmountDecimal),
        };
      }
      break;
      
    case PROTOCOL_AAVE:
      if (txType === "supply") {
        updatedWhale = {
          ...updatedWhale,
          aaveSupplyCount: whale.aaveSupplyCount + 1,
        };
        
        if (tokenSymbol === "ETH") {
          const currentSupplied = new BigDecimal(whale.aaveSuppliedETH.toString());
          updatedWhale = {
            ...updatedWhale,
            aaveSuppliedETH: currentSupplied.plus(absAmountDecimal),
          };
        } else if (tokenSymbol === "USDC") {
          const currentSupplied = new BigDecimal(whale.aaveSuppliedUSDC.toString());
          updatedWhale = {
            ...updatedWhale,
            aaveSuppliedUSDC: currentSupplied.plus(absAmountDecimal),
          };
        }
      } else if (txType === "withdraw") {
        // For withdrawals, we subtract
        if (tokenSymbol === "ETH") {
          const currentSupplied = new BigDecimal(whale.aaveSuppliedETH.toString());
          const newSupplied = currentSupplied.minus(absAmountDecimal);
          // Ensure non-negative
          updatedWhale = {
            ...updatedWhale,
            aaveSuppliedETH: newSupplied.isLessThan(new BigDecimal(0)) 
              ? new BigDecimal(0) 
              : newSupplied,
          };
        } else if (tokenSymbol === "USDC") {
          const currentSupplied = new BigDecimal(whale.aaveSuppliedUSDC.toString());
          const newSupplied = currentSupplied.minus(absAmountDecimal);
          updatedWhale = {
            ...updatedWhale,
            aaveSuppliedUSDC: newSupplied.isLessThan(new BigDecimal(0)) 
              ? new BigDecimal(0) 
              : newSupplied,
          };
        }
      } else if (txType === "borrow") {
        updatedWhale = {
          ...updatedWhale,
          aaveBorrowCount: whale.aaveBorrowCount + 1,
        };
        
        if (tokenSymbol === "ETH") {
          const currentBorrowed = new BigDecimal(whale.aaveBorrowedETH.toString());
          updatedWhale = {
            ...updatedWhale,
            aaveBorrowedETH: currentBorrowed.plus(absAmountDecimal),
          };
        } else if (tokenSymbol === "USDC") {
          const currentBorrowed = new BigDecimal(whale.aaveBorrowedUSDC.toString());
          updatedWhale = {
            ...updatedWhale,
            aaveBorrowedUSDC: currentBorrowed.plus(absAmountDecimal),
          };
        }
      } else if (txType === "repay") {
        if (tokenSymbol === "ETH") {
          const currentBorrowed = new BigDecimal(whale.aaveBorrowedETH.toString());
          const newBorrowed = currentBorrowed.minus(absAmountDecimal);
          updatedWhale = {
            ...updatedWhale,
            aaveBorrowedETH: newBorrowed.isLessThan(new BigDecimal(0)) 
              ? new BigDecimal(0) 
              : newBorrowed,
          };
        } else if (tokenSymbol === "USDC") {
          const currentBorrowed = new BigDecimal(whale.aaveBorrowedUSDC.toString());
          const newBorrowed = currentBorrowed.minus(absAmountDecimal);
          updatedWhale = {
            ...updatedWhale,
            aaveBorrowedUSDC: newBorrowed.isLessThan(new BigDecimal(0)) 
              ? new BigDecimal(0) 
              : newBorrowed,
          };
        }
      }
      break;
      
    case PROTOCOL_LIDO:
      if (txType === "stake") {
        const currentStaked = new BigDecimal(whale.lidoStakedETH.toString());
        const newStaked = currentStaked.plus(absAmountDecimal);
        
        const currentLargest = new BigDecimal(whale.largestTransactionETH.toString());
        const newLargest = absAmountDecimal.isGreaterThan(currentLargest) 
          ? absAmountDecimal 
          : currentLargest;
        
        updatedWhale = {
          ...updatedWhale,
          lidoStakeCount: whale.lidoStakeCount + 1,
          lidoStakedETH: newStaked,
          largestTransactionETH: newLargest,
        };
      }
      break;
      
    case PROTOCOL_CURVE:
      if (txType === "swap") {
        updatedWhale = {
          ...updatedWhale,
          curveSwapCount: whale.curveSwapCount + 1,
        };
        
        if (tokenSymbol === "ETH") {
          const currentVolume = new BigDecimal(whale.curveVolumeETH.toString());
          const newVolume = currentVolume.plus(absAmountDecimal);
          
          const currentLargest = new BigDecimal(whale.largestTransactionETH.toString());
          const newLargest = absAmountDecimal.isGreaterThan(currentLargest) 
            ? absAmountDecimal 
            : currentLargest;
          
          updatedWhale = {
            ...updatedWhale,
            curveVolumeETH: newVolume,
            largestTransactionETH: newLargest,
          };
        } else if (tokenSymbol === "USDC") {
          const currentVolume = new BigDecimal(whale.curveVolumeUSDC.toString());
          updatedWhale = {
            ...updatedWhale,
            curveVolumeUSDC: currentVolume.plus(absAmountDecimal),
          };
        }
      }
      break;
      
    case PROTOCOL_MAKER:
      if (txType === "vault_open") {
        updatedWhale = {
          ...updatedWhale,
          makerVaultCount: whale.makerVaultCount + 1,
        };
      }
      // Note: For Maker, collateral and debt tracking would require
      // decoding the LogNote data, which is complex
      break;
  }
  
  // Save updated whale
  context.MultiProtocolWhale.set(updatedWhale);
}

/**
 * Detect when capital flows between different protocols
 * Looks for withdraw from Protocol A followed by deposit to Protocol B
 */
export async function detectCrossProtocolFlow(
  currentTx: any, // Can be AaveTransaction, LidoTransaction, CurveTransaction, etc.
  wallet: string,
  currentProtocol: string,
  timestamp: bigint,
  context: any
): Promise<void> {
  // Only check for deposits/supplies/stakes (inbound transactions)
  const isInbound = 
    currentTx.txType === "supply" || 
    currentTx.txType === "stake" || 
    currentTx.txType === "add_liquidity" ||
    currentTx.txType === "deposit";
  
  if (!isInbound) return;
  
  // TODO: Implement cross-protocol flow detection
  // This requires complex queries that may not be supported in the current Envio version
  // For now, we skip this feature to avoid runtime errors
  return;
  
  // Unreachable code below - kept for future implementation
  /*
  const allRecentTxs: any[] = [];
  
  for (const prevTx of allRecentTxs) {
    // Skip if same protocol
    if (prevTx.protocol === currentProtocol) continue;
    
    // Check if previous transaction is a withdrawal/outbound
    const isOutbound = 
      prevTx.txType === "withdraw" || 
      prevTx.txType === "remove_liquidity" ||
      prevTx.txType === "transfer"; // For Lido transfers
    
    if (!isOutbound) continue;
    
    // Check if same token type (simplified - you might want more sophisticated matching)
    const currentToken = currentTx.reserve || currentTx.token0 || "ETH";
    const prevToken = prevTx.reserve || prevTx.token0 || "ETH";
    const currentSymbol = getTokenSymbol(currentToken);
    const prevSymbol = getTokenSymbol(prevToken);
    
    // Only consider flows of the same token
    if (currentSymbol !== prevSymbol) continue;
    
    // Calculate time delta
    const timeDelta = Number(timestamp - prevTx.timestamp);
    
    // Found a capital flow!
    const flowId = `${prevTx.transactionHash}-${currentTx.transactionHash}`;
    
    // Determine flow type based on time and protocols involved
    let flowType = "rebalancing";
    
    if (timeDelta < 60) {
      flowType = "arbitrage"; // Very fast = likely arbitrage
    } else if (
      (prevTx.protocol === PROTOCOL_AAVE || currentProtocol === PROTOCOL_AAVE) &&
      (prevTx.protocol === PROTOCOL_CURVE || currentProtocol === PROTOCOL_CURVE)
    ) {
      flowType = "yield_farming"; // Moving between lending and liquidity
    } else if (
      prevTx.protocol === PROTOCOL_LIDO || currentProtocol === PROTOCOL_LIDO
    ) {
      flowType = "liquidity_rebalancing"; // Involving liquid staking
    }
    
    // Get amount (use current transaction amount as reference)
    const amount = new BigDecimal(currentTx.amount.toString());
    
    // Create capital flow entity
    const flow: CrossProtocolFlow = {
      id: flowId,
      wallet: wallet,
      fromProtocol: prevTx.protocol,
      fromPoolOrReserve: prevTx.poolId || prevTx.reserve || prevTx.vaultId || "unknown",
      toProtocol: currentProtocol,
      toPoolOrReserve: currentTx.poolId || currentTx.reserve || currentTx.vaultId || "unknown",
      tokenAddress: currentToken,
      tokenSymbol: currentSymbol,
      amount: amount,
      timestamp: timestamp,
      timeDelta: timeDelta,
      flowType: flowType,
      fromTxHash: prevTx.transactionHash,
      toTxHash: currentTx.transactionHash,
    };
    
    context.CrossProtocolFlow.set(flow);
    
    // Update whale's cross-protocol flow count
    const whale = context.MultiProtocolWhale.get(wallet);
    if (whale) {
      context.MultiProtocolWhale.set({
        ...whale,
        crossProtocolFlows: whale.crossProtocolFlows + 1,
      });
    }
    
    // Only record the first matching flow
    break;
  }
  */
}

/**
 * Helper to determine which protocol a transaction belongs to
 */
export function getTransactionProtocol(tx: any): string {
  // Check which fields are present to determine protocol
  if (tx.poolId) {
    // Check if it's a Uniswap pool ID or Curve pool ID
    if (tx.poolId.startsWith("0x") && tx.poolId.length === 66) {
      return PROTOCOL_UNISWAP; // Uniswap V4 uses bytes32 pool IDs
    } else {
      return PROTOCOL_CURVE; // Curve uses address pool IDs
    }
  } else if (tx.reserve) {
    return PROTOCOL_AAVE; // Aave transactions have reserve field
  } else if (tx.vaultId) {
    return PROTOCOL_MAKER; // Maker transactions have vaultId
  } else if (tx.referral !== undefined) {
    return PROTOCOL_LIDO; // Lido stakes have referral field
  }
  
  return "unknown";
}

/**
 * Query helper to get recent transactions across all protocols
 */
export async function getRecentTransactionsForWallet(
  wallet: string,
  windowStart: bigint,
  context: any
): Promise<any[]> {
  const [aave, lido, curve, maker, uniswap] = await Promise.all([
    context.AaveTransaction.getWhere.user.eq(wallet).timestamp.gte(windowStart).limit(10),
    context.LidoTransaction.getWhere.from.eq(wallet).timestamp.gte(windowStart).limit(10),
    context.CurveTransaction.getWhere.user.eq(wallet).timestamp.gte(windowStart).limit(10),
    context.MakerTransaction.getWhere.owner.eq(wallet).timestamp.gte(windowStart).limit(10),
    context.Transaction.getWhere.sender.eq(wallet).timestamp.gte(windowStart).limit(10),
  ]);
  
  return [
    ...aave.map((tx: any) => ({ ...tx, protocol: PROTOCOL_AAVE })),
    ...lido.map((tx: any) => ({ ...tx, protocol: PROTOCOL_LIDO })),
    ...curve.map((tx: any) => ({ ...tx, protocol: PROTOCOL_CURVE })),
    ...maker.map((tx: any) => ({ ...tx, protocol: PROTOCOL_MAKER })),
    ...uniswap.map((tx: any) => ({ ...tx, protocol: PROTOCOL_UNISWAP })),
  ];
}