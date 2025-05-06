import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { stablecoinsService, Stablecoin } from '../services/defi/stablecoins';

// Context type definition
interface StablecoinsContextType {
  // Data states
  stablecoins: Stablecoin[];
  selectedStablecoin: Stablecoin | null;
  selectedStablecoinDetails: any | null;
  topStablecoins: Stablecoin[];
  historicalData: any | null;
  chainData: any | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingDetails: boolean;
  
  // Error states
  error: string | null;
  
  // Action methods
  selectStablecoin: (stablecoinId: string) => void;
  fetchStablecoinDetails: (stablecoinId: string) => Promise<void>;
  fetchStablecoinsByChain: (chain: string) => Promise<void>;
}

// Create context with default values
const StablecoinsContext = createContext<StablecoinsContextType>({
  stablecoins: [],
  selectedStablecoin: null,
  selectedStablecoinDetails: null,
  topStablecoins: [],
  historicalData: null,
  chainData: null,
  isLoading: false,
  isLoadingDetails: false,
  error: null,
  selectStablecoin: () => {},
  fetchStablecoinDetails: async () => {},
  fetchStablecoinsByChain: async () => {},
});

interface StablecoinsProviderProps {
  children: ReactNode;
}

// Provider component
export const StablecoinsProvider: React.FC<StablecoinsProviderProps> = ({ children }) => {
  const [stablecoins, setStablecoins] = useState<Stablecoin[]>([]);
  const [selectedStablecoin, setSelectedStablecoin] = useState<Stablecoin | null>(null);
  const [selectedStablecoinDetails, setSelectedStablecoinDetails] = useState<any | null>(null);
  const [topStablecoins, setTopStablecoins] = useState<Stablecoin[]>([]);
  const [historicalData, setHistoricalData] = useState<any | null>(null);
  const [chainData, setChainData] = useState<any | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial stablecoins data
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all stablecoins
        const allStablecoins = await stablecoinsService.getAllStablecoins();
        setStablecoins(allStablecoins);
        
        // Fetch top stablecoins
        const top = await stablecoinsService.getTopStablecoins(10);
        setTopStablecoins(top);
        
        // Fetch chain overview data
        const chainOverview = await stablecoinsService.getStablecoinsChainOverview();
        setChainData(chainOverview);
        
        // Fetch historical data
        const history = await stablecoinsService.getStablecoinsHistoricalData();
        setHistoricalData(history);
      } catch (err) {
        console.error('Error fetching stablecoins data:', err);
        setError('Failed to fetch stablecoins data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Select a stablecoin by ID
  const selectStablecoin = (stablecoinId: string) => {
    const found = stablecoins.find(coin => coin.id === stablecoinId);
    if (found) {
      setSelectedStablecoin(found);
    }
  };

  // Fetch details for a specific stablecoin
  const fetchStablecoinDetails = async (stablecoinId: string) => {
    setIsLoadingDetails(true);
    setError(null);
    
    try {
      const metrics = await stablecoinsService.getStablecoinStabilityMetrics(stablecoinId);
      setSelectedStablecoinDetails(metrics);
    } catch (err) {
      console.error(`Error fetching details for stablecoin ${stablecoinId}:`, err);
      setError(`Failed to fetch details for ${stablecoinId}`);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Fetch stablecoins for a specific chain
  const fetchStablecoinsByChain = async (chain: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const chainHistory = await stablecoinsService.getStablecoinsHistoricalDataByChain(chain);
      setHistoricalData(chainHistory);
    } catch (err) {
      console.error(`Error fetching stablecoins for chain ${chain}:`, err);
      setError(`Failed to fetch stablecoins for ${chain}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    stablecoins,
    selectedStablecoin,
    selectedStablecoinDetails,
    topStablecoins,
    historicalData,
    chainData,
    isLoading,
    isLoadingDetails,
    error,
    selectStablecoin,
    fetchStablecoinDetails,
    fetchStablecoinsByChain,
  };

  return (
    <StablecoinsContext.Provider value={value}>
      {children}
    </StablecoinsContext.Provider>
  );
};

// Custom hook to use the stablecoins context
export const useStablecoins = () => useContext(StablecoinsContext); 