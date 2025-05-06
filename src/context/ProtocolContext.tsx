import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Protocol, SmartContract } from '../types';
import { mockProtocols } from '../data/mockData';
import defiLlamaService from '../services/defillama';

interface ProtocolContextType {
  protocols: Protocol[];
  selectedProtocol: Protocol | null;
  selectedContract: SmartContract | null;
  setSelectedProtocol: (protocol: Protocol | null) => void;
  setSelectedContract: (contract: SmartContract | null) => void;
  isLoading: boolean;
  error: string | null;
  filterByChain: (chain: string | null) => void;
  searchProtocols: (query: string) => void;
}

const ProtocolContext = createContext<ProtocolContextType | undefined>(undefined);

export const useProtocol = () => {
  const context = useContext(ProtocolContext);
  if (!context) {
    throw new Error('useProtocol must be used within a ProtocolProvider');
  }
  return context;
};

interface ProtocolProviderProps {
  children: ReactNode;
}

export const ProtocolProvider = ({ children }: ProtocolProviderProps) => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [allProtocols, setAllProtocols] = useState<Protocol[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch protocols from DeFi Llama API
        const defiLlamaProtocols = await defiLlamaService.fetchAllProtocols();
        
        if (defiLlamaProtocols && defiLlamaProtocols.length > 0) {
          // Map DeFi Llama protocols to our app's protocol format
          const mappedProtocols = defiLlamaService.mapToAppProtocols(defiLlamaProtocols);
          setProtocols(mappedProtocols);
          setAllProtocols(mappedProtocols);
        } else {
          // Fallback to mock data if API fails
          console.log('Falling back to mock protocols data');
          setProtocols(mockProtocols);
          setAllProtocols(mockProtocols);
        }
      } catch (err) {
        console.error('Error fetching protocols:', err);
        setError('Failed to load protocols');
        // Fallback to mock data
        setProtocols(mockProtocols);
        setAllProtocols(mockProtocols);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProtocols();
  }, []);
  
  const filterByChain = (chain: string | null) => {
    if (!chain) {
      // If no chain filter, restore all protocols
      setProtocols(allProtocols);
      return;
    }
    
    // Convert chain names to DeFi Llama's chain IDs
    const chainIdMapping: Record<string, string> = {
      'ethereum': 'ethereum',
      'bsc': 'bsc',   // Binance Smart Chain
      'polygon': 'polygon',
      'base': 'base'
    };
    
    const chainId = chainIdMapping[chain];
    
    if (!chainId) {
      setProtocols(allProtocols);
      return;
    }
    
    // Filter protocols by chain support
    // In DeFi Llama, protocols have a "chains" array with chain IDs
    const filtered = allProtocols.filter(protocol => {
      // We can't directly check the "chains" property because we've mapped the protocols
      // to our internal format. In a real implementation, we would store the chains array
      // from DeFi Llama in our protocol objects.
      
      // For now, we'll make a best-effort guess based on protocol ID and name
      const protocolName = protocol.name.toLowerCase();
      const protocolId = protocol.id.toLowerCase();
      
      // Check if protocol name or id contains the chain name
      const containsChainName = protocolName.includes(chain) || protocolId.includes(chain);
      
      // Specific chain-based protocols
      switch (chain) {
        case 'bsc':
          return containsChainName || 
                 protocolName.includes('pancake') || 
                 protocolName.includes('venus') ||
                 protocolName.includes('biswap') ||
                 protocolName.includes('bnb');
        case 'ethereum':
          return containsChainName || 
                 protocolName.includes('uniswap') || 
                 protocolName.includes('aave') ||
                 protocolName.includes('compound') ||
                 protocolName.includes('maker') ||
                 protocolName.includes('curve');
        case 'polygon':
          return containsChainName || 
                 protocolName.includes('quick') || 
                 protocolName.includes('poly') ||
                 protocolName.includes('matic');
        case 'base':
          return containsChainName || 
                 protocolName.includes('base') || 
                 protocolName.includes('aerodrome') ||
                 protocolName.includes('baseswap');
        default:
          return false;
      }
    });
    
    setProtocols(filtered.length > 0 ? filtered : allProtocols);
  };
  
  const searchProtocols = (query: string) => {
    if (!query.trim()) {
      setProtocols(allProtocols);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = allProtocols.filter(
      protocol => 
        protocol.name.toLowerCase().includes(lowercaseQuery) || 
        protocol.description.toLowerCase().includes(lowercaseQuery)
    );
    
    setProtocols(filtered);
  };

  return (
    <ProtocolContext.Provider
      value={{
        protocols,
        selectedProtocol,
        selectedContract,
        setSelectedProtocol,
        setSelectedContract,
        isLoading,
        error,
        filterByChain,
        searchProtocols
      }}
    >
      {children}
    </ProtocolContext.Provider>
  );
};