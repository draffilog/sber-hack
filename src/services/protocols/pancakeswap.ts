import { ethers } from 'ethers';
import { contractService } from '../blockchain';

export interface PancakeswapPoolInfo {
  address: string;
  token0: {
    address: string;
    symbol?: string;
    name?: string;
  };
  token1: {
    address: string;
    symbol?: string;
    name?: string;
  };
  fee?: number;
  totalLiquidity?: string;
  tvl?: string;
  reserve0?: string;
  reserve1?: string;
}

export interface PancakeswapRouterInfo {
  address: string;
  factoryAddress?: string;
  version: string;
  owner?: string;
  implementation?: string;
  isProxy: boolean;
}

// Common PancakeSwap contract addresses on BSC
export const PANCAKESWAP_CONTRACTS = {
  BSC: {
    // V2 contracts
    V2_ROUTER: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    V2_FACTORY: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    // V3 contracts
    V3_ROUTER: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
    V3_FACTORY: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    // Other important contracts
    MASTERCHEF_V2: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
    CAKE_TOKEN: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
  }
};

// ABIs for common PancakeSwap contracts
const FACTORY_ABI_FRAGMENT = [
  'function getPair(address tokenA, address tokenB) external view returns (address pair)',
  'function allPairsLength() external view returns (uint256)',
  'function allPairs(uint256) external view returns (address)',
  'function feeTo() external view returns (address)',
  'function feeToSetter() external view returns (address)'
];

const PAIR_ABI_FRAGMENT = [
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function totalSupply() external view returns (uint256)',
  'function factory() external view returns (address)',
  'function kLast() external view returns (uint256)'
];

const ERC20_ABI_FRAGMENT = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address) external view returns (uint256)'
];

export class PancakeswapService {
  // BSC Chain ID
  private readonly BSC_CHAIN_ID = 56;

  /**
   * Analyze a PancakeSwap pool contract
   */
  async analyzePancakeswapPool(poolAddress: string): Promise<PancakeswapPoolInfo> {
    try {
      const provider = this.getProvider();
      
      // Create contract instance for the pool
      const pairContract = new ethers.Contract(poolAddress, PAIR_ABI_FRAGMENT, provider);
      
      // Get token addresses
      const token0Address = await pairContract.token0();
      const token1Address = await pairContract.token1();
      
      // Get pool reserves
      const [reserve0, reserve1] = await pairContract.getReserves();
      
      // Create token contracts
      const token0Contract = new ethers.Contract(token0Address, ERC20_ABI_FRAGMENT, provider);
      const token1Contract = new ethers.Contract(token1Address, ERC20_ABI_FRAGMENT, provider);
      
      // Get token info
      const [
        token0Symbol, 
        token0Name,
        token0Decimals,
        token1Symbol,
        token1Name,
        token1Decimals,
        pairTotalSupply
      ] = await Promise.all([
        token0Contract.symbol().catch(() => 'Unknown'),
        token0Contract.name().catch(() => 'Unknown'),
        token0Contract.decimals().catch(() => 18),
        token1Contract.symbol().catch(() => 'Unknown'),
        token1Contract.name().catch(() => 'Unknown'),
        token1Contract.decimals().catch(() => 18),
        pairContract.totalSupply()
      ]);
      
      // Format reserves with proper decimals
      const formattedReserve0 = ethers.formatUnits(reserve0, token0Decimals);
      const formattedReserve1 = ethers.formatUnits(reserve1, token1Decimals);
      
      // For a proper TVL calculation, we would need price feeds
      // This is just a simplified placeholder
      const poolInfo: PancakeswapPoolInfo = {
        address: poolAddress,
        token0: {
          address: token0Address,
          symbol: token0Symbol,
          name: token0Name,
        },
        token1: {
          address: token1Address,
          symbol: token1Symbol,
          name: token1Name,
        },
        totalLiquidity: ethers.formatEther(pairTotalSupply),
        reserve0: formattedReserve0,
        reserve1: formattedReserve1,
      };
      
      return poolInfo;
    } catch (error) {
      console.error(`Error analyzing PancakeSwap pool ${poolAddress}:`, error);
      // Return minimal info if there's an error
      return {
        address: poolAddress,
        token0: { address: 'Error retrieving' },
        token1: { address: 'Error retrieving' }
      };
    }
  }

