import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  BlockchainNetwork, 
  BlockchainProvider as BlockchainProviderType,
  ConnectionState, 
  ConnectionStatus,
  blockchainProviderService,
  contractService,
  ContractMetadata,
  ContractABI,
  ContractSecurityProfile,
  ContractOwnership,
  blockchainCacheService,
  blockchainUtilsService,
  AddressValidationResult,
  GasEstimationOptions
} from '../services/blockchain';
import { ChainAdapter } from '../services/blockchain/networks';

interface BlockchainContextType {
  // Connection state
  connectionState: ConnectionState;
  // Connection methods
  connectWallet: () => Promise<void>;
  connectRpc: (network: BlockchainNetwork) => Promise<void>;
  disconnect: () => void;
  // Network methods
  switchNetwork: (network: BlockchainNetwork) => Promise<boolean>;
  // Adapter access
  adapter: ChainAdapter | null;
  // Provider access
  provider: BlockchainProviderType | null;
  // Contract methods
  getContractCode: (address: string, chainId: number) => Promise<string>;
  getContractABI: (address: string, chainId: number) => Promise<ContractABI>;
  getContractMetadata: (address: string, chainId: number) => Promise<ContractMetadata>;
  detectContractType: (address: string, chainId: number) => Promise<string>;
  getContractSecurityProfile: (address: string, chainId: number) => Promise<ContractSecurityProfile>;
  getContractOwnership: (address: string, chainId: number) => Promise<ContractOwnership>;
  analyzeContractStructure: (abi: any[]) => Promise<{
    functions: any[];
    events: any[];
    stateVariables: any[];
  }>;
  // Cache methods
  clearContractCache: (address?: string, chainId?: number) => void;
  getCacheStats: () => { size: number, hits: number, misses: number, evictions: number };
  // Utility methods
  utils: {
    // Address utilities
    validateAddress: (address: string) => AddressValidationResult;
    formatAddress: (address: string, prefixLength?: number, suffixLength?: number) => string;
    // Value formatting
    formatNumber: (value: number | string, decimals?: number) => string;
    truncateString: (str: string, maxLength?: number) => string;
    formatTimestamp: (timestamp: number) => string;
    // Unit conversions
    weiToEther: (wei: bigint | string) => string;
    etherToWei: (ether: string | number) => bigint;
    weiToGwei: (wei: bigint | string) => string;
    gweiToWei: (gwei: string | number) => bigint;
    // ENS resolution
    resolveAddressToEns: (address: string) => Promise<string | null>;
    resolveEnsToAddress: (ensName: string) => Promise<string | null>;
    // Gas estimation
    estimateGas: (
      to: string,
      data?: string,
      value?: bigint,
      options?: Partial<GasEstimationOptions>
    ) => Promise<GasEstimationOptions>;
    // Error handling
    translateError: (error: any) => Error;
    // Explorer URLs
    getTransactionExplorerUrl: (txHash: string, chainId: number) => string;
    getAddressExplorerUrl: (address: string, chainId: number) => string;
    // Data conversion
    hexToText: (hex: string) => string;
    textToHex: (text: string) => string;
    // Transaction helpers
    formatTxHash: (txHash: string) => string;
    extractMethodSignature: (data: string) => string;
  };
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainContextProvider');
  }
  return context;
};

interface BlockchainContextProviderProps {
  children: ReactNode;
}

