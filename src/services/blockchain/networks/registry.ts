import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { 
  BlockchainNetwork, 
  BlockchainProvider, 
  ConnectionStatus, 
  NETWORK_CONFIGS 
} from '../types';
import { BaseChainAdapter } from './base';
import { ChainAdapter } from './types';
import { EthereumAdapter } from './ethereum';
import { BscAdapter } from './bsc';
import { PolygonAdapter } from './polygon';

/**
 * Registry for managing blockchain network adapters.
 * Provides factory methods for creating adapters and manages active adapters.
 */
export class ChainAdapterRegistry {
  private adapters: Map<BlockchainNetwork, ChainAdapter> = new Map();
  
  /**
   * Create an adapter for the specified network
   */
  public createAdapter(
    network: BlockchainNetwork, 
    provider: BlockchainProvider
  ): ChainAdapter {
    // Check if we already have an adapter for this network
    const existingAdapter = this.adapters.get(network);
    if (existingAdapter) {
      return existingAdapter;
    }
    
    // Create a new adapter based on the network type
    let adapter: ChainAdapter;
    
    switch (network) {
      case BlockchainNetwork.ETHEREUM_MAINNET:
      case BlockchainNetwork.ETHEREUM_SEPOLIA:
        adapter = new EthereumAdapter(provider, network);
        break;
        
      case BlockchainNetwork.BSC:
        adapter = new BscAdapter(provider);
        break;
        
      case BlockchainNetwork.POLYGON:
        adapter = new PolygonAdapter(provider);
        break;
        
      case BlockchainNetwork.ARBITRUM:
        // For now, we'll use the base adapter for Arbitrum
        // In a real implementation, we'd create an ArbitrumAdapter
        adapter = new EthereumAdapter(provider, BlockchainNetwork.ETHEREUM_MAINNET);
        console.warn('Using generic Ethereum adapter for Arbitrum. Consider implementing a dedicated ArbitrumAdapter.');
        break;
        
      default:
        throw new Error(`No adapter available for network: ${network}`);
    }
    
    // Initialize the adapter
    adapter.initialize().catch(error => {
      console.error(`Failed to initialize adapter for ${network}:`, error);
    });
    
    // Store the adapter
    this.adapters.set(network, adapter);
    
    return adapter;
  }
  
  /**
   * Get an adapter for the specified network
   * If the adapter doesn't exist, it will be created
   */
  public getAdapter(
    network: BlockchainNetwork, 
    provider: BlockchainProvider
  ): ChainAdapter {
    const adapter = this.adapters.get(network);
    
    if (adapter) {
      return adapter;
    }
    
    return this.createAdapter(network, provider);
  }
  
  /**
   * Find an adapter that can handle the specified chain ID
   */
  public findAdapterForChainId(
    chainId: number, 
    provider: BlockchainProvider
  ): ChainAdapter | null {
    // First check if we have an existing adapter that can handle this chain ID
    for (const adapter of this.adapters.values()) {
      if (adapter.isCompatible(chainId)) {
        return adapter;
      }
    }
    
    // No existing adapter, try to create one based on the chain ID
    // Find the network that matches this chain ID
    for (const [networkKey, config] of Object.entries(NETWORK_CONFIGS)) {
      if (config.chainId === chainId) {
        const network = networkKey as BlockchainNetwork;
        return this.createAdapter(network, provider);
      }
    }
    
    // No adapter available for this chain ID
    return null;
  }
  
  /**
   * Remove an adapter from the registry
   */
  public removeAdapter(network: BlockchainNetwork): void {
    const adapter = this.adapters.get(network);
    
    if (adapter) {
      adapter.disconnect();
      this.adapters.delete(network);
    }
  }
  
  /**
   * Clear all adapters from the registry
   */
  public clearAdapters(): void {
    for (const adapter of this.adapters.values()) {
      adapter.disconnect();
    }
    
    this.adapters.clear();
  }
}

// Create a singleton instance
export const chainAdapterRegistry = new ChainAdapterRegistry(); 