import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { BlockchainNetwork, NETWORK_CONFIGS } from '../types';
import { BaseChainAdapter } from './base';
import { ChainAdapterConfig } from './types';

/**
 * Binance Smart Chain-specific adapter implementation.
 * Extends the base adapter with BSC-specific functionality.
 */
export class BscAdapter extends BaseChainAdapter {
  constructor(
    provider: BrowserProvider | JsonRpcProvider
  ) {
    const config: ChainAdapterConfig = {
      networkConfig: NETWORK_CONFIGS[BlockchainNetwork.BSC],
      provider
    };

    super(config);
  }

  /**
   * Check if the adapter can handle a specific chain ID
   */
  public override isCompatible(chainId: number): boolean {
    // BSC Mainnet (56)
    return chainId === 56;
  }

  /**
   * Get the BSC block time in seconds (approximately)
   * BSC aims for 3-second block times
   */
  public getBlockTime(): number {
    return 3; // seconds
  }

  /**
   * Calculate expected confirmation time based on gas price
   * BSC has more predictable confirmation times due to its consensus mechanism
   * @param gasPriceGwei Gas price in Gwei
   * @returns Estimated confirmation time in seconds
   */
  public estimateConfirmationTime(gasPriceGwei: number): number {
    // BSC is less sensitive to gas price variations
    // Confirmation usually happens within a few blocks
    return 15; // ~5 blocks × 3 seconds
  }

  /**
   * Get the BNB symbol
   */
  public getNativeTokenSymbol(): string {
    return 'BNB';
  }

  /**
   * Check if a transaction requires EIP-1559 fee structure
   */
  public async requiresEip1559Fees(): Promise<boolean> {
    // BSC doesn't use EIP-1559 fee structure (as of implementation)
    return false;
  }
} 