export const BlockchainContextProvider = ({ children }: BlockchainContextProviderProps) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    blockchainProviderService.getConnectionState()
  );
  
  const [adapter, setAdapter] = useState<ChainAdapter | null>(
    blockchainProviderService.getAdapter()
  );

  useEffect(() => {
    // Add listener for connection state changes
    blockchainProviderService.addConnectionListener((state) => {
      setConnectionState(state);
      // Update adapter when connection state changes
      setAdapter(blockchainProviderService.getAdapter());
    });
    
    // Clean up listener when component unmounts
    return () => {
      blockchainProviderService.removeConnectionListener(setConnectionState);
    };
  }, []);

  const connectWallet = async () => {
    await blockchainProviderService.connectBrowserWallet();
  };

  const connectRpc = async (network: BlockchainNetwork) => {
    await blockchainProviderService.connectRpcProvider(network);
  };
  
  const switchNetwork = async (network: BlockchainNetwork) => {
    return await blockchainProviderService.switchNetwork(network);
  };

  const disconnect = () => {
    blockchainProviderService.disconnect();
  };

  // Contract service methods
  const getContractCode = async (address: string, chainId: number) => {
    return await contractService.getContractCode(address, chainId);
  };

  const getContractABI = async (address: string, chainId: number) => {
    return await contractService.getContractABI(address, chainId);
  };

  const getContractMetadata = async (address: string, chainId: number) => {
    return await contractService.getContractMetadata(address, chainId);
  };

  const detectContractType = async (address: string, chainId: number) => {
    return await contractService.detectContractType(address, chainId);
  };

  const getContractSecurityProfile = async (address: string, chainId: number) => {
    return await contractService.getContractSecurityProfile(address, chainId);
  };

  const getContractOwnership = async (address: string, chainId: number) => {
    return await contractService.getContractOwnership(address, chainId);
  };

  const analyzeContractStructure = async (abi: any[]) => {
    return await contractService.analyzeContractStructure(abi);
  };

  // Cache methods
  const clearContractCache = (address?: string, chainId?: number) => {
    if (address && chainId) {
      // Clear cache for specific contract
      blockchainCacheService.invalidateForAddress(address);
    } else if (chainId) {
      // Clear cache for specific chain
      blockchainCacheService.invalidateForChain(chainId);
    } else {
      // Clear all contract cache
      blockchainCacheService.invalidate('contract-');
    }
  };

  const getCacheStats = () => {
    return blockchainCacheService.getStats();
  };

  // Utility methods
  const utils = {
    // Address utilities
    validateAddress: blockchainUtilsService.validateAddress.bind(blockchainUtilsService),
    formatAddress: blockchainUtilsService.formatAddress.bind(blockchainUtilsService),
    // Value formatting
    formatNumber: blockchainUtilsService.formatNumber.bind(blockchainUtilsService),
    truncateString: blockchainUtilsService.truncateString.bind(blockchainUtilsService),
    formatTimestamp: blockchainUtilsService.formatTimestamp.bind(blockchainUtilsService),
    // Unit conversions
    weiToEther: blockchainUtilsService.weiToEther.bind(blockchainUtilsService),
    etherToWei: blockchainUtilsService.etherToWei.bind(blockchainUtilsService),
    weiToGwei: blockchainUtilsService.weiToGwei.bind(blockchainUtilsService),
    gweiToWei: blockchainUtilsService.gweiToWei.bind(blockchainUtilsService),
    // ENS resolution
    resolveAddressToEns: blockchainUtilsService.resolveAddressToEns.bind(blockchainUtilsService),
    resolveEnsToAddress: blockchainUtilsService.resolveEnsToAddress.bind(blockchainUtilsService),
    // Gas estimation
    estimateGas: blockchainUtilsService.estimateGas.bind(blockchainUtilsService),
    // Error handling
    translateError: blockchainUtilsService.translateError.bind(blockchainUtilsService),
    // Explorer URLs
    getTransactionExplorerUrl: blockchainUtilsService.getTransactionExplorerUrl.bind(blockchainUtilsService),
    getAddressExplorerUrl: blockchainUtilsService.getAddressExplorerUrl.bind(blockchainUtilsService),
    // Data conversion
    hexToText: blockchainUtilsService.hexToText.bind(blockchainUtilsService),
    textToHex: blockchainUtilsService.textToHex.bind(blockchainUtilsService),
    // Transaction helpers
    formatTxHash: blockchainUtilsService.formatTxHash.bind(blockchainUtilsService),
    extractMethodSignature: blockchainUtilsService.extractMethodSignature.bind(blockchainUtilsService),
  };

  const value = {
    connectionState,
    connectWallet,
    connectRpc,
    disconnect,
    switchNetwork,
    adapter,
    provider: connectionState.provider,
    // Contract methods
    getContractCode,
    getContractABI,
    getContractMetadata,
    detectContractType,
    getContractSecurityProfile,
    getContractOwnership,
    analyzeContractStructure,
    // Cache methods
    clearContractCache,
    getCacheStats,
    // Utility methods
    utils,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}; 