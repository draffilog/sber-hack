import React, { useState, useEffect, useRef } from 'react';
import { useStablecoins } from '../../context/StablecoinsContext';
import { StablecoinsOverview } from './StablecoinsOverview';
import { StablecoinDetails } from './StablecoinDetails';
import { Loader2 } from 'lucide-react';

export const StablecoinsPage: React.FC = () => {
  const { isLoading, selectedStablecoin } = useStablecoins();
  const [activeView, setActiveView] = useState<'overview' | 'details'>('overview');
  const didMount = useRef(false);
  
  // Update activeView when a stablecoin is selected, but only once after initial mount
  useEffect(() => {
    if (didMount.current && selectedStablecoin) {
      setActiveView('details');
    } else {
      didMount.current = true;
    }
  }, [selectedStablecoin]);
  
  // Handle back function to reset view
  const handleBackToOverview = () => {
    setActiveView('overview');
    // We don't clear selectedStablecoin here to avoid unnecessary re-fetching
  };
  
  if (isLoading && !selectedStablecoin) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <span className="ml-2 text-gray-400">Loading stablecoins data...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Stablecoins Scanner</h1>
        <p className="text-gray-400 mt-2">
          Analyze stablecoins to understand their stability, risks, and potential impact on your holdings.
        </p>
      </div>
      
      {activeView === 'overview' ? (
        <StablecoinsOverview />
      ) : (
        selectedStablecoin && (
          <StablecoinDetails 
            stablecoinId={selectedStablecoin.id} 
            onBack={handleBackToOverview} 
          />
        )
      )}
    </div>
  );
}; 