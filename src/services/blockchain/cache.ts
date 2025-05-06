import { BlockchainNetwork } from './types';

/**
 * Cache entry with expiration mechanisms
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  blockNumber?: number;
  expiresAt: number;
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  ttl?: number; // Time-to-live in milliseconds
  blockBased?: boolean; // Whether to invalidate based on block number changes
  persistToLocalStorage?: boolean; // Whether to save to localStorage
  maxSize?: number; // Maximum number of items in the cache
}

/**
 * Cache key generator options
 */
interface KeyOptions {
  prefix: string;
  address?: string;
  chainId?: number;
  blockNumber?: number;
  network?: BlockchainNetwork;
  additionalParams?: Record<string, any>;
}

/**
 * Cache service for blockchain data
 */
export class BlockchainCacheService {
  private static instance: BlockchainCacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private storagePrefix = 'sh1fr_blockchain_cache_';
  
  // Default cache settings
  private defaultOptions: CacheOptions = {
    ttl: 5 * 60 * 1000, // 5 minutes default TTL
    blockBased: false,
    persistToLocalStorage: true,
    maxSize: 100, // Default max cache size
  };
  
  // Stats for monitoring
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  private constructor() {
    this.loadFromLocalStorage();
    
    // Set up cache cleanup interval
    setInterval(() => this.cleanupExpiredEntries(), 60 * 1000); // Cleanup every minute
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): BlockchainCacheService {
    if (!BlockchainCacheService.instance) {
      BlockchainCacheService.instance = new BlockchainCacheService();
    }
    return BlockchainCacheService.instance;
  }

  /**
   * Generate a cache key
   */
  public generateKey(options: KeyOptions): string {
    const { prefix, address, chainId, blockNumber, network, additionalParams } = options;
    
    let key = `${prefix}:`;
    
    if (address) key += `addr:${address.toLowerCase()}:`;
    if (chainId) key += `chain:${chainId}:`;
    if (blockNumber) key += `block:${blockNumber}:`;
    if (network) key += `net:${network}:`;
    
    if (additionalParams) {
      const sortedKeys = Object.keys(additionalParams).sort();
      for (const paramKey of sortedKeys) {
        key += `${paramKey}:${additionalParams[paramKey]}:`;
      }
    }
    
    return key;
  }

  /**
   * Set a value in the cache
   */
  public set<T>(key: string, value: T, options?: Partial<CacheOptions>): void {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const now = Date.now();
    
    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      expiresAt: mergedOptions.ttl ? now + mergedOptions.ttl : Infinity,
    };
    
    // If cache is at max size, remove the oldest entry
    if (this.cache.size >= (mergedOptions.maxSize || this.defaultOptions.maxSize!)) {
      this.evictOldest();
    }
    
    this.cache.set(key, entry);
    
