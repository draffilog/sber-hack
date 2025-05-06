import { BrowserProvider, JsonRpcProvider, TransactionRequest, TransactionResponse, Network } from 'ethers';
import { BlockchainNetwork, NetworkConfig } from '../types';

/**
 * Type of supported chain adapters
 */
export enum ChainType {
  EVM = 'evm',
}

/**
 * Common properties of all chain adapters
 */
export interface ChainAdapterConfig {
  networkConfig: NetworkConfig;
  provider: BrowserProvider | JsonRpcProvider;
}

/**
 * Additional options for chain operations
 */
export interface ChainOperationOptions {
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasLimit?: bigint;
  nonce?: number;
  timeout?: number;
}

/**
 * Contract data model
 */
export interface ContractData {
  address: string;
  abi: any;
  bytecode?: string;
  deployedBytecode?: string;
  constructorArgs?: any[];
  deploymentBlock?: number;
}

/**
 * Common interface for all blockchain adapters
 */
export interface ChainAdapter {
  /**
   * The type of chain adapter
   */
  readonly type: ChainType;
  
  /**
   * The blockchain network this adapter is for
   */
  readonly network: BlockchainNetwork;
  
  /**
   * The network configuration
   */
  readonly networkConfig: NetworkConfig;
  
  /**
   * Initialize the adapter
   */
  initialize(): Promise<void>;
  
  /**
   * Get the current blockchain network
   */
  getNetwork(): Promise<Network>;
  
  /**
   * Get the chain ID
   */
  getChainId(): Promise<number>;
  
  /**
   * Check if the adapter is compatible with a given chain ID
   */
  isCompatible(chainId: number): boolean;
  
  /**
   * Get the current block number
   */
  getBlockNumber(): Promise<number>;

  /**
   * Get the native token (ETH, BNB, etc.) balance for an address
   */
  getBalance(address: string): Promise<bigint>;
  
  /**
   * Send a transaction
   */
  sendTransaction(transaction: TransactionRequest, options?: ChainOperationOptions): Promise<TransactionResponse>;
  
  /**
   * Get a transaction by hash
   */
  getTransaction(txHash: string): Promise<TransactionResponse | null>;
  
  /**
   * Wait for a transaction to be confirmed
   */
  waitForTransaction(txHash: string, confirmations?: number): Promise<TransactionResponse>;
  
  /**
   * Get the estimated gas for a transaction
   */
  estimateGas(transaction: TransactionRequest): Promise<bigint>;
  
  /**
   * Get the recommended gas price
   */
  getGasPrice(): Promise<bigint>;
  
  /**
   * Get the maximum fee per gas (EIP-1559)
   */
  getMaxFeePerGas(): Promise<bigint>;
  
  /**
   * Get the maximum priority fee per gas (EIP-1559)
   */
  getMaxPriorityFeePerGas(): Promise<bigint>;
  
  /**
   * Call a contract method (read-only)
   */
  callContract(contract: ContractData, method: string, args: any[]): Promise<any>;
  
  /**
   * Get contract events
   */
  getContractEvents(contract: ContractData, eventName: string, fromBlock?: number, toBlock?: number): Promise<any[]>;
  
  /**
   * Disconnect and clean up resources
   */
  disconnect(): void;
} 