  /**
   * Get information about a PancakeSwap router
   */
  async getRouterInfo(routerAddress: string = PANCAKESWAP_CONTRACTS.BSC.V2_ROUTER): Promise<PancakeswapRouterInfo> {
    try {
      // Get contract metadata including proxy status
      const metadata = await contractService.getContractMetadata(routerAddress, this.BSC_CHAIN_ID);
      
      // Determine router version based on address
      let version = 'Unknown';
      if (routerAddress.toLowerCase() === PANCAKESWAP_CONTRACTS.BSC.V2_ROUTER.toLowerCase()) {
        version = 'V2';
      } else if (routerAddress.toLowerCase() === PANCAKESWAP_CONTRACTS.BSC.V3_ROUTER.toLowerCase()) {
        version = 'V3';
      }
      
      // Get ownership info
      const ownershipInfo = await contractService.getContractOwnership(routerAddress, this.BSC_CHAIN_ID);
      
      // Create result
      const routerInfo: PancakeswapRouterInfo = {
        address: routerAddress,
        version,
        isProxy: !!metadata.isProxy,
        implementation: metadata.implementation,
        owner: ownershipInfo.owner,
      };
      
      // Try to get factory address if this is a V2 router
      if (version === 'V2') {
        try {
          const abi = await contractService.getContractABI(routerAddress, this.BSC_CHAIN_ID);
          const provider = this.getProvider();
          const routerContract = new ethers.Contract(routerAddress, abi.abi, provider);
          
          // Try to get factory address - different routers might have different function names
          try {
            if (routerContract.factory) {
              routerInfo.factoryAddress = await routerContract.factory();
            } else if (routerContract.FACTORY) {
              routerInfo.factoryAddress = await routerContract.FACTORY();
            }
          } catch (e) {
            // If we can't get it dynamically, use the known address
            routerInfo.factoryAddress = PANCAKESWAP_CONTRACTS.BSC.V2_FACTORY;
          }
        } catch (e) {
          // If we can't get it dynamically, use the known address
          routerInfo.factoryAddress = PANCAKESWAP_CONTRACTS.BSC.V2_FACTORY;
        }
      }
      
      return routerInfo;
    } catch (error) {
      console.error(`Error analyzing PancakeSwap router ${routerAddress}:`, error);
      return {
        address: routerAddress,
        version: 'Unknown',
        isProxy: false
      };
    }
  }

  /**
   * List recent pools from the factory
   */
  async listRecentPools(limit: number = 10): Promise<PancakeswapPoolInfo[]> {
    try {
      const provider = this.getProvider();
      const factoryAddress = PANCAKESWAP_CONTRACTS.BSC.V2_FACTORY;
      
      // Create factory contract
      const factoryContract = new ethers.Contract(factoryAddress, FACTORY_ABI_FRAGMENT, provider);
      
      // Get total number of pairs
      const totalPairs = await factoryContract.allPairsLength();
      
      // Calculate start index for fetching recent pools
      const startIndex = Math.max(0, Number(totalPairs) - limit);
      const endIndex = Number(totalPairs);
      
      // Prepare array to collect pool addresses
      const poolAddresses = [];
      
      // Fetch the most recent pool addresses
      for (let i = startIndex; i < endIndex; i++) {
        const poolAddress = await factoryContract.allPairs(i);
        poolAddresses.push(poolAddress);
      }
      
      // Analyze each pool
      const poolPromises = poolAddresses.map(address => this.analyzePancakeswapPool(address));
      const pools = await Promise.all(poolPromises);
      
      return pools;
    } catch (error) {
      console.error('Error listing PancakeSwap pools:', error);
      return [];
    }
  }

  /**
   * Get a BSC provider
   */
  private getProvider(): ethers.Provider {
    // Check if provider service has a BSC adapter available
    // Use the public method for getting an adapter
    const adapter = contractService.getAdapterForChain(this.BSC_CHAIN_ID);
    
    if (adapter) {
      return adapter.getProvider();
    }
    
    // Fallback to direct RPC connection
    return new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org');
  }
}

// Create singleton instance
export const pancakeswapService = new PancakeswapService(); 