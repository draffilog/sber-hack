import React, { useState } from 'react';
import { ChevronRight, Search, Filter, Loader2 } from 'lucide-react';
import { useProtocol } from '../../context/ProtocolContext';

export const ProtocolSelector = () => {
  const { 
    protocols, 
    setSelectedProtocol, 
    isLoading, 
    error,
    filterByChain,
    searchProtocols 
  } = useProtocol();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchProtocols(query);
  };
  
  const handleChainFilter = (chain: string | null) => {
    setSelectedChain(chain);
    filterByChain(chain);
  };

  // Chain options
  const chainOptions = [
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'bsc', name: 'BSC' },
    { id: 'polygon', name: 'Polygon' },
    { id: 'base', name: 'Base' }
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-cyan-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading protocols...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-400 mb-2">Error loading protocols</p>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  const getLogoContent = (protocol: any) => {
    // Check if the logo is a URL (starts with http)
    if (typeof protocol.logo === 'string' && protocol.logo.startsWith('http')) {
      return <img src={protocol.logo} alt={protocol.name} className="w-full h-full object-contain" />;
    }
    
    // Otherwise, display first letter of protocol name
    return <span className="text-lg font-bold">{protocol.name.charAt(0)}</span>;
  };

  return (
    <div>
      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Search protocols..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        <div className="relative">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select 
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={selectedChain || ''}
              onChange={(e) => handleChainFilter(e.target.value || null)}
            >
              <option value="">All Chains</option>
              {chainOptions.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {protocols.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400">No protocols found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {protocols.map((protocol) => (
            <div 
              key={protocol.id}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-cyan-500 transition-all hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer group"
              onClick={() => setSelectedProtocol(protocol)}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-md bg-gray-700 flex items-center justify-center text-cyan-400 mr-3">
                    {getLogoContent(protocol)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{protocol.name}</h3>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                      <span className="text-xs text-gray-400">Last scanned: {protocol.lastScan}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{protocol.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="bg-gray-700 px-3 py-1 rounded-full flex items-center">
                    <span className="text-xs font-medium text-white mr-1">Security:</span>
                    <span className={`text-xs font-semibold ${
                      protocol.overallScore >= 90 ? 'text-green-400' : 
                      protocol.overallScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {protocol.overallScore}/100
                    </span>
                  </div>
                  
                  <ChevronRight className="text-gray-500 group-hover:text-cyan-400 transition-colors" size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};