    // Persist to localStorage if needed
    if (mergedOptions.persistToLocalStorage && typeof window !== 'undefined') {
      this.saveEntryToLocalStorage(key, entry);
    }
  }

  /**
   * Get a value from the cache
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    const now = Date.now();
    
    // Check if expired
    if (entry.expiresAt < now) {
      this.cache.delete(key);
      this.removeFromLocalStorage(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Check if key exists in cache and is not expired
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    const now = Date.now();
    
    // Check if expired
    if (entry.expiresAt < now) {
      this.cache.delete(key);
      this.removeFromLocalStorage(key);
      return false;
    }
    
    return true;
  }

  /**
   * Invalidate a specific entry or entries by prefix
   */
  public invalidate(keyOrPrefix: string): void {
    // If exact key
    if (this.cache.has(keyOrPrefix)) {
      this.cache.delete(keyOrPrefix);
      this.removeFromLocalStorage(keyOrPrefix);
      return;
    }
    
    // If prefix, remove all matching
    const keysToRemove: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyOrPrefix)) {
        keysToRemove.push(key);
      }
    }
    
    for (const key of keysToRemove) {
      this.cache.delete(key);
      this.removeFromLocalStorage(key);
    }
  }

  /**
   * Invalidate all cache entries for a specific address
   */
  public invalidateForAddress(address: string): void {
    const normalizedAddress = address.toLowerCase();
    const keysToRemove: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(`addr:${normalizedAddress}:`)) {
        keysToRemove.push(key);
      }
    }
    
    for (const key of keysToRemove) {
      this.cache.delete(key);
      this.removeFromLocalStorage(key);
    }
  }

  /**
   * Invalidate all cache entries for a specific chain
   */
  public invalidateForChain(chainId: number): void {
    const keysToRemove: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(`chain:${chainId}:`)) {
        keysToRemove.push(key);
      }
    }
    
    for (const key of keysToRemove) {
      this.cache.delete(key);
      this.removeFromLocalStorage(key);
    }
  }

  /**
   * Clear the entire cache
   */
  public clear(): void {
    this.cache.clear();
    this.clearLocalStorage();
  }

  /**
   * Get cache statistics
   */
  public getStats(): { size: number, hits: number, misses: number, evictions: number } {
    return {
      size: this.cache.size,
      ...this.stats,
    };
  }

  /**
   * Preload data into the cache (useful for initialization)
   */
  public preload<T>(keys: string[], fetcher: (key: string) => Promise<T>, options?: Partial<CacheOptions>): Promise<void> {
    return new Promise(async (resolve) => {
      try {
        const promises = keys.map(async (key) => {
          if (!this.has(key)) {
            const value = await fetcher(key);
            if (value !== undefined && value !== null) {
              this.set(key, value, options);
            }
          }
        });
        
        await Promise.all(promises);
        resolve();
      } catch (error) {
        console.error('Error preloading cache:', error);
        resolve();
      }
    });
  }

  /**
   * Remove oldest entries when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.removeFromLocalStorage(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        keysToRemove.push(key);
      }
    }
    
    for (const key of keysToRemove) {
      this.cache.delete(key);
      this.removeFromLocalStorage(key);
    }
  }

  /**
   * Save an entry to localStorage
   */
  private saveEntryToLocalStorage<T>(key: string, entry: CacheEntry<T>): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(
        this.storagePrefix + key, 
        JSON.stringify(entry)
      );
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
      // If localStorage is full, clear it and try again
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearLocalStorage();
        try {
          localStorage.setItem(
            this.storagePrefix + key, 
            JSON.stringify(entry)
          );
        } catch (retryError) {
          console.error('Failed to save cache to localStorage after clearing:', retryError);
        }
      }
    }
  }

  /**
   * Remove an entry from localStorage
   */
  private removeFromLocalStorage(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.storagePrefix + key);
    } catch (error) {
      console.warn('Failed to remove cache from localStorage:', error);
    }
  }

  /**
   * Clear all cache entries from localStorage
   */
  private clearLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Only remove items with our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to clear cache from localStorage:', error);
    }
  }

  /**
   * Load cached entries from localStorage
   */
  private loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const now = Date.now();
      const prefixLength = this.storagePrefix.length;
      
      for (let i = 0; i < localStorage.length; i++) {
        const fullKey = localStorage.key(i);
        
        if (fullKey && fullKey.startsWith(this.storagePrefix)) {
          const key = fullKey.substring(prefixLength);
          const storedData = localStorage.getItem(fullKey);
          
          if (storedData) {
            try {
              const entry: CacheEntry<any> = JSON.parse(storedData);
              
              // Skip expired entries
              if (entry.expiresAt >= now) {
                this.cache.set(key, entry);
              } else {
                // Clean up expired entries
                localStorage.removeItem(fullKey);
              }
            } catch (parseError) {
              console.warn(`Failed to parse cache entry for key '${key}':`, parseError);
              localStorage.removeItem(fullKey);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }
}

// Export the singleton instance
export const blockchainCacheService = BlockchainCacheService.getInstance(); 