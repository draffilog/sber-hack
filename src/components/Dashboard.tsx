import React from 'react';
import { useProtocol } from '../context/ProtocolContext';
import { ProtocolSelector } from './protocols/ProtocolSelector';
import { ProtocolSummary } from './protocols/ProtocolSummary';
import { ContractList } from './contracts/ContractList';
import { ContractDetails } from './contracts/ContractDetails';
import { StatsGrid } from './stats/StatsGrid';
import { VisualizationCard } from './visualization/VisualizationCard';
import { RecentChanges } from './changes/RecentChanges';
import { WalletConnect } from './WalletConnect';
import { useBlockchain } from '../context/BlockchainContext';
import { ConnectionStatus } from '../services/blockchain';
import { Shield, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
  const { selectedProtocol, selectedContract } = useProtocol();
  const { connectionState } = useBlockchain();
  
  const isConnected = connectionState.status === ConnectionStatus.CONNECTED;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">
            SH1FR Dashboard
          </span>
        </h1>
        <WalletConnect />
      </div>
      
      {!isConnected ? (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-8 text-center">
          <div className="inline-flex items-center bg-cyan-500/10 rounded-full px-4 py-2 mb-4">
            <Shield className="w-4 h-4 text-cyan-400 mr-2" />
            <span className="text-cyan-400 text-sm">Smart Contract Security</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet to Start Scanning</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">
            Connect your wallet to access the full functionality of SH1FR. This allows you to scan and
            analyze your smart contracts for potential security vulnerabilities.
          </p>
          <div className="flex justify-center">
            <WalletConnect />
          </div>
        </div>
      ) : !selectedProtocol ? (
        <div className="mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Select a Protocol to Scan</h2>
            <p className="text-gray-400 mb-4">
              Choose a protocol from the list below to begin scanning its smart contracts for security vulnerabilities.
            </p>
          </div>
          <ProtocolSelector />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <ProtocolSummary protocol={selectedProtocol} />
            </div>
            <div className="lg:col-span-1">
              <StatsGrid />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 mb-4">
                <h2 className="text-lg font-bold text-white mb-2">Smart Contracts</h2>
                <p className="text-gray-400 text-sm mb-0">
                  Select a contract to analyze its security in detail
                </p>
              </div>
              <ContractList contracts={selectedProtocol.contracts} />
            </div>
            <div className="lg:col-span-2">
              {selectedContract ? (
                <ContractDetails contract={selectedContract} />
              ) : (
                <VisualizationCard protocol={selectedProtocol} />
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-bold text-white mb-2">Recent Changes</h2>
              <p className="text-gray-400 text-sm mb-0">
                Monitor recent changes to smart contracts in this protocol
              </p>
            </div>
            <RecentChanges protocolId={selectedProtocol.id} />
          </div>
        </>
      )}
      
      {connectionState.status === ConnectionStatus.ERROR && (
        <div className="fixed bottom-4 right-4 bg-red-900/90 text-white p-4 rounded-lg shadow-lg max-w-md">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Blockchain Connection Error</p>
              <p className="text-red-200 text-sm mt-1">
                {connectionState.error?.message || 'There was an error connecting to the blockchain.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};