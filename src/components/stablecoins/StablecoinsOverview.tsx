import React, { useState, useCallback } from 'react';
import { useStablecoins } from '../../context/StablecoinsContext';
import { Loader2, TrendingUp, TrendingDown, DollarSign, ArrowRight } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

export const StablecoinsOverview: React.FC = () => {
  const { 
    topStablecoins, 
    isLoading, 
    error, 
    selectStablecoin, 
    fetchStablecoinDetails 
  } = useStablecoins();
  
  const [selectedChain, setSelectedChain] = useState<string>('all');
  
  const handleStablecoinSelect = useCallback(async (stablecoinId: string) => {
    selectStablecoin(stablecoinId);
    fetchStablecoinDetails(stablecoinId);
  }, [selectStablecoin, fetchStablecoinDetails]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <span className="ml-2 text-gray-400">Loading stablecoins data...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
        <p>Error loading stablecoins: {error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Top Stablecoins</h2>
        
        <div className="flex items-center space-x-2">
          <select 
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
          >
            <option value="all">All Chains</option>
            <option value="ethereum">Ethereum</option>
            <option value="bsc">BNB Chain</option>
            <option value="polygon">Polygon</option>
            <option value="base">Base</option>
          </select>
        </div>
      </div>
      
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-800/50 px-4 py-3 text-sm font-medium text-gray-400">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Market Cap</div>
          <div className="col-span-2">24h Change</div>
          <div className="col-span-2">Peg Type</div>
        </div>
        
        <div className="divide-y divide-gray-800">
          {topStablecoins.map((coin, index) => {
            // Calculate 24h change
            const changePercent = ((coin.circulating - (coin.circulatingPrevDay || coin.circulating)) / 
              (coin.circulatingPrevDay || coin.circulating)) * 100;
            
            // Determine if positive or negative change
            const isPositive = changePercent >= 0;
            
            return (
              <div 
                key={coin.id}
                className="grid grid-cols-12 px-4 py-4 hover:bg-gray-800/30 cursor-pointer transition-colors"
                onClick={() => handleStablecoinSelect(coin.id)}
              >
                <div className="col-span-1 flex items-center text-gray-500">{index + 1}</div>
                <div className="col-span-3 flex items-center">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm mr-3">
                    <DollarSign className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{coin.symbol}</div>
                    <div className="text-xs text-gray-400">{coin.name}</div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center text-white">
                  ${coin.price?.toFixed(4) || '1.0000'}
                </div>
                <div className="col-span-2 flex items-center text-white">
                  ${formatNumber(coin.circulating)}
                </div>
                <div className="col-span-2 flex items-center">
                  <span className={`flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {Math.abs(changePercent).toFixed(2)}%
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="bg-cyan-500/10 text-cyan-400 rounded-full px-3 py-1 text-xs">
                    {coin.pegType}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-center mt-4">
        <button className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
          <span>View All Stablecoins</span>
          <ArrowRight className="ml-1 w-4 h-4" />
        </button>
      </div>
    </div>
  );
}; 