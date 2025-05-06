import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { WalletConnect } from './components/WalletConnect';
import { useBlockchain } from './context/BlockchainContext';
import { useProtocol } from './context/ProtocolContext';
import { ProtocolSelector } from './components/protocols/ProtocolSelector';
import { ProtocolSummary } from './components/protocols/ProtocolSummary';
import { StablecoinsPage } from './components/stablecoins/StablecoinsPage';
import { contractService } from './services/blockchain';
import { defiLlamaService } from './services';

// Dashboard view types
type DashboardView = 'protocols' | 'stablecoins';

export const Dashboard = () => {
  const { connectionState } = useBlockchain();
  const { selectedProtocol, setSelectedProtocol, setSelectedContract } = useProtocol();
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [contractLoadError, setContractLoadError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>('protocols');

  // Function to fetch protocol details when a protocol is selected
  useEffect(() => {
    const fetchProtocolDetails = async () => {
      if (selectedProtocol && selectedProtocol.contracts.length === 0) {
        try {
          setIsLoadingContracts(true);
          setContractLoadError(null);
          
          console.log(`Fetching details for ${selectedProtocol.name}...`);
          
          // Use our DeFi Llama service to get contract details
          // Here we prioritize BSC chain (56) as requested
          const contracts = await defiLlamaService.getProtocolContracts(selectedProtocol.id, 56);
          
          if (contracts.length > 0) {
            // Update protocol with real contract data
            setSelectedProtocol({
              ...selectedProtocol,
              contracts: contracts
            });
          } else {
            // No contracts found
            console.log('No contracts found for this protocol');
          }
        } catch (error) {
          console.error('Error fetching protocol details:', error);
          setContractLoadError('Failed to load contract data for this protocol');
        } finally {
          setIsLoadingContracts(false);
        }
      }
    };

    fetchProtocolDetails();
  }, [selectedProtocol?.id]); // Only re-run if protocol ID changes

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
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-gray-700 mb-8">
            <button
              className={`px-4 py-2 ${
                activeView === 'protocols'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveView('protocols')}
            >
              Protocols
            </button>
            <button
              className={`px-4 py-2 ${
                activeView === 'stablecoins'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveView('stablecoins')}
            >
              Stablecoins
            </button>
          </div>

          {/* View Content */}
          {activeView === 'protocols' ? (
            // Protocols View
            !selectedProtocol ? (
              <div>
                <h1 className="text-2xl font-bold text-white mb-6">Select Protocol</h1>
                <p className="text-gray-400 mb-8">
                  Choose a DeFi protocol to analyze its smart contracts for security issues and vulnerabilities.
                  Protocols are pulled from DeFi Llama and sorted by Total Value Locked (TVL).
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
                      {isLoadingContracts ? (
                        <>
                          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                          <h3 className="text-white text-lg font-semibold mb-2">Loading Contract Data</h3>
                          <p className="text-gray-400 mb-4">
                            We're analyzing the smart contracts for this protocol. This may take a moment.
                          </p>
                          <div className="w-16 h-1 bg-gray-700 rounded-full mx-auto">
                            <div className="w-1/3 h-1 bg-cyan-500 rounded-full animate-pulse"></div>
                          </div>
                        </>
                      ) : contractLoadError ? (
                        <>
                          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                          <h3 className="text-white text-lg font-semibold mb-2">Error Loading Contracts</h3>
                          <p className="text-gray-400 mb-4">{contractLoadError}</p>
                          <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                          >
                            Retry
                          </button>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                          <h3 className="text-white text-lg font-semibold mb-2">No Contracts Found</h3>
                          <p className="text-gray-400 mb-4">
                            We couldn't find any contracts for this protocol. This could be because:
                          </p>
                          <ul className="text-gray-400 text-sm list-disc list-inside mb-4">
                            <li>The contracts are not verified on the blockchain</li>
                            <li>The protocol is new or has limited on-chain presence</li>
                            <li>The protocol's contracts are on a different chain</li>
                          </ul>
                        </>
                      )}
                    </div>
                  ) : (
                    <ProtocolSummary protocol={selectedProtocol} />
                  )}
                </div>
              </div>
            )
          ) : (
            // Stablecoins View
            <StablecoinsPage />
          )}
        </div>
      )}
    </div>
  );
}; 