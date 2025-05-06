import React, { useEffect } from 'react';
import { useStablecoins } from '../../context/StablecoinsContext';
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

interface StablecoinDetailsProps {
  stablecoinId: string;
  onBack: () => void;
}

export const StablecoinDetails: React.FC<StablecoinDetailsProps> = ({ stablecoinId, onBack }) => {
  const { 
    selectedStablecoin,
    selectedStablecoinDetails,
    isLoadingDetails,
    error,
    fetchStablecoinDetails
  } = useStablecoins();
  
  // Fetch details only once on component mount
  useEffect(() => {
    // Only fetch if we don't already have details or if they're for a different stablecoin
    if (!selectedStablecoinDetails || selectedStablecoinDetails.id !== stablecoinId) {
      fetchStablecoinDetails(stablecoinId);
    }
    // Only depend on stablecoinId to prevent re-fetching on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stablecoinId]);
  
  if (isLoadingDetails) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <span className="ml-2 text-gray-400">Loading stablecoin details...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
        <p>Error loading stablecoin details: {error}</p>
      </div>
    );
  }
  
  if (!selectedStablecoinDetails) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-400">
        <p>Select a stablecoin to view detailed information</p>
      </div>
    );
  }
  
  const { 
    name, 
    symbol, 
    currentPrice, 
    currentCirculating, 
    metrics, 
    pegMechanism, 
    pegType
  } = selectedStablecoinDetails;
  
  const getStabilityScore = (metrics: any) => {
    // Simple weighted scoring based on volatility and peg deviation
    // Lower volatility and peg deviation = better score
    const volatilityScore = Math.max(0, 100 - metrics.volatility * 1000);
    const pegDeviationScore = Math.max(0, 100 - metrics.avgPegDeviation * 1000);
    
    return Math.round((volatilityScore * 0.7 + pegDeviationScore * 0.3));
  };
  
  const stabilityScore = getStabilityScore(metrics);
  const stabilityColor = 
    stabilityScore >= 90 ? 'text-green-400' :
    stabilityScore >= 75 ? 'text-cyan-400' :
    stabilityScore >= 60 ? 'text-yellow-400' :
    'text-red-400';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          className="flex items-center text-gray-400 hover:text-white transition-colors"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Stablecoins
        </button>
        
        <div className="flex items-center text-gray-400">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{name} ({symbol})</h2>
            <div className="flex items-center mt-2">
              <span className="bg-cyan-500/10 text-cyan-400 rounded-full px-3 py-1 text-xs mr-2">
                {pegType}
              </span>
              <span className="bg-gray-700 text-gray-300 rounded-full px-3 py-1 text-xs">
                {pegMechanism}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-gray-400 text-sm mb-1">Current Price</div>
            <div className="text-2xl font-bold text-white">${currentPrice.toFixed(4)}</div>
            <div className="flex items-center justify-end mt-1">
              {Math.abs(currentPrice - 1) < 0.01 ? (
                <span className="flex items-center text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  On Peg
                </span>
              ) : (
                <span className="flex items-center text-yellow-400 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  ${Math.abs(currentPrice - 1).toFixed(4)} off peg
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Market Cap</div>
            <div className="text-xl font-semibold text-white">${formatNumber(currentCirculating)}</div>
            <div className="flex items-center mt-1 text-sm">
              {metrics.dayChange >= 0 ? (
                <span className="flex items-center text-green-400">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{metrics.dayChange.toFixed(2)}% (24h)
                </span>
              ) : (
                <span className="flex items-center text-red-400">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  {metrics.dayChange.toFixed(2)}% (24h)
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Price Volatility (30d)</div>
            <div className="text-xl font-semibold text-white">{(metrics.volatility * 100).toFixed(4)}%</div>
            <div className="flex items-center mt-1 text-sm text-gray-400">
              Standard deviation of price
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Stability Score</div>
            <div className={`text-xl font-semibold ${stabilityColor}`}>{stabilityScore}/100</div>
            <div className="flex items-center mt-1 text-sm text-gray-400">
              Based on volatility & peg maintenance
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-5 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Stability Impact Analysis</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400">Peg Stability</span>
                <span className="text-white">
                  {metrics.avgPegDeviation < 0.001 ? 'Excellent' : 
                   metrics.avgPegDeviation < 0.005 ? 'Good' : 
                   metrics.avgPegDeviation < 0.01 ? 'Fair' : 'Poor'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full" 
                  style={{ width: `${Math.max(0, 100 - metrics.avgPegDeviation * 10000)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400">Supply Growth</span>
                <span className="text-white">
                  {metrics.monthChange > 10 ? 'Strong' : 
                   metrics.monthChange > 0 ? 'Stable' : 
                   metrics.monthChange > -10 ? 'Declining' : 'Rapidly Declining'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`${metrics.monthChange >= 0 ? 'bg-green-500' : 'bg-red-500'} h-2 rounded-full`}
                  style={{ width: `${Math.min(100, Math.max(0, 50 + metrics.monthChange / 2))}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400">User Impact Prediction</span>
                <span className="text-white">
                  {stabilityScore >= 90 ? 'Low Risk' : 
                   stabilityScore >= 75 ? 'Moderate Risk' : 
                   stabilityScore >= 60 ? 'High Risk' : 'Very High Risk'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`${
                    stabilityScore >= 90 ? 'bg-green-500' : 
                    stabilityScore >= 75 ? 'bg-cyan-500' : 
                    stabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  } h-2 rounded-full`}
                  style={{ width: `${stabilityScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Potential Impact on Users</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-xs mr-2 mt-0.5">
                  1
                </div>
                <span>
                  {metrics.volatility < 0.001 ? 
                    "Highly stable price makes this ideal for payments and storing value." : 
                    "Price fluctuations may affect the reliability for payments."}
                </span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-xs mr-2 mt-0.5">
                  2
                </div>
                <span>
                  {Math.abs(metrics.monthChange) < 5 ? 
                    "Stable market cap indicates strong user confidence." : 
                    metrics.monthChange > 0 ?
                    "Growing market cap shows increasing adoption." :
                    "Declining market cap may indicate reduced confidence."}
                </span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-xs mr-2 mt-0.5">
                  3
                </div>
                <span>
                  {pegMechanism === "algorithmic" ? 
                    "Algorithmic stabilization carries higher risk during market stress." : 
                    pegMechanism === "fiat-backed" ?
                    "Fiat-backing provides strong stability but requires trust in the issuer." :
                    "Crypto-collateralized model balances decentralization with potential volatility."}
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400">Depeg Risk</span>
                  <span className={
                    metrics.avgPegDeviation < 0.001 ? 'text-green-400' : 
                    metrics.avgPegDeviation < 0.005 ? 'text-cyan-400' : 
                    metrics.avgPegDeviation < 0.01 ? 'text-yellow-400' : 'text-red-400'
                  }>
                    {metrics.avgPegDeviation < 0.001 ? 'Very Low' : 
                     metrics.avgPegDeviation < 0.005 ? 'Low' : 
                     metrics.avgPegDeviation < 0.01 ? 'Medium' : 'High'}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400">Collapse Risk</span>
                  <span className={
                    pegMechanism === "fiat-backed" ? 'text-green-400' : 
                    pegMechanism === "crypto-backed" ? 'text-yellow-400' : 
                    'text-red-400'
                  }>
                    {pegMechanism === "fiat-backed" ? 'Low' : 
                     pegMechanism === "crypto-backed" ? 'Medium' : 'High'}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400">Liquidity Risk</span>
                  <span className={
                    currentCirculating > 10000000000 ? 'text-green-400' : 
                    currentCirculating > 1000000000 ? 'text-cyan-400' : 
                    currentCirculating > 100000000 ? 'text-yellow-400' : 'text-red-400'
                  }>
                    {currentCirculating > 10000000000 ? 'Very Low' : 
                     currentCirculating > 1000000000 ? 'Low' : 
                     currentCirculating > 100000000 ? 'Medium' : 'High'}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t border-gray-700">
                <div className="text-white font-medium mb-2">Overall Recommendation</div>
                <p className="text-gray-300">
                  {stabilityScore >= 90 ? 
                    "This stablecoin demonstrates excellent stability and is suitable for most user cases including savings, payments, and DeFi applications." : 
                    stabilityScore >= 75 ?
                    "Good stability with minimal risk. Suitable for most applications, but monitor during extreme market conditions." :
                    stabilityScore >= 60 ?
                    "Exercise caution. This stablecoin has shown some volatility and may not maintain its peg during market stress." :
                    "High risk. Not recommended for storing significant value. Consider alternatives with better stability metrics."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 