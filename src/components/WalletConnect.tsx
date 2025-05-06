import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { ConnectionStatus } from '../services/blockchain';
import { Wallet, X, Loader2, AlertCircle } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const { connectionState, connectWallet, disconnect } = useBlockchain();
  const [showError, setShowError] = useState<boolean>(false);
  
  const handleConnect = async () => {
    try {
      setShowError(false);
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setShowError(true);
    }
  };
  
  const handleDisconnect = () => {
    try {
      disconnect();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };
  
  const renderError = () => {
    if (!showError || connectionState.status !== ConnectionStatus.ERROR) return null;
    
    return (
      <div className="absolute top-full mt-2 right-0 bg-red-900/90 text-white p-3 rounded-lg shadow-lg text-sm max-w-xs">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Wallet Connection Error</p>
            <p className="text-red-200 text-xs mt-1">
              {connectionState.error?.message || 'Could not connect to wallet. Please make sure you have MetaMask installed and try again.'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowError(false)}
          className="absolute top-1 right-1 text-red-200 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
    );
  };
  
  const renderConnectButton = () => {
    switch (connectionState.status) {
      case ConnectionStatus.DISCONNECTED:
        return (
          <button 
            onClick={handleConnect}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition-all"
          >
            <Wallet size={18} />
            Connect Wallet
          </button>
        );
      
      case ConnectionStatus.CONNECTING:
        return (
          <button 
            disabled
            className="flex items-center gap-2 bg-cyan-500/50 text-gray-900 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
          >
            <Loader2 size={18} className="animate-spin" />
            Connecting...
          </button>
        );
      
      case ConnectionStatus.CONNECTED:
        return (
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-lg font-mono text-sm">
              {connectionState.account?.slice(0, 6)}...{connectionState.account?.slice(-4)}
            </span>
            <button 
              onClick={handleDisconnect}
              className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-200 p-2 rounded-lg transition-all"
              title="Disconnect"
            >
              <X size={16} />
            </button>
          </div>
        );
      
      case ConnectionStatus.ERROR:
        return (
          <button 
            onClick={handleConnect}
            className="flex items-center gap-2 bg-red-500/80 hover:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-all"
            title={connectionState.error?.message || 'Connection error'}
          >
            <X size={18} />
            Retry Connection
          </button>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="relative z-20">
      {renderConnectButton()}
      {renderError()}
    </div>
  );
}; 