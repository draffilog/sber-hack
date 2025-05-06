import axios from 'axios';

// DeFi Llama API base URL
const API_BASE_URL = 'https://stablecoins.llama.fi';

/**
 * Stablecoin data interface
 */
export interface Stablecoin {
  id: string;
  name: string;
  symbol: string;
  pegType: string;
  pegMechanism: string;
  circulating: number;
  price: number;
  circulatingPrevDay: number;
  circulatingPrevWeek: number;
  circulatingPrevMonth: number;
  delisted: boolean;
}

/**
 * Stablecoin historical data point
 */
export interface StablecoinDataPoint {
  date: number;
  totalCirculating: number;
  totalCirculatingUSD: number;
  pegDeviation: number;
}

/**
 * Stablecoin chain data
 */
export interface StablecoinChainData {
  [chain: string]: {
    circulating: number;
    circulatingPrevDay: number;
    circulatingPrevWeek: number;
    circulatingPrevMonth: number;
    breakdown: {
      [assetId: string]: number;
    }
  }
}

/**
 * Service for fetching stablecoin data from DeFi Llama
 */
class StablecoinsService {
  /**
   * Get a list of all stablecoins
   */
  async getAllStablecoins(): Promise<Stablecoin[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stablecoins`);
      return response.data.peggedAssets;
    } catch (error) {
      console.error('Error fetching stablecoins:', error);
      throw error;
    }
  }

  /**
   * Get detailed data for a specific stablecoin by ID
   */
  async getStablecoinById(stablecoinId: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stablecoin/${stablecoinId}`);
      
      if (!response.data || Object.keys(response.data).length === 0) {
        throw new Error(`No data returned for stablecoin ${stablecoinId}`);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching stablecoin ${stablecoinId}:`, error);
      
      // Create a minimal fallback object with the stablecoin ID
      // This ensures the UI can continue to function even with API failures
      return {
        id: stablecoinId,
        name: `Stablecoin ${stablecoinId}`,
        symbol: 'STBL',
        price: 1,
        circulating: 0,
        circulatingPrevDay: 0,
        circulatingPrevWeek: 0,
        circulatingPrevMonth: 0,
        pegMechanism: 'unknown',
        pegType: 'unknown',
        prices: []
      };
    }
  }

  /**
   * Get historical data for all stablecoins
   */
  async getStablecoinsHistoricalData(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stablecoincharts/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stablecoins historical data:', error);
      throw error;
    }
  }

  /**
   * Get historical data for stablecoins on a specific chain
   */
  async getStablecoinsHistoricalDataByChain(chain: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stablecoincharts/${chain}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stablecoins historical data for ${chain}:`, error);
      throw error;
    }
  }

  /**
   * Get overview of stablecoins across different chains
   */
  async getStablecoinsChainOverview(): Promise<StablecoinChainData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stablecoinchains`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stablecoins chain overview:', error);
      throw error;
    }
  }

  /**
   * Get historical price data for stablecoins
   */
  async getStablecoinsHistoricalPrices(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stablecoinprices`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stablecoins historical prices:', error);
      throw error;
    }
  }

  /**
   * Get top stablecoins by market cap
   */
  async getTopStablecoins(limit: number = 10): Promise<Stablecoin[]> {
    try {
      const stablecoins = await this.getAllStablecoins();
      return stablecoins
        .filter(coin => !coin.delisted) // Filter out delisted stablecoins
        .sort((a, b) => b.circulating - a.circulating) // Sort by circulating supply
        .slice(0, limit); // Take only the top N
    } catch (error) {
      console.error('Error fetching top stablecoins:', error);
      throw error;
    }
  }

  /**
   * Get stability metrics for a stablecoin
   * Calculates metrics like price volatility, peg deviation, and market cap changes
   */
  async getStablecoinStabilityMetrics(stablecoinId: string): Promise<any> {
    try {
      const data = await this.getStablecoinById(stablecoinId);
      
      // Extract the historical price data
      const historicalData = data.prices || [];
      
      // Default metrics in case of missing data
      let volatility = 0;
      let avgPegDeviation = 0;
      let dayChange = 0;
      let weekChange = 0;
      let monthChange = 0;
      
      // Calculate price volatility (standard deviation of price) only if we have price data
      if (historicalData.length > 0) {
        const prices = historicalData.map((dataPoint: any) => dataPoint.price || 1);
        const avgPrice = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;
        const variance = prices.reduce((sum: number, price: number) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
        volatility = Math.sqrt(variance || 0);
        
        // Calculate average peg deviation
        const pegDeviations = historicalData.map((dataPoint: any) => Math.abs((dataPoint.price || 1) - 1));
        avgPegDeviation = pegDeviations.reduce((sum: number, dev: number) => sum + dev, 0) / pegDeviations.length;
      }
      
      // Calculate market cap changes
      const currentCirculating = data.circulating || 0;
      const prevDayCirculating = data.circulatingPrevDay || currentCirculating;
      const prevWeekCirculating = data.circulatingPrevWeek || currentCirculating;
      const prevMonthCirculating = data.circulatingPrevMonth || currentCirculating;
      
      // Prevent division by zero
      if (prevDayCirculating > 0) {
        dayChange = ((currentCirculating - prevDayCirculating) / prevDayCirculating) * 100;
      }
      if (prevWeekCirculating > 0) {
        weekChange = ((currentCirculating - prevWeekCirculating) / prevWeekCirculating) * 100;
      }
      if (prevMonthCirculating > 0) {
        monthChange = ((currentCirculating - prevMonthCirculating) / prevMonthCirculating) * 100;
      }
      
      return {
        id: stablecoinId,
        name: data.name || `Stablecoin ${stablecoinId}`,
        symbol: data.symbol || 'STBL',
        currentPrice: data.price || 1,
        currentCirculating: currentCirculating,
        metrics: {
          volatility,
          avgPegDeviation,
          dayChange,
          weekChange,
          monthChange,
        },
        pegMechanism: data.pegMechanism || 'unknown',
        pegType: data.pegType || 'unknown',
      };
    } catch (error) {
      console.error(`Error calculating stability metrics for ${stablecoinId}:`, error);
      
      // Return a minimal object with default values to prevent UI failures
      return {
        id: stablecoinId,
        name: `Stablecoin ${stablecoinId}`,
        symbol: 'STBL',
        currentPrice: 1,
        currentCirculating: 0,
        metrics: {
          volatility: 0,
          avgPegDeviation: 0,
          dayChange: 0,
          weekChange: 0,
          monthChange: 0,
        },
        pegMechanism: 'unknown',
        pegType: 'unknown',
      };
    }
  }
}

export const stablecoinsService = new StablecoinsService(); 