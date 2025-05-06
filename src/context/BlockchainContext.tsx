import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  BlockchainNetwork, 
  BlockchainProvider as BlockchainProviderType,
  ConnectionState, 
  ConnectionStatus,
  blockchainProviderService 
} from '../services/blockchain';

interface BlockchainContextType {
  // Connection state
  connectionState: ConnectionState;
  // Connection methods
  connectWallet: () => Promise<void>;
  connectRpc: (network: BlockchainNetwork) => Promise<void>;
  disconnect: () => void;
  // Provider access
  provider: BlockchainProviderType | null;
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

  useEffect(() => {
    // Add listener for connection state changes
    blockchainProviderService.addConnectionListener(setConnectionState);
    
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

  const disconnect = () => {
    blockchainProviderService.disconnect();
  };

  const value = {
    connectionState,
    connectWallet,
    connectRpc,
    disconnect,
    provider: connectionState.provider,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}; 