import { 
  BrowserProvider, 
  JsonRpcProvider, 
  Network, 
  Eip1193Provider 
} from 'ethers';
import { 
  BlockchainNetwork, 
  BlockchainProvider, 
  ConnectionState, 
  ConnectionStatus, 
  NETWORK_CONFIGS 
} from './types';
import { ChainAdapter, chainAdapterRegistry } from './networks';

/**
 * BlockchainProviderService handles connections to different blockchain networks
 * through various provider types (MetaMask, direct RPC, etc.)
 */
export class BlockchainProviderService {
  private provider: BlockchainProvider | null = null;
  private connectionState: ConnectionState = {
    status: ConnectionStatus.DISCONNECTED,
    account: null,
    chainId: null,
    network: null,
    provider: null,
    error: null,
  };
  private connectionListeners: Array<(state: ConnectionState) => void> = [];
  private activeAdapter: ChainAdapter | null = null;

  constructor() {
    // Check if provider is available in browser - but wait until the page is fully loaded
    if (typeof window !== 'undefined') {
      // Wait for the window to fully load before checking for wallet
      window.addEventListener('DOMContentLoaded', () => {
        this.checkForBrowserProvider();
      });
    }
  }

  /**
   * Safely gets the ethereum provider if available
   */
  private getEthereumProvider(): any | null {
    // Safe check for ethereum in window
    if (typeof window === 'undefined') return null;
    
    try {
      // Access ethereum via getter to avoid property setting issues
      return window.ethereum || null;
    } catch (error) {
      console.warn('Error accessing window.ethereum:', error);
      return null;
    }
  }

  /**
   * Checks if a browser provider (MetaMask, etc.) is available
   */
  private async checkForBrowserProvider(): Promise<void> {
    // Check if ethereum is injected into window using the safe getter
    const ethereum = this.getEthereumProvider();
    
    if (ethereum) {
      console.log('Browser wallet detected');
    } else {
      console.log('No browser wallet detected');
    }
  }

