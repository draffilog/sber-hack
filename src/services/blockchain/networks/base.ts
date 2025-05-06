import { 
  BrowserProvider, 
  JsonRpcProvider, 
  TransactionRequest, 
  TransactionResponse, 
  Network,
  Contract
} from 'ethers';
import { 
  BlockchainNetwork, 
  NetworkConfig 
} from '../types';
import { 
  ChainAdapter, 
  ChainAdapterConfig, 
  ChainOperationOptions, 
  ChainType, 
  ContractData 
} from './types';

/**
 * Base implementation of a blockchain network adapter.
 * Provides common functionality for all EVM-compatible chains.
 */
export abstract class BaseChainAdapter implements ChainAdapter {
  readonly type: ChainType = ChainType.EVM;
  readonly network: BlockchainNetwork;
  readonly networkConfig: NetworkConfig;
  protected provider: BrowserProvider | JsonRpcProvider;
  protected initialized: boolean = false;

  constructor(config: ChainAdapterConfig) {
    this.networkConfig = config.networkConfig;
    this.provider = config.provider;
    this.network = this.getNetworkFromConfig(config.networkConfig);
  }

  /**
   * Map the network config to a blockchain network enum
   */
  private getNetworkFromConfig(config: NetworkConfig): BlockchainNetwork {
    // Find the matching network based on chain ID
    const entry = Object.entries(BlockchainNetwork).find(
      ([_, network]) => {
        const networkType = network as BlockchainNetwork;
        return config.chainId === this.networkConfig.chainId;
      }
    );
    
    if (!entry) {
      throw new Error(`No matching network found for chain ID ${config.chainId}`);
    }
    
    return entry[1] as BlockchainNetwork;
  }

  /**
   * Initialize the adapter
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Verify provider connection
    try {
      await this.getNetwork();
      this.initialized = true;
    } catch (error) {
      this.initialized = false;
      throw new Error(`Failed to initialize chain adapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the current blockchain network
   */
  public async getNetwork(): Promise<Network> {
    return await this.provider.getNetwork();
  }

  /**
   * Get the chain ID
   */
  public async getChainId(): Promise<number> {
    const network = await this.getNetwork();
    return Number(network.chainId);
  }

  /**
   * Check if the adapter is compatible with a given chain ID
   */
  public isCompatible(chainId: number): boolean {
    return this.networkConfig.chainId === chainId;
  }

  /**
   * Get the current block number
   */
  public async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Get the native token (ETH, BNB, etc.) balance for an address
   */
  public async getBalance(address: string): Promise<bigint> {
    return await this.provider.getBalance(address);
  }

  /**
   * Send a transaction
   */
  public async sendTransaction(
    transaction: TransactionRequest, 
    options?: ChainOperationOptions
  ): Promise<TransactionResponse> {
    // Apply options to the transaction if provided
    if (options) {
      if (options.maxFeePerGas) {
        transaction.maxFeePerGas = options.maxFeePerGas;
      }
      
      if (options.maxPriorityFeePerGas) {
        transaction.maxPriorityFeePerGas = options.maxPriorityFeePerGas;
      }
      
      if (options.gasLimit) {
        transaction.gasLimit = options.gasLimit;
      }
      
      if (options.nonce !== undefined) {
        transaction.nonce = options.nonce;
      }
    }

    // For browser providers, we need to get the signer first
    if (this.provider instanceof BrowserProvider) {
      const signer = await this.provider.getSigner();
      return await signer.sendTransaction(transaction);
    } else {
      throw new Error('Cannot send transactions with a read-only provider. Use a browser wallet provider.');
    }
  }

  /**
   * Get a transaction by hash
   */
  public async getTransaction(txHash: string): Promise<TransactionResponse | null> {
    return await this.provider.getTransaction(txHash);
  }

  /**
   * Wait for a transaction to be confirmed
   */
  public async waitForTransaction(
    txHash: string, 
    confirmations: number = 1
  ): Promise<TransactionResponse> {
    return await this.provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * Get the estimated gas for a transaction
   */
  public async estimateGas(transaction: TransactionRequest): Promise<bigint> {
    return await this.provider.estimateGas(transaction);
  }

  /**
   * Get the recommended gas price
   */
  public async getGasPrice(): Promise<bigint> {
    return await this.provider.getFeeData().then(data => data.gasPrice || 0n);
  }

  /**
   * Get the maximum fee per gas (EIP-1559)
   */
  public async getMaxFeePerGas(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.maxFeePerGas || 0n;
  }

  /**
   * Get the maximum priority fee per gas (EIP-1559)
   */
  public async getMaxPriorityFeePerGas(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.maxPriorityFeePerGas || 0n;
  }

  /**
   * Call a contract method (read-only)
   */
  public async callContract(
    contractData: ContractData, 
    method: string, 
    args: any[]
  ): Promise<any> {
    const contract = new Contract(
      contractData.address,
      contractData.abi,
      this.provider
    );

    return await contract[method](...args);
  }

  /**
   * Get contract events
   */
  public async getContractEvents(
    contractData: ContractData,
    eventName: string,
    fromBlock: number = 0,
    toBlock: number = 0
  ): Promise<any[]> {
    // If toBlock is 0, use the latest block
    if (toBlock === 0) {
      toBlock = await this.getBlockNumber();
    }

    const contract = new Contract(
      contractData.address,
      contractData.abi,
      this.provider
    );

    const filter = contract.filters[eventName]();
    return await contract.queryFilter(filter, fromBlock, toBlock);
  }

  /**
   * Disconnect and clean up resources
   */
  public disconnect(): void {
    // Most providers don't need explicit cleanup
    this.initialized = false;
  }
} 