import { BrowserProvider, JsonRpcProvider, Network } from 'ethers';

/**
 * Supported provider types
 */
export type BlockchainProvider = BrowserProvider | JsonRpcProvider;

/**
 * Supported blockchain networks
 */
export enum BlockchainNetwork {
  ETHEREUM_MAINNET = 'ethereum_mainnet',
  ETHEREUM_SEPOLIA = 'ethereum_sepolia',
  POLYGON = 'polygon',
  BSC = 'bsc',
  ARBITRUM = 'arbitrum',
}

/**
 * Network configuration for RPC providers
 */
export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Network configurations mapped by network ID
 */
export const NETWORK_CONFIGS: Record<BlockchainNetwork, NetworkConfig> = {
  [BlockchainNetwork.ETHEREUM_MAINNET]: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [BlockchainNetwork.ETHEREUM_SEPOLIA]: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.io',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [BlockchainNetwork.POLYGON]: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  [BlockchainNetwork.BSC]: {
    name: 'BNB Smart Chain',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  [BlockchainNetwork.ARBITRUM]: {
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorerUrl: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

/**
 * Connection status for blockchain providers
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

/**
 * Connection state for blockchain provider
 */
export interface ConnectionState {
  status: ConnectionStatus;
  account: string | null;
  chainId: number | null;
  network: Network | null;
  provider: BlockchainProvider | null;
  error: Error | null;
} 