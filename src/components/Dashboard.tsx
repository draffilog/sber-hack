import React, { useEffect } from 'react';
import { ArrowLeft, Shield, AlertTriangle, Clock } from 'lucide-react';
import { WalletConnect } from './WalletConnect';
import { useBlockchain } from '../context/BlockchainContext';
import { useProtocol } from '../context/ProtocolContext';
import { ProtocolSelector } from './protocols/ProtocolSelector';
import { ProtocolSummary } from './protocols/ProtocolSummary';
import { contractService } from '../services/blockchain';

export const Dashboard = () => {
  const { connectionState } = useBlockchain();
  const { selectedProtocol, setSelectedProtocol, setSelectedContract } = useProtocol();

  // Function to fetch protocol details when a protocol is selected
  useEffect(() => {
    const fetchProtocolDetails = async () => {
      if (selectedProtocol && selectedProtocol.contracts.length === 0) {
        try {
          // This would be where we fetch detailed data about the selected protocol
          // For now, we'll just log that we would fetch data
          console.log(`Fetching details for ${selectedProtocol.name}...`);
          
          // In a real implementation, we would:
          // 1. Call API to get protocol contracts
          // 2. Call blockchain services to analyze contracts
          // 3. Update the protocol with detailed data
          
          // Just a mock implementation to simulate loading details
          setTimeout(() => {
            // This is just for demonstration - in a real app, we'd fetch real contract data
            if (selectedProtocol.id === 'uniswap' || selectedProtocol.id === 'sushiswap') {
              const mockDexContracts = [
                {
                  id: `${selectedProtocol.id}-router`,
                  name: `${selectedProtocol.name} Router`,
                  address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
                  type: 'DEX',
                  description: `Main router contract for ${selectedProtocol.name}`,
                  functions: [
                    {
                      id: 'fn-1',
                      name: 'swapExactTokensForTokens',
                      description: 'Swap an exact amount of tokens for another token',
                      isVulnerable: false,
                      hasChanged: true,
                      signature: 'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)'
                    }
                  ],
                  securityScore: 92,
                  lastUpdated: new Date().toISOString().split('T')[0],
                  hasChanges: true,
                  connections: []
                }
              ];
              
              // Update protocol with contracts (in a real app we'd use proper state management)
              setSelectedProtocol({
                ...selectedProtocol,
                contracts: mockDexContracts
              });
            }
          }, 1000);
        } catch (error) {
          console.error('Error fetching protocol details:', error);
        }
      }
    };

    fetchProtocolDetails();
  }, [selectedProtocol, setSelectedProtocol]);

  const handleBack = () => {
    setSelectedProtocol(null);
    setSelectedContract(null);
  };

  const isWalletConnected = connectionState.status === 'connected';

  return (
    <div className="container mx-auto px-4 py-8">
      {!isWalletConnected ? (
        <div className="mb-8">
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-800 rounded-xl border border-gray-700">
            <Shield className="h-16 w-16 text-cyan-500 mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h1>
            <p className="text-gray-400 text-center mb-6 max-w-md">
              Connect your wallet to scan and analyze smart contract security on the blockchain.
            </p>
            <WalletConnect />
          </div>
        </div>
      ) : (
        <div>
          {!selectedProtocol ? (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">Select Protocol</h1>
              <p className="text-gray-400 mb-8">
                Choose a DeFi protocol to analyze its smart contracts for security issues and vulnerabilities.
              </p>
              <ProtocolSelector />
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Protocols
                </button>
              </div>

              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-md bg-gray-700 flex items-center justify-center text-cyan-400 mr-4">
                      {typeof selectedProtocol.logo === 'string' && selectedProtocol.logo.startsWith('http') ? (
                        <img src={selectedProtocol.logo} alt={selectedProtocol.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-xl font-bold">{selectedProtocol.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">{selectedProtocol.name}</h1>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-400">Last scanned: {selectedProtocol.lastScan}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-gray-900 px-4 py-2 rounded-lg flex items-center">
                      <div className="mr-2">
                        {selectedProtocol.overallScore >= 90 ? (
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        ) : selectedProtocol.overallScore >= 70 ? (
                          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Security Score</p>
                        <p className="text-white font-bold">{selectedProtocol.overallScore}/100</p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">{selectedProtocol.description}</p>

                {selectedProtocol.contracts.length === 0 ? (
                  <div className="bg-gray-900 p-8 rounded-lg text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-semibold mb-2">Loading Contract Data</h3>
                    <p className="text-gray-400 mb-4">
                      We're analyzing the smart contracts for this protocol. This may take a moment.
                    </p>
                    <div className="w-16 h-1 bg-gray-700 rounded-full mx-auto">
                      <div className="w-1/3 h-1 bg-cyan-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <ProtocolSummary protocol={selectedProtocol} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};