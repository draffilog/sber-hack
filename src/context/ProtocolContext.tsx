import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Protocol, SmartContract } from '../types';
import { mockProtocols } from '../data/mockData';

interface ProtocolContextType {
  protocols: Protocol[];
  selectedProtocol: Protocol | null;
  selectedContract: SmartContract | null;
  setSelectedProtocol: (protocol: Protocol | null) => void;
  setSelectedContract: (contract: SmartContract | null) => void;
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
  const [protocols] = useState<Protocol[]>(mockProtocols);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);

  return (
    <ProtocolContext.Provider
      value={{
        protocols,
        selectedProtocol,
        selectedContract,
        setSelectedProtocol,
        setSelectedContract,
      }}
    >
      {children}
    </ProtocolContext.Provider>
  );
};