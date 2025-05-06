import { Protocol } from '../../types';

interface DefiLlamaProtocol {
  id: string;
  name: string;
  slug: string;
  symbol: string;
  category: string;
  description?: string;
  logo?: string;
  tvl: number;
  chainTvls: {
    [key: string]: number;
  };
  chains: string[];
  change_1d?: number;
  change_7d?: number;
  change_1m?: number;
}

export interface DefiLlamaResponse {
  protocols: DefiLlamaProtocol[];
}

/**
 * Fetches all protocols from DeFi Llama API
 */
export const fetchAllProtocols = async (): Promise<DefiLlamaProtocol[]> => {
  try {
    const response = await fetch('https://api.llama.fi/protocols');
    if (!response.ok) {
      throw new Error(`Error fetching protocols: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching protocols from DeFi Llama:', error);
    return [];
  }
};

/**
 * Fetches details of a specific protocol by slug
 */
export const fetchProtocolDetails = async (slug: string): Promise<any> => {
  try {
    const response = await fetch(`https://api.llama.fi/protocol/${slug}`);
    if (!response.ok) {
      throw new Error(`Error fetching protocol details: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching protocol details for ${slug}:`, error);
    return null;
  }
};

/**
 * Maps DeFi Llama protocols to our application protocol format
 */
export const mapToAppProtocols = (defiLlamaProtocols: DefiLlamaProtocol[]): Protocol[] => {
  // Take only top protocols with highest TVL
  const topProtocols = defiLlamaProtocols
    .filter(p => p.tvl > 0) // Only protocols with TVL
    .sort((a, b) => b.tvl - a.tvl) // Sort by TVL in descending order
    .slice(0, 50); // Take top 50

  return topProtocols.map(p => ({
    id: p.slug,
    name: p.name,
    logo: p.logo || p.slug, // Use logo URL if available, otherwise use slug
    description: p.description || `${p.name} is a ${p.category} protocol with $${formatAmount(p.tvl)} TVL`,
    contracts: [], // Placeholder - would be populated when user selects a protocol
    lastScan: new Date().toISOString().split('T')[0],
    overallScore: Math.floor(Math.random() * 30) + 70, // Placeholder score between 70-100
  }));
};

/**
 * Helper function to format large amounts with B (billions), M (millions), etc.
 */
const formatAmount = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)}B`;
  } else if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`;
  } else if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K`;
  }
  return amount.toFixed(2);
};

/**
 * Gets contract details from DeFi Llama protocol data
 * This function extracts contract addresses from protocol details and prepares them for analysis
 */
export const getProtocolContracts = async (protocolSlug: string, chainId: number = 56): Promise<any[]> => {
  try {
    // Get protocol details from DeFi Llama
    const protocolDetails = await fetchProtocolDetails(protocolSlug);
    
    if (!protocolDetails) {
      throw new Error(`No details found for protocol: ${protocolSlug}`);
    }
    
    // In a real implementation, we would extract actual contract addresses from the protocol details
    // For now, we'll create some mock contract data based on the protocol type
    
    // Categories to contract types mapping
    const categoryToType: Record<string, 'DEX' | 'Lending' | 'Yield' | 'Bridge' | 'Other'> = {
      'Dexes': 'DEX',
      'Lending': 'Lending',
      'Yield': 'Yield',
      'Bridge': 'Bridge',
      'Derivatives': 'Other',
      'CDP': 'Other',
      'Insurance': 'Other',
      'Options': 'Other',
      'Payments': 'Other',
      'Services': 'Other',
    };
    
    // Get the contract type based on the protocol's category
    const contractType = categoryToType[protocolDetails.category] || 'Other';
    
    // Sample addresses for demonstration
    // In a real implementation, these would come from the DeFi Llama data
    // or from a chain explorer API
    let mockContracts = [];
    
    if (contractType === 'DEX') {
      mockContracts = [
        {
          id: `${protocolSlug}-router`,
          name: `${protocolDetails.name} Router`,
          address: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap router on BSC
          type: 'DEX',
          description: `Main router contract for ${protocolDetails.name}`,
          functions: [
            {
              id: 'fn-1',
              name: 'swapExactTokensForTokens',
              description: 'Swap an exact amount of tokens for another token',
              isVulnerable: false,
              hasChanged: true,
              signature: 'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)'
            },
            {
              id: 'fn-2',
              name: 'addLiquidity',
              description: 'Add liquidity to pool',
              isVulnerable: false,
              hasChanged: false,
              signature: 'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline)'
            }
          ],
          securityScore: Math.floor(Math.random() * 20) + 80, // 80-99
          lastUpdated: new Date().toISOString().split('T')[0],
          hasChanges: Math.random() > 0.5,
          connections: []
        },
        {
          id: `${protocolSlug}-factory`,
          name: `${protocolDetails.name} Factory`,
          address: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // PancakeSwap factory on BSC
          type: 'DEX',
          description: `Factory contract for ${protocolDetails.name}`,
          functions: [
            {
              id: 'fn-3',
              name: 'createPair',
              description: 'Create a new liquidity pool',
              isVulnerable: false,
              hasChanged: false,
              signature: 'function createPair(address tokenA, address tokenB) external returns (address pair)'
            }
          ],
          securityScore: Math.floor(Math.random() * 20) + 80, // 80-99
          lastUpdated: new Date().toISOString().split('T')[0],
          hasChanges: Math.random() > 0.8,
          connections: []
        }
      ];
    } else if (contractType === 'Lending') {
      mockContracts = [
        {
          id: `${protocolSlug}-pool`,
          name: `${protocolDetails.name} Lending Pool`,
          address: '0x52D306e36E3B6B02c153d0266ff0f85d18BCD413', // Venus on BSC
          type: 'Lending',
          description: `Main lending pool for ${protocolDetails.name}`,
          functions: [
            {
              id: 'fn-1',
              name: 'deposit',
              description: 'Deposit assets to the lending pool',
              isVulnerable: false,
              hasChanged: false,
              signature: 'function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)'
            },
            {
              id: 'fn-2',
              name: 'borrow',
              description: 'Borrow assets from the lending pool',
              isVulnerable: Math.random() > 0.7,
              hasChanged: true,
              signature: 'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)'
            }
          ],
          securityScore: Math.floor(Math.random() * 20) + 80, // 80-99
          lastUpdated: new Date().toISOString().split('T')[0],
          hasChanges: Math.random() > 0.5,
          connections: []
        }
      ];
    } else {
      // Generic contracts for other types
      mockContracts = [
        {
          id: `${protocolSlug}-main`,
          name: `${protocolDetails.name} Main Contract`,
          address: '0x1234567890123456789012345678901234567890', // Placeholder
          type: contractType,
          description: `Main contract for ${protocolDetails.name}`,
          functions: [
            {
              id: 'fn-1',
              name: 'execute',
              description: 'Execute a function call',
              isVulnerable: Math.random() > 0.8,
              hasChanged: Math.random() > 0.5,
              signature: 'function execute(address target, uint256 value, bytes calldata data)'
            }
          ],
          securityScore: Math.floor(Math.random() * 20) + 80, // 80-99
          lastUpdated: new Date().toISOString().split('T')[0],
          hasChanges: Math.random() > 0.7,
          connections: []
        }
      ];
    }
    
    return mockContracts;
  } catch (error) {
    console.error('Error getting protocol contracts:', error);
    return [];
  }
};

export default {
  fetchAllProtocols,
  fetchProtocolDetails,
  mapToAppProtocols,
  getProtocolContracts,
}; 