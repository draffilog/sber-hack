import { ethers } from 'ethers';
import { ChainAdapter } from './networks';
import { blockchainProviderService } from './provider';
import { blockchainCacheService } from './cache';

export interface ContractMetadata {
  name?: string;
  address: string;
  chainId: number;
  creationDate?: Date;
  creator?: string;
  implementation?: string; // For proxy contracts
  isProxy?: boolean;
  contractType?: string; // ERC20, ERC721, DEX, etc.
}

export interface ContractABI {
  abi: any[];
  verified: boolean;
  source?: string; // Where ABI was obtained (explorer, user upload, etc.)
}

export interface ContractSecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: string;
  description: string;
  location?: string; // Function or variable where issue was found
  code?: string; // Relevant code snippet
}

export interface ContractSecurityProfile {
  issues: ContractSecurityIssue[];
  score: number; // 0-100, higher is more secure
  lastUpdated: Date;
}

export interface ContractOwnership {
  owner?: string;
  adminFunctions: string[];
  multisig?: boolean;
  upgradeability?: 'proxy' | 'transparent' | 'uups' | 'beacon' | 'immutable';
}

// Helper function to safely access environment variables in browser context
const getEnvVar = (key: string): string => {
  // In browser environments, import.meta.env is used in Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || '';
  }
  
  // Fallback empty string if environment variables are not accessible
  return '';
};

export class ContractService {
  private explorerApiKeys: Record<number, string> = {
    1: getEnvVar('VITE_ETHERSCAN_API_KEY') || '', // Ethereum Mainnet
    56: getEnvVar('VITE_BSCSCAN_API_KEY') || '',  // BSC
    8453: getEnvVar('VITE_BASESCAN_API_KEY') || '', // Base
  };

  /**
   * Get contract bytecode from the blockchain
   */
  async getContractCode(address: string, chainId: number): Promise<string> {
    // Generate cache key
    const cacheKey = blockchainCacheService.generateKey({
      prefix: 'contract-code',
      address,
      chainId
    });

    // Try to get from cache first
    const cachedCode = blockchainCacheService.get<string>(cacheKey);
    if (cachedCode) {
      return cachedCode;
    }

    try {
      const adapter = this.getAdapterForChain(chainId);
      if (!adapter) {
        throw new Error(`No adapter available for chain ID: ${chainId}`);
      }

      const provider = adapter.getProvider();
      const code = await provider.getCode(address);
      
      // Cache the result
      blockchainCacheService.set(cacheKey, code, {
        ttl: 30 * 60 * 1000, // Code rarely changes, 30 minutes cache
      });
      
      return code;
    } catch (error) {
      console.error(`Error fetching contract code for ${address} on chain ${chainId}:`, error);
      throw error;
    }
  }

