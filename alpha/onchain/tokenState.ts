import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'wagmi/chains';
import { getCurrentChain } from '../components/Web3Provider';
import { higherrrrrrrAbi } from './generated';

// Create public client
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://base-mainnet.g.alchemy.com/v2/l0XzuD715Z-zd21ie5dbpLKrptTuq07a')
});

export interface PriceLevel {
  price: string;
  name: string;
}

export interface TokenState {
  name: string;
  symbol: string;
  totalSupply: string;
  currentPrice: string;
  maxSupply: string;
  priceLevels: PriceLevel[];
  currentName: string;
  marketType: number;
  bondingCurve: string;
  convictionNFT: string;
  CONVICTION_THRESHOLD: string;
  MIN_ORDER_SIZE: string;
  TOTAL_FEE_BPS: number;
  MAX_TOTAL_SUPPLY: string;
  poolAddress: string;
}

// Simple pool ABI for just getting price
const PoolABI = [
  {
    "inputs": [],
    "name": "slot0",
    "outputs": [
      { "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" },
      { "internalType": "int24", "name": "tick", "type": "int24" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export async function getTokenState(tokenAddress: string): Promise<TokenState> {
  console.log('Getting state for token:', tokenAddress);
  
  try {
    // Get token data
    const [name, symbol, totalSupply, currentPrice, maxSupply, marketType, bondingCurve, convictionNFT, 
           convictionThreshold, minOrderSize, totalFeeBps, poolAddress] = await publicClient.multicall({
      contracts: [
        {
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'name'
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'symbol'
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'totalSupply'
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'getCurrentPrice'
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'MAX_TOTAL_SUPPLY'
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'marketType'
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'bondingCurve'
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'convictionNFT'
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'CONVICTION_THRESHOLD'
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'MIN_ORDER_SIZE'
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'TOTAL_FEE_BPS'
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'poolAddress'
        }
      ]
    });

    // Get price levels
    const priceLevels: PriceLevel[] = [];
    let levelIndex = 0;
    while (levelIndex < 20) {
      try {
        const level = await publicClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: higherrrrrrrAbi,
          functionName: 'priceLevels',
          args: [BigInt(levelIndex)]
        });
        if (!level || !level[1]) break;
        priceLevels.push({
          price: formatEther(level[0]),
          name: level[1]
        });
        levelIndex++;
      } catch {
        break;
      }
    }

    return {
      name: name.result?.toString() || '',
      symbol: symbol.result?.toString() || '',
      totalSupply: formatEther(totalSupply.result || BigInt(0)),
      currentPrice: formatEther(currentPrice.result || BigInt(0)),
      maxSupply: formatEther(maxSupply.result || BigInt(0)),
      marketType: Number(marketType.result || 0),
      bondingCurve: bondingCurve.result?.toString() || '',
      convictionNFT: convictionNFT.result?.toString() || '',
      CONVICTION_THRESHOLD: formatEther(convictionThreshold.result || BigInt(0)),
      MIN_ORDER_SIZE: formatEther(minOrderSize.result || BigInt(0)),
      TOTAL_FEE_BPS: Number(totalFeeBps.result || 0),
      poolAddress: poolAddress.result?.toString() || '',
      priceLevels,
      currentName: name.result?.toString() || '',
      MAX_TOTAL_SUPPLY: formatEther(maxSupply.result || BigInt(0))
    };
  } catch (error) {
    console.error('Error getting token state:', error);
    throw error;
  }
}

export async function getTokenStates(tokenAddresses: string[]): Promise<{ [key: string]: TokenState }> {
  console.log('Fetching states for tokens:', tokenAddresses);
  
  // Create array of promises for each token state
  const statePromises = tokenAddresses.map(async (address) => {
    try {
      const state = await getTokenState(address);
      return { address, state };
    } catch (error) {
      console.error(`Error getting state for token ${address}:`, error);
      return { address, error };
    }
  });

  // Wait for all promises to resolve
  const results = await Promise.all(statePromises);

  // Combine results into state object
  const states: { [key: string]: TokenState } = {};
  results.forEach(({ address, state, error }) => {
    if (state && !error) {
      states[address] = state;
    }
  });

  console.log('Fetched all token states:', states);
  return states;
}

export function getProgressToNextLevel(state: TokenState): number {
  if (!state || !state.priceLevels || !state.currentPrice) return 0;

  // Find current level index
  const currentLevelIndex = state.priceLevels.findIndex(level => level.name === state.currentName);
  if (currentLevelIndex === -1 || currentLevelIndex === state.priceLevels.length - 1) return 0;

  // Get current and next level prices
  const currentLevelPrice = parseFloat(state.priceLevels[currentLevelIndex].price);
  const nextLevelPrice = parseFloat(state.priceLevels[currentLevelIndex + 1].price);
  const currentPrice = parseFloat(state.currentPrice);

  // Calculate progress percentage
  const priceDifference = nextLevelPrice - currentLevelPrice;
  const currentProgress = currentPrice - currentLevelPrice;
  
  if (priceDifference <= 0) return 0;
  
  const progressPercentage = (currentProgress / priceDifference) * 100;
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, progressPercentage));
}

export async function getUniswapQuote(
  tokenAddress: string,
  poolAddress: string,
  tokenAmount: bigint,
  isBuy: boolean
): Promise<bigint> {
  try {
    console.log('Getting quote for amount:', tokenAmount.toString());
    // Get current price from pool
    const slot0 = await publicClient.readContract({
      address: poolAddress as `0x${string}`,
      abi: PoolABI,
      functionName: 'slot0'
    });

    const sqrtPriceX96 = BigInt(slot0[0].toString());
    console.log('sqrtPriceX96:', sqrtPriceX96.toString());

    // Calculate price with proper scaling
    const Q96 = BigInt('79228162514264337593543950336'); // 2^96
    const PRECISION = BigInt('1000000000000000000'); // 10^18

    if (isBuy) {
      // For buying: amount * sqrtPrice^2 / 2^192
      const numerator = tokenAmount * sqrtPriceX96 * sqrtPriceX96;
      const denominator = Q96 * Q96;
      const quote = numerator / denominator;
      
      console.log('Buy quote calculation:', {
        numerator: numerator.toString(),
        denominator: denominator.toString(),
        quote: quote.toString()
      });

      if (quote <= 0n) {
        throw new Error('Invalid quote calculation');
      }

      return quote;
    } else {
      // For selling: amount * 2^192 / sqrtPrice^2
      const numerator = tokenAmount * Q96 * Q96;
      const denominator = sqrtPriceX96 * sqrtPriceX96;
      const quote = numerator / denominator;

      console.log('Sell quote calculation:', {
        numerator: numerator.toString(),
        denominator: denominator.toString(),
        quote: quote.toString()
      });

      if (quote <= 0n) {
        throw new Error('Invalid quote calculation');
      }

      return quote;
    }

  } catch (error) {
    console.error('Pool quote error:', error);
    throw error;
  }
}

// Rest of the file stays the same... 