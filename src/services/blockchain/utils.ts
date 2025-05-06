import { ethers } from 'ethers';
import { blockchainProviderService } from './provider';
import { blockchainCacheService } from './cache';

/**
 * Address validation result
 */
export interface AddressValidationResult {
  isValid: boolean;
  reason?: string;
  normalizedAddress?: string;
}

/**
 * Gas estimation options
 */
export interface GasEstimationOptions {
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasLimit?: bigint;
  nonce?: number;
}

/**
 * Utility service for blockchain operations
 */
export class BlockchainUtilsService {
  private static instance: BlockchainUtilsService;

  // Common connection errors with user-friendly messages
  private errorMessages: Record<string, string> = {
    'user rejected': 'The connection request was rejected by the user.',
    'network error': 'Unable to connect to the network. Please check your internet connection.',
    'timeout': 'The connection timed out. The network might be congested.',
    'already processing': 'A wallet operation is already in progress. Please wait for it to complete.',
    'user denied': 'The transaction was rejected by the user.',
    'insufficient funds': 'Your wallet does not have enough funds for this transaction.',
    'gas required exceeds allowance': 'The transaction requires more gas than allowed.',
    'intrinsic gas too low': 'The gas limit is too low for this transaction.',
    'nonce too low': 'The nonce is too low. Another transaction may be pending.',
    'replacement transaction underpriced': 'The replacement transaction has a gas price that is too low.',
  };

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): BlockchainUtilsService {
    if (!BlockchainUtilsService.instance) {
      BlockchainUtilsService.instance = new BlockchainUtilsService();
    }
    return BlockchainUtilsService.instance;
  }

  /**
   * Validate an Ethereum address
   */
  public validateAddress(address: string): AddressValidationResult {
    if (!address) {
      return { isValid: false, reason: 'Address is empty' };
    }

    // Check format (0x followed by 40 hex characters)
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return { isValid: false, reason: 'Invalid address format' };
    }

    // Try to normalize the address (this will also check checksum)
    try {
      const normalizedAddress = ethers.getAddress(address);
      
      // Check if it's a contract address or an externally owned account
      const isContract = address === '0x0000000000000000000000000000000000000000';
      
      if (isContract) {
        return { 
          isValid: true, 
          normalizedAddress,
          reason: 'Zero address detected'
        };
      }
      
      return { 
        isValid: true, 
        normalizedAddress 
      };
    } catch (error) {
      return { 
        isValid: false, 
        reason: 'Invalid checksum'
      };
    }
  }

  /**
   * Format an address for display (0x1234...5678)
   */
  public formatAddress(address: string, prefixLength: number = 6, suffixLength: number = 4): string {
    if (!address) return '';
    
    try {
      const normalizedAddress = ethers.getAddress(address);
      if (normalizedAddress.length < prefixLength + suffixLength + 3) {
        return normalizedAddress;
      }
      
      return `${normalizedAddress.substring(0, prefixLength)}...${normalizedAddress.substring(normalizedAddress.length - suffixLength)}`;
    } catch (error) {
      return address; // Return original if invalid
    }
  }

  /**
   * Truncate a string to a maximum length with ellipsis
   */
  public truncateString(str: string, maxLength: number = 30): string {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    
    return `${str.substring(0, maxLength - 3)}...`;
  }

  /**
   * Format a number with commas as thousands separators
   */
  public formatNumber(value: number | string, decimals: number = 2): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(num)) return '0';
    
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Convert wei to ether
   */
  public weiToEther(wei: bigint | string): string {
    try {
      const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
      return ethers.formatEther(weiValue);
    } catch (error) {
      console.error('Error converting wei to ether:', error);
      return '0';
    }
  }

  /**
   * Convert ether to wei
   */
  public etherToWei(ether: string | number): bigint {
    try {
      const etherStr = ether.toString();
      return ethers.parseEther(etherStr);
    } catch (error) {
      console.error('Error converting ether to wei:', error);
      return BigInt(0);
    }
  }

  /**
   * Convert gwei to wei
   */
  public gweiToWei(gwei: string | number): bigint {
    try {
      const gweiStr = gwei.toString();
      return ethers.parseUnits(gweiStr, 9);
    } catch (error) {
      console.error('Error converting gwei to wei:', error);
      return BigInt(0);
    }
  }

  /**
   * Convert wei to gwei
   */
  public weiToGwei(wei: bigint | string): string {
    try {
      const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
      return ethers.formatUnits(weiValue, 9);
    } catch (error) {
      console.error('Error converting wei to gwei:', error);
      return '0';
    }
  }

  /**
   * Get an ENS name for an address
   */
  public async resolveAddressToEns(address: string): Promise<string | null> {
    const cacheKey = blockchainCacheService.generateKey({
      prefix: 'ens-resolve',
      address
    });

    // Try to get from cache first
    const cachedEns = blockchainCacheService.get<string>(cacheKey);
    if (cachedEns) {
      return cachedEns;
    }
    
    try {
      const provider = blockchainProviderService.getProvider();
      if (!provider) {
        throw new Error('No provider available');
      }
      
      // Only Ethereum mainnet supports ENS
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(1)) {
        return null;
      }
      
      const ensName = await provider.lookupAddress(address);
      
      if (ensName) {
        // Cache the result
        blockchainCacheService.set(cacheKey, ensName, {
          ttl: 24 * 60 * 60 * 1000, // ENS names rarely change, 24 hours cache
        });
      }
      
      return ensName;
    } catch (error) {
      console.error('Error resolving ENS name:', error);
      return null;
    }
  }

  /**
   * Get an address for an ENS name
   */
  public async resolveEnsToAddress(ensName: string): Promise<string | null> {
    const cacheKey = blockchainCacheService.generateKey({
      prefix: 'ens-lookup',
      additionalParams: { name: ensName }
    });

    // Try to get from cache first
    const cachedAddress = blockchainCacheService.get<string>(cacheKey);
    if (cachedAddress) {
      return cachedAddress;
    }
    
    try {
      const provider = blockchainProviderService.getProvider();
      if (!provider) {
        throw new Error('No provider available');
      }
      
      // Only Ethereum mainnet supports ENS
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(1)) {
        return null;
      }
      
      const address = await provider.resolveName(ensName);
      
      if (address) {
        // Cache the result
        blockchainCacheService.set(cacheKey, address, {
          ttl: 24 * 60 * 60 * 1000, // ENS resolutions rarely change, 24 hours cache
        });
      }
      
      return address;
    } catch (error) {
      console.error('Error resolving address from ENS:', error);
      return null;
    }
  }

  /**
   * Estimate gas for a transaction
   */
  public async estimateGas(
    to: string,
    data: string = '0x',
    value: bigint = BigInt(0),
    options: Partial<GasEstimationOptions> = {}
  ): Promise<GasEstimationOptions> {
    try {
      const provider = blockchainProviderService.getProvider();
      if (!provider) {
        throw new Error('No provider available');
      }
      
      // Get fee data and account
      const feeData = await provider.getFeeData();
      
      // Default gas estimation options
      const gasOptions: GasEstimationOptions = {
        maxFeePerGas: feeData.maxFeePerGas || undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
      };
      
      // Estimate gas limit
      const gasLimit = await provider.estimateGas({
        to,
        data,
        value
      });
      
      // Add 20% buffer to gas limit
      const gasLimitWithBuffer = (gasLimit * BigInt(120)) / BigInt(100);
      
      return {
        ...gasOptions,
        ...options,
        gasLimit: gasLimitWithBuffer
      };
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw this.translateError(error);
    }
  }

  /**
   * Parse and clean up blockchain error messages
   */
  public translateError(error: any): Error {
    if (!error) {
      return new Error('Unknown error');
    }
    
    const errorMessage = error.message || error.toString();
    
    // Check for known error patterns
    for (const [pattern, message] of Object.entries(this.errorMessages)) {
      if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
        return new Error(message);
      }
    }
    
    // Remove technical details for cleaner messages
    let cleanedMessage = errorMessage
      .replace(/\(action="[\w-]+", data={.*}\)/, '')
      .replace(/\[ethjs-query\].*while formatting outputs from RPC.*/, '')
      .replace(/Error: /, '');
    
    // Limit message length
    if (cleanedMessage.length > 150) {
      cleanedMessage = cleanedMessage.substring(0, 147) + '...';
    }
    
    return new Error(cleanedMessage);
  }

  /**
   * Format a transaction hash for display
   */
  public formatTxHash(txHash: string): string {
    return this.formatAddress(txHash, 10, 8);
  }

  /**
   * Get a block explorer URL for a transaction
   */
  public getTransactionExplorerUrl(txHash: string, chainId: number): string {
    const explorerBaseUrls: Record<number, string> = {
      1: 'https://etherscan.io/tx/',
      56: 'https://bscscan.com/tx/',
      8453: 'https://basescan.org/tx/',
      137: 'https://polygonscan.com/tx/',
      42161: 'https://arbiscan.io/tx/',
      11155111: 'https://sepolia.etherscan.io/tx/'
    };
    
    const baseUrl = explorerBaseUrls[chainId];
    if (!baseUrl) {
      return '';
    }
    
    return `${baseUrl}${txHash}`;
  }

  /**
   * Get a block explorer URL for an address
   */
  public getAddressExplorerUrl(address: string, chainId: number): string {
    const explorerBaseUrls: Record<number, string> = {
      1: 'https://etherscan.io/address/',
      56: 'https://bscscan.com/address/',
      8453: 'https://basescan.org/address/',
      137: 'https://polygonscan.com/address/',
      42161: 'https://arbiscan.io/address/',
      11155111: 'https://sepolia.etherscan.io/address/'
    };
    
    const baseUrl = explorerBaseUrls[chainId];
    if (!baseUrl) {
      return '';
    }
    
    return `${baseUrl}${address}`;
  }

  /**
   * Convert a hexadecimal string to UTF-8 text
   */
  public hexToText(hex: string): string {
    try {
      if (!hex || hex === '0x') return '';
      
      // Remove 0x prefix if present
      const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
      
      // Convert each pair of hex digits to a character code
      let text = '';
      for (let i = 0; i < cleanHex.length; i += 2) {
        const charCode = parseInt(cleanHex.substr(i, 2), 16);
        // Only add printable characters
        if (charCode >= 32 && charCode <= 126) {
          text += String.fromCharCode(charCode);
        }
      }
      
      return text;
    } catch (error) {
      console.error('Error converting hex to text:', error);
      return '';
    }
  }

  /**
   * Convert UTF-8 text to a hexadecimal string
   */
  public textToHex(text: string): string {
    try {
      if (!text) return '0x';
      
      let hex = '0x';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        hex += charCode.toString(16).padStart(2, '0');
      }
      
      return hex;
    } catch (error) {
      console.error('Error converting text to hex:', error);
      return '0x';
    }
  }

  /**
   * Format a timestamp as a readable date string
   */
  public formatTimestamp(timestamp: number): string {
    try {
      const date = new Date(timestamp * 1000); // Convert to milliseconds
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  }

  /**
   * Extract a method signature from transaction data
   */
  public extractMethodSignature(data: string): string {
    if (!data || data === '0x' || data.length < 10) {
      return '';
    }
    
    return data.substring(0, 10);
  }
}

// Export the singleton instance
export const blockchainUtilsService = BlockchainUtilsService.getInstance(); 