  /**
   * Connect to the browser wallet (MetaMask, etc.)
   */
  public async connectBrowserWallet(): Promise<ConnectionState> {
    try {
      this.updateConnectionState({
        status: ConnectionStatus.CONNECTING,
        error: null,
      });

      const ethereum = this.getEthereumProvider();
      if (!ethereum) {
        throw new Error('No browser wallet detected. Please install MetaMask or another Ethereum wallet.');
      }

      // Create provider from window.ethereum
      const browserProvider = new BrowserProvider(ethereum as Eip1193Provider);
      
      try {
        // Request accounts to trigger connection dialog
        const accounts = await browserProvider.send('eth_requestAccounts', []);
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please unlock your wallet and try again.');
        }

        const network = await browserProvider.getNetwork();
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();

        this.provider = browserProvider;

        // Create adapter for this chain
        const chainId = Number(network.chainId);
        this.activeAdapter = chainAdapterRegistry.findAdapterForChainId(chainId, browserProvider);
        
        if (!this.activeAdapter) {
          console.warn(`No adapter available for chain ID ${chainId}. Using direct provider.`);
        }

        this.updateConnectionState({
          status: ConnectionStatus.CONNECTED,
          account: address,
          chainId: chainId,
          network: network,
          provider: browserProvider,
          error: null,
        });

        // Set up event listeners for account and chain changes
        this.setupEventListeners(ethereum);

        return this.connectionState;
      } catch (error) {
        // Handle user rejecting the connection
        if (error instanceof Error && 
            (error.message.includes('user rejected') || 
             error.message.includes('User denied') || 
             error.message.includes('User rejected'))) {
          throw new Error('Connection rejected. Please approve the connection request in your wallet.');
        }
        throw error;
      }
    } catch (error) {
      console.error('Error connecting to browser wallet:', error);
      this.updateConnectionState({
        status: ConnectionStatus.ERROR,
        error: error instanceof Error ? error : new Error('Unknown error connecting to wallet'),
      });
      return this.connectionState;
    }
  }

  /**
   * Connect to a specific network using an RPC provider
   */
  public async connectRpcProvider(network: BlockchainNetwork): Promise<ConnectionState> {
    try {
      this.updateConnectionState({
        status: ConnectionStatus.CONNECTING,
        error: null,
      });

      const networkConfig = NETWORK_CONFIGS[network];
      const rpcProvider = new JsonRpcProvider(networkConfig.rpcUrl);
      
      // Ensure provider is connected with timeout
      try {
        const networkInfo = await Promise.race([
          rpcProvider.getNetwork(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Network connection timeout')), 10000)
          )
        ]);
        
        this.provider = rpcProvider;
        
        // Create adapter for this network
        this.activeAdapter = chainAdapterRegistry.createAdapter(network, rpcProvider);
        
        this.updateConnectionState({
          status: ConnectionStatus.CONNECTED,
          account: null, // RPC providers don't have accounts unless a private key is provided
          chainId: Number(networkInfo.chainId),
          network: networkInfo,
          provider: rpcProvider,
          error: null,
        });
      } catch (error) {
        throw new Error(`Failed to connect to ${networkConfig.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      return this.connectionState;
    } catch (error) {
      console.error(`Error connecting to ${network} via RPC:`, error);
      this.updateConnectionState({
        status: ConnectionStatus.ERROR,
        error: error instanceof Error ? error : new Error(`Unknown error connecting to ${network}`),
      });
      return this.connectionState;
    }
  }

  /**
   * Disconnect from the current provider
   */
  public disconnect(): void {
    if (this.provider) {
      // Remove event listeners if it's a browser provider
      const ethereum = this.getEthereumProvider();
      if (ethereum && this.provider instanceof BrowserProvider) {
        this.removeEventListeners(ethereum);
      }
      
      // Disconnect the active adapter if present
      if (this.activeAdapter) {
        this.activeAdapter.disconnect();
        this.activeAdapter = null;
      }
      
      this.provider = null;
      
      this.updateConnectionState({
        status: ConnectionStatus.DISCONNECTED,
        account: null,
        chainId: null,
        network: null,
        provider: null,
        error: null,
      });
    }
  }

  /**
   * Get the current provider instance
   */
  public getProvider(): BlockchainProvider | null {
    return this.provider;
  }

  /**
   * Get the current connection state
   */
  public getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }
  
  /**
   * Get the active chain adapter
   */
  public getAdapter(): ChainAdapter | null {
    return this.activeAdapter;
  }
  
  /**
   * Switch to a different network
   */
  public async switchNetwork(network: BlockchainNetwork): Promise<boolean> {
    try {
      // If we're not connected, connect to this network
      if (this.connectionState.status !== ConnectionStatus.CONNECTED) {
        await this.connectRpcProvider(network);
        return true;
      }
      
      // If we're connected via browser wallet, request network switch
      if (this.provider instanceof BrowserProvider) {
        const ethereum = this.getEthereumProvider();
        if (!ethereum) {
          throw new Error('Browser provider not available');
        }
        
        const networkConfig = NETWORK_CONFIGS[network];
        
        try {
          // Request wallet to switch to this network
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${networkConfig.chainId.toString(16)}` }],
          });
          
          // Wallet will emit chainChanged event, which we'll handle
          return true;
        } catch (error: any) {
          // If the network is not added to the wallet, add it
          if (error.code === 4902) {
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${networkConfig.chainId.toString(16)}`,
                    chainName: networkConfig.name,
                    nativeCurrency: networkConfig.nativeCurrency,
                    rpcUrls: [networkConfig.rpcUrl],
                    blockExplorerUrls: [networkConfig.blockExplorerUrl],
                  },
                ],
              });
              
              // Try switching again
              await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${networkConfig.chainId.toString(16)}` }],
              });
              
              return true;
            } catch (addError) {
              throw new Error(`Failed to add network: ${addError instanceof Error ? addError.message : 'Unknown error'}`);
            }
          }
          throw error;
        }
      } else {
        // For RPC providers, we need to create a new connection
        await this.connectRpcProvider(network);
        return true;
      }
    } catch (error) {
      console.error(`Error switching to network ${network}:`, error);
      return false;
    }
  }

  /**
   * Add a listener for connection state changes
   */
  public addConnectionListener(listener: (state: ConnectionState) => void): void {
    this.connectionListeners.push(listener);
    // Immediately notify with current state
    listener(this.connectionState);
  }

  /**
   * Remove a connection state listener
   */
  public removeConnectionListener(listener: (state: ConnectionState) => void): void {
    this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
  }

  /**
   * Set up event listeners for the browser wallet
   */
  private setupEventListeners(ethereum: any): void {
    try {
      // Handle account changes
      ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
      
      // Handle chain changes
      ethereum.on('chainChanged', this.handleChainChanged.bind(this));
      
      // Handle disconnection
      ethereum.on('disconnect', this.handleDisconnect.bind(this));
    } catch (error) {
      console.warn('Could not set up wallet event listeners:', error);
    }
  }

  /**
   * Remove event listeners from the browser wallet
   */
  private removeEventListeners(ethereum: any): void {
    try {
      ethereum.removeListener('accountsChanged', this.handleAccountsChanged.bind(this));
      ethereum.removeListener('chainChanged', this.handleChainChanged.bind(this));
      ethereum.removeListener('disconnect', this.handleDisconnect.bind(this));
    } catch (error) {
      console.warn('Could not remove wallet event listeners:', error);
    }
  }

  /**
   * Handle account changes from the browser wallet
   */
  private async handleAccountsChanged(accounts: string[]): Promise<void> {
    if (accounts.length === 0) {
      // User disconnected their wallet
      this.disconnect();
    } else if (this.provider instanceof BrowserProvider) {
      try {
        // Update the active account
        const signer = await this.provider.getSigner();
        const address = await signer.getAddress();
        
        this.updateConnectionState({
          account: address,
        });
      } catch (error) {
        console.error('Error updating account:', error);
      }
    }
  }

  /**
   * Handle chain changes from the browser wallet
   */
  private async handleChainChanged(chainIdHex: string): Promise<void> {
    if (this.provider instanceof BrowserProvider) {
      try {
        const network = await this.provider.getNetwork();
        const chainId = Number(network.chainId);
        
        // Update the chain adapter based on the new network
        if (this.activeAdapter) {
          // Check if current adapter is compatible with the new chain
          if (!this.activeAdapter.isCompatible(chainId)) {
            // Current adapter is not compatible, create a new one
            this.activeAdapter = chainAdapterRegistry.findAdapterForChainId(chainId, this.provider);
          }
        } else {
          // No active adapter, create one
          this.activeAdapter = chainAdapterRegistry.findAdapterForChainId(chainId, this.provider);
        }
        
        this.updateConnectionState({
          chainId: chainId,
          network: network,
        });
      } catch (error) {
        console.error('Error updating chain:', error);
      }
    }
  }

  /**
   * Handle disconnection from the browser wallet
   */
  private handleDisconnect(): void {
    this.disconnect();
  }

  /**
   * Update the connection state and notify listeners
   */
  private updateConnectionState(partialState: Partial<ConnectionState>): void {
    this.connectionState = {
      ...this.connectionState,
      ...partialState,
    };
    
    // Notify all listeners
    this.connectionListeners.forEach(listener => {
      try {
        listener(this.connectionState);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }
}

// Add window.ethereum type for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Create singleton instance
export const blockchainProviderService = new BlockchainProviderService(); 