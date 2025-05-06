import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { BlockchainNetwork, NETWORK_CONFIGS } from '../types';
import { BaseChainAdapter } from './base';
import { ChainAdapterConfig } from './types';

/**
 * Polygon-specific chain adapter implementation.
 * Extends the base adapter with Polygon-specific functionality.
 */
export class PolygonAdapter extends BaseChainAdapter {
  constructor(
    provider: BrowserProvider | JsonRpcProvider
  ) {
    const config: ChainAdapterConfig = {
      networkConfig: NETWORK_CONFIGS[BlockchainNetwork.POLYGON],
      provider
    };

    super(config);
  }

  /**
   * Check if the adapter can handle a specific chain ID
   */
  public override isCompatible(chainId: number): boolean {
    // Polygon Mainnet (137)
    return chainId === 137;
  }

  /**
   * Get the Polygon block time in seconds (approximately)
   * Polygon aims for 2-second block times
   */
  public getBlockTime(): number {
    return 2; // seconds
  }

  /**
   * Calculate expected confirmation time based on gas price
   * Polygon can have variable confirmation times depending on network congestion
   * @param gasPriceGwei Gas price in Gwei
   * @returns Estimated confirmation time in seconds
   */
  public estimateConfirmationTime(gasPriceGwei: number): number {
    // Polygon can experience high congestion periods
    if (gasPriceGwei < 50) {
      return 120; // 2 minutes for low gas price
    } else if (gasPriceGwei < 100) {
      return 60; // 1 minute for medium gas price
    } else {
      return 20; // 20 seconds for high gas price
    }
  }

  /**
   * Get the MATIC symbol
   */
  public getNativeTokenSymbol(): string {
    return 'MATIC';
  }

  /**
   * Check if a transaction requires EIP-1559 fee structure
   */
  public async requiresEip1559Fees(): Promise<boolean> {
    // Polygon supports EIP-1559
    return true;
  }

  /**
   * Get recommended Polygon-specific gas parameters
   * Polygon often requires higher priority fees than Ethereum
   */
  public async getRecommendedPolygonGas(): Promise<{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }> {
    const feeData = await this.provider.getFeeData();
    
    // Polygon often needs higher priority fees for faster confirmation
    let maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || 30000000000n; // 30 Gwei default
    
    // Ensure minimum priority fee of 30 Gwei for reasonable confirmation times
    if (maxPriorityFeePerGas < 30000000000n) {
      maxPriorityFeePerGas = 30000000000n;
    }
    
    // Max fee should be at least the sum of base fee and priority fee
    const maxFeePerGas = feeData.maxFeePerGas || (feeData.gasPrice || 0n) + maxPriorityFeePerGas;
    
    return {
      maxFeePerGas,
      maxPriorityFeePerGas
    };
  }
} 