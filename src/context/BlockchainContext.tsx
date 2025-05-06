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
  ContractOwnership
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
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}; 