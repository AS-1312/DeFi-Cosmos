import { BigDecimal } from "../generated";

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

/**
 * Detect cross-protocol capital flows
 * Currently disabled due to query API limitations
 */
export async function detectCrossProtocolFlow(
  wallet: string,
  protocol: string,
  amount: bigint,
  timestamp: bigint,
  context: any
): Promise<void> {
  // Query API limitation: Cannot use .limit() after .eq()
  // This feature is disabled until more advanced query support is available
  return;
}