  /**
   * Get contract ABI using the appropriate blockchain explorer API
   */
  async getContractABI(address: string, chainId: number): Promise<ContractABI> {
    // Generate cache key
    const cacheKey = blockchainCacheService.generateKey({
      prefix: 'contract-abi',
      address,
      chainId
    });

    // Try to get from cache first
    const cachedABI = blockchainCacheService.get<ContractABI>(cacheKey);
    if (cachedABI) {
      return cachedABI;
    }
    
    try {
      // First check if explorer API key is available
      const apiKey = this.explorerApiKeys[chainId];
      if (!apiKey) {
        // If no API key, attempt to get from bytecode directly
        return this.getABIFromBytecode(address, chainId);
      }

      // Determine the API endpoint based on chainId
      const apiEndpoint = this.getExplorerApiEndpoint(chainId);
      if (!apiEndpoint) {
        throw new Error(`Explorer API not supported for chain ID: ${chainId}`);
      }

      // Make API request to explorer
      const response = await fetch(
        `${apiEndpoint}?module=contract&action=getabi&address=${address}&apikey=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === '1' && data.result) {
        try {
          const abi = JSON.parse(data.result);
          const result = {
            abi,
            verified: true,
            source: `${this.getExplorerName(chainId)} API`
          };
          
          // Cache the result
          blockchainCacheService.set(cacheKey, result, {
            ttl: 24 * 60 * 60 * 1000, // ABIs rarely change, 24 hours cache
            persistToLocalStorage: true
          });
          
          return result;
        } catch (e) {
          throw new Error(`Error parsing ABI JSON: ${e.message}`);
        }
      } else {
        // If explorer doesn't have verified ABI, attempt bytecode analysis
        return this.getABIFromBytecode(address, chainId);
      }
    } catch (error) {
      console.error(`Error fetching ABI for ${address} on chain ${chainId}:`, error);
      throw error;
    }
  }

  /**
   * Analyze the structure of a contract based on its ABI
   */
  async analyzeContractStructure(abi: any[]): Promise<{
    functions: any[];
    events: any[];
    stateVariables: any[];
  }> {
    // Generate cache key based on the hash of the ABI
    const abiString = JSON.stringify(abi);
    const abiHash = this.hashString(abiString);
    const cacheKey = blockchainCacheService.generateKey({
      prefix: 'contract-structure',
      additionalParams: { hash: abiHash }
    });

    // Try to get from cache
    const cachedStructure = blockchainCacheService.get<{
      functions: any[];
      events: any[];
      stateVariables: any[];
    }>(cacheKey);
    
    if (cachedStructure) {
      return cachedStructure;
    }
    
    // Categorize the ABI elements
    const functions = abi.filter(item => 
      item.type === 'function' || 
      item.type === 'constructor' ||
      item.type === 'fallback' ||
      item.type === 'receive'
    );
    
    const events = abi.filter(item => item.type === 'event');
    
    // State variables are derived from view/pure functions with no inputs
    const stateVariables = functions.filter(item => 
      (item.stateMutability === 'view' || item.stateMutability === 'pure') && 
      (!item.inputs || item.inputs.length === 0) &&
      item.outputs?.length === 1
    );
    
    const result = { functions, events, stateVariables };
    
    // Cache the result
    blockchainCacheService.set(cacheKey, result, {
      ttl: 24 * 60 * 60 * 1000, // Structure analysis rarely changes, 24 hours cache
    });
    
    return result;
  }

  /**
   * Detect the type of contract based on code and ABI
   */
  async detectContractType(address: string, chainId: number): Promise<string> {
    // Generate cache key
    const cacheKey = blockchainCacheService.generateKey({
      prefix: 'contract-type',
      address,
      chainId
    });

    // Try to get from cache
    const cachedType = blockchainCacheService.get<string>(cacheKey);
    if (cachedType) {
      return cachedType;
    }
    
    try {
      const abi = await this.getContractABI(address, chainId);
      
      if (!abi.abi || abi.abi.length === 0) {
        return 'Unknown';
      }
      
      let contractType = 'Unknown';
      
      // Check for ERC20 interface
      if (
        this.hasFunction(abi.abi, 'transfer', ['address', 'uint256']) &&
        this.hasFunction(abi.abi, 'balanceOf', ['address']) &&
        this.hasFunction(abi.abi, 'totalSupply')
      ) {
        contractType = 'ERC20';
      }
      
      // Check for ERC721 interface
      else if (
        this.hasFunction(abi.abi, 'ownerOf', ['uint256']) &&
        this.hasFunction(abi.abi, 'balanceOf', ['address']) &&
        this.hasFunction(abi.abi, 'transferFrom', ['address', 'address', 'uint256'])
      ) {
        contractType = 'ERC721';
      }
      
      // Check for DEX-like contracts (PancakeSwap/Uniswap style)
      else if (
        this.hasFunction(abi.abi, 'swapExactTokensForTokens') ||
        this.hasFunction(abi.abi, 'addLiquidity') ||
        this.hasFunction(abi.abi, 'removeLiquidity')
      ) {
        contractType = 'DEX';
      }
      
      // Check for lending protocol interfaces
      else if (
        this.hasFunction(abi.abi, 'borrow') ||
        this.hasFunction(abi.abi, 'repay') ||
        this.hasFunction(abi.abi, 'deposit') ||
        this.hasFunction(abi.abi, 'withdraw')
      ) {
        contractType = 'Lending';
      }
      
      // Cache the result
      blockchainCacheService.set(cacheKey, contractType, {
        ttl: 24 * 60 * 60 * 1000, // Contract type rarely changes, 24 hours cache
      });
      
      return contractType;
    } catch (error) {
      console.error(`Error detecting contract type for ${address} on chain ${chainId}:`, error);
      return 'Unknown';
    }
  }

  /**
   * Get a basic security profile for a contract
   */
  async getContractSecurityProfile(address: string, chainId: number): Promise<ContractSecurityProfile> {
    try {
      const code = await this.getContractCode(address, chainId);
      const abi = await this.getContractABI(address, chainId);
      const issues: ContractSecurityIssue[] = [];
      
      // Example security checks - this would be expanded in a real implementation
      
      // Check for selfdestruct presence
      if (code.includes('selfdestruct') || code.includes('suicide')) {
        issues.push({
          severity: 'high',
          type: 'Self-Destruct',
          description: 'Contract contains selfdestruct functionality that could be used to destroy the contract'
        });
      }
      
      // Check for delegatecall (potential for proxy attacks)
      if (code.includes('delegatecall')) {
        issues.push({
          severity: 'medium',
          type: 'Delegatecall',
          description: 'Contract uses delegatecall which can be dangerous if not properly secured'
        });
      }
      
      // Check for reentrancy possibilities
      const hasExternalCalls = this.hasExternalCalls(abi.abi);
      const hasStateModifying = this.hasStateModifyingFunctions(abi.abi);
      if (hasExternalCalls && hasStateModifying) {
        issues.push({
          severity: 'medium',
          type: 'Potential Reentrancy',
          description: 'Contract has functions that make external calls and modify state, which could lead to reentrancy attacks'
        });
      }
      
      // Calculate a basic security score (real implementation would be more sophisticated)
      const score = Math.max(0, 100 - (issues.reduce((total, issue) => {
        const scores = { critical: 30, high: 20, medium: 10, low: 5, info: 1 };
        return total + scores[issue.severity];
      }, 0)));
      
      return {
        issues,
        score,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error(`Error analyzing security for ${address} on chain ${chainId}:`, error);
      throw error;
    }
  }

  /**
   * Get contract ownership information
   */
  async getContractOwnership(address: string, chainId: number): Promise<ContractOwnership> {
    try {
      const abi = await this.getContractABI(address, chainId);
      
      // Find admin/owner functions
      const adminFunctions = abi.abi
        .filter(item => 
          item.type === 'function' && 
          (
            item.name?.toLowerCase().includes('admin') ||
            item.name?.toLowerCase().includes('owner') ||
            item.name?.toLowerCase().includes('set') ||
            item.name?.toLowerCase().includes('update') ||
            item.name?.toLowerCase().includes('upgrade') ||
            item.name?.toLowerCase().includes('pause') ||
            item.name?.toLowerCase().includes('unpause') ||
            item.name?.toLowerCase().includes('add') ||
            item.name?.toLowerCase().includes('remove') ||
            item.name?.toLowerCase().includes('withdraw')
          )
        )
        .map(func => func.name);
      
      // Determine if there's an owner
      let owner: string | undefined;
      const adapter = this.getAdapterForChain(chainId);
      if (adapter && this.hasFunction(abi.abi, 'owner')) {
        try {
          const contract = new ethers.Contract(address, abi.abi, adapter.getProvider());
          owner = await contract.owner();
        } catch (e) {
          console.warn(`Could not retrieve owner for ${address}:`, e);
        }
      }
      
      // Check for multisig pattern
      const multisig = 
        this.hasFunction(abi.abi, 'getOwners') ||
        this.hasFunction(abi.abi, 'required') ||
        this.hasFunction(abi.abi, 'submitTransaction');
      
      // Determine upgradeability pattern
      let upgradeability: ContractOwnership['upgradeability'] = 'immutable';
      if (this.hasFunction(abi.abi, 'implementation')) {
        upgradeability = 'proxy';
        
        if (this.hasFunction(abi.abi, 'admin') || this.hasFunction(abi.abi, 'proxyAdmin')) {
          upgradeability = 'transparent';
        } else if (this.hasFunction(abi.abi, 'upgradeToAndCall') && !this.hasFunction(abi.abi, 'initialize')) {
          upgradeability = 'uups';
        }
      } else if (this.hasFunction(abi.abi, 'beacon') || this.hasFunction(abi.abi, 'implementation')) {
        upgradeability = 'beacon';
      }
      
      return {
        owner,
        adminFunctions,
        multisig: multisig,
        upgradeability
      };
    } catch (error) {
      console.error(`Error determining ownership for ${address} on chain ${chainId}:`, error);
      throw error;
    }
  }

  /**
   * Compare contract with previous versions if available
   */
  async trackContractChanges(address: string, chainId: number): Promise<any> {
    // This would require historical data which is beyond the scope of this implementation
    // In a real application, this would:
    // 1. Store historical ABIs and bytecode
    // 2. Compare current with historical versions
    // 3. Highlight significant changes in functions, permissions, etc.
    
    return {
      hasHistoricalData: false,
      message: "Contract change tracking requires historical data storage, which is not implemented in this version."
    };
  }

  /**
   * Get contract metadata including creation date, creator
   */
  async getContractMetadata(address: string, chainId: number): Promise<ContractMetadata> {
    // Generate cache key
    const cacheKey = blockchainCacheService.generateKey({
      prefix: 'contract-metadata',
      address,
      chainId
    });

    // Try to get from cache
    const cachedMetadata = blockchainCacheService.get<ContractMetadata>(cacheKey);
    if (cachedMetadata) {
      return cachedMetadata;
    }
    
    try {
      const adapter = this.getAdapterForChain(chainId);
      if (!adapter) {
        throw new Error(`No adapter available for chain ID: ${chainId}`);
      }
      
      // Basic metadata
      const metadata: ContractMetadata = {
        address,
        chainId
      };
      
      // Try to get ABI to extract more info
      try {
        const abi = await this.getContractABI(address, chainId);
        const contractType = await this.detectContractType(address, chainId);
        metadata.contractType = contractType;
        
        // Try to get name from common name functions
        if (abi.verified) {
          try {
            const contract = new ethers.Contract(address, abi.abi, adapter.getProvider());
            if (this.hasFunction(abi.abi, 'name')) {
              metadata.name = await contract.name();
            } else if (this.hasFunction(abi.abi, 'getName')) {
              metadata.name = await contract.getName();
            }
          } catch (e) {
            console.warn(`Could not retrieve name for ${address}:`, e);
          }
        }
        
        // Check if it's a proxy
        if (this.hasFunction(abi.abi, 'implementation')) {
          metadata.isProxy = true;
          try {
            const contract = new ethers.Contract(address, abi.abi, adapter.getProvider());
            metadata.implementation = await contract.implementation();
          } catch (e) {
            console.warn(`Could not retrieve implementation for proxy ${address}:`, e);
          }
        }
      } catch (e) {
        console.warn(`Could not retrieve ABI for ${address}:`, e);
      }
      
      // Try to find creation info
      try {
        // This is a simplified approach; a real implementation would use archive nodes or explorer APIs
        const provider = adapter.getProvider();
        const code = await provider.getCode(address);
        
        if (code !== '0x') {
          // Get transaction count to estimate when contract was created
          // This is just a placeholder - ideally you'd look up the actual deployment tx
          const count = await provider.getTransactionCount(address);
          if (count === 0) {
            // Roughly estimate creation date as 30 days ago for demonstration
            // In reality, you'd need to query deployment tx or use an explorer API
            const creationDate = new Date();
            creationDate.setDate(creationDate.getDate() - 30);
            metadata.creationDate = creationDate;
          }
        }
      } catch (e) {
        console.warn(`Could not retrieve creation info for ${address}:`, e);
      }
      
      // Cache the result
      blockchainCacheService.set(cacheKey, metadata, {
        ttl: 24 * 60 * 60 * 1000, // Metadata rarely changes, 24 hours cache
        persistToLocalStorage: true
      });
      
      return metadata;
    } catch (error) {
      console.error(`Error fetching metadata for ${address} on chain ${chainId}:`, error);
      throw error;
    }
  }

  // Helper methods

  public getAdapterForChain(chainId: number): ChainAdapter | null {
    return blockchainProviderService.getAdapterForChain(chainId);
  }

  private getExplorerApiEndpoint(chainId: number): string | null {
    const endpoints: Record<number, string> = {
      1: 'https://api.etherscan.io/api',
      56: 'https://api.bscscan.com/api',
      8453: 'https://api.basescan.org/api'
    };
    
    return endpoints[chainId] || null;
  }

  private getExplorerName(chainId: number): string {
    const names: Record<number, string> = {
      1: 'Etherscan',
      56: 'BSCScan',
      8453: 'Basescan'
    };
    
    return names[chainId] || 'Explorer';
  }

  private async getABIFromBytecode(address: string, chainId: number): Promise<ContractABI> {
    // In a real implementation, this would use bytecode analysis tools
    // For now, return a simplified placeholder
    return {
      abi: [],
      verified: false,
      source: 'bytecode analysis'
    };
  }

  private hasFunction(abi: any[], name: string, inputs?: string[]): boolean {
    const func = abi.find(item => 
      item.type === 'function' && 
      item.name === name
    );
    
    if (!func) return false;
    
    if (inputs) {
      // Check input types match
      if (!func.inputs || func.inputs.length !== inputs.length) return false;
      
      for (let i = 0; i < inputs.length; i++) {
        if (func.inputs[i].type !== inputs[i]) return false;
      }
    }
    
    return true;
  }

  private hasExternalCalls(abi: any[]): boolean {
    // Look for functions that likely make external calls
    return abi.some(item => 
      item.type === 'function' && 
      (
        item.name?.includes('transfer') ||
        item.name?.includes('send') ||
        item.name?.includes('call') ||
        item.name?.includes('swap') ||
        item.name?.includes('exchange')
      )
    );
  }

  private hasStateModifyingFunctions(abi: any[]): boolean {
    // Look for non-view, non-pure functions that likely modify state
    return abi.some(item => 
      item.type === 'function' && 
      item.stateMutability !== 'view' && 
      item.stateMutability !== 'pure'
    );
  }

  // Create a simple hash function for strings
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
}

// Create singleton instance
export const contractService = new ContractService(); 