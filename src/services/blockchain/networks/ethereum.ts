import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { BlockchainNetwork, NetworkConfig, NETWORK_CONFIGS } from '../types';
import { BaseChainAdapter } from './base';
import { ChainAdapterConfig } from './types';

/**
 * Ethereum-specific chain adapter implementation.
 * Extends the base adapter with Ethereum-specific functionality.
 */
export class EthereumAdapter extends BaseChainAdapter {
  constructor(
    provider: BrowserProvider | JsonRpcProvider,
    network: BlockchainNetwork = BlockchainNetwork.ETHEREUM_MAINNET
  ) {
    // Validate that this is an Ethereum network
    if (
      network !== BlockchainNetwork.ETHEREUM_MAINNET && 
      network !== BlockchainNetwork.ETHEREUM_SEPOLIA
    ) {
      throw new Error(`${network} is not an Ethereum network`);
    }

    const config: ChainAdapterConfig = {
      networkConfig: NETWORK_CONFIGS[network],
      provider
    };

    super(config);
  }

  /**
   * Check if the adapter can handle a specific chain ID
   * This is mainly here to demonstrate chain-specific overrides
   */
  public override isCompatible(chainId: number): boolean {
    // Ethereum Mainnet (1) or Sepolia Testnet (11155111)
    return chainId === 1 || chainId === 11155111;
  }

  /**
   * Get the Ethereum block time in seconds (approximately)
   * Ethereum block time is around 12 seconds post-merge
   */
  public getBlockTime(): number {
    return 12; // seconds
  }

  /**
   * Calculate expected confirmation time based on gas price
   * This is an estimate based on network conditions
   * @param gasPriceGwei Gas price in Gwei
   * @returns Estimated confirmation time in seconds
   */
  public estimateConfirmationTime(gasPriceGwei: number): number {
    // Very simplified model:
    // - <30 Gwei: Slow (3-5 minutes)
    // - 30-60 Gwei: Standard (1-3 minutes)
    // - >60 Gwei: Fast (<1 minute)
    if (gasPriceGwei < 30) {
      return 240; // 4 minutes
    } else if (gasPriceGwei < 60) {
      return 120; // 2 minutes
    } else {
      return 30; // 30 seconds
    }
  }

  /**
   * Check if a transaction requires EIP-1559 fee structure
   */
  public async requiresEip1559Fees(): Promise<boolean> {
    // Both Ethereum mainnet and Sepolia support EIP-1559
    return true;
  }
} 