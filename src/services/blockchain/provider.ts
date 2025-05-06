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

        this.updateConnectionState({
          status: ConnectionStatus.CONNECTED,
          account: address,
          chainId: Number(network.chainId),
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
        
        this.updateConnectionState({
          chainId: Number(network.chainId),
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