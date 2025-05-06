import { Protocol, Notification } from '../types';
import { ShieldCheck, Shuffle, RefreshCw, DollarSign } from 'lucide-react';

export const mockProtocols: Protocol[] = [
  {
    id: 'uniswap',
    name: 'Uniswap',
    logo: 'uniswap',
    description: 'Leading DEX protocol for token swaps',
    contracts: [
      {
        id: 'univ3-router',
        name: 'UniswapV3Router',
        address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
        type: 'DEX',
        description: 'Main router contract for Uniswap V3',
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
            description: 'Add liquidity to a pool',
            isVulnerable: false,
            hasChanged: false,
            signature: 'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline)'
          }
        ],
        securityScore: 92,
        lastUpdated: '2023-12-15',
        hasChanges: true,
        connections: ['univ3-factory', 'univ3-pool']
      },
      {
        id: 'univ3-factory',
        name: 'UniswapV3Factory',
        address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        type: 'DEX',
        description: 'Factory contract for creating Uniswap V3 pools',
        functions: [
          {
            id: 'fn-3',
            name: 'createPool',
            description: 'Creates a pool for the given two tokens and fee',
            isVulnerable: false,
            hasChanged: false,
            signature: 'function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)'
          }
        ],
        securityScore: 95,
        lastUpdated: '2023-11-10',
        hasChanges: false,
        connections: ['univ3-router', 'univ3-pool']
      },
      {
        id: 'univ3-pool',
        name: 'UniswapV3Pool',
        address: '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
        type: 'AMM',
        description: 'Implementation of a Uniswap V3 pool',
        functions: [
          {
            id: 'fn-4',
            name: 'swap',
            description: 'Swap tokens in the pool',
            isVulnerable: true,
            hasChanged: false,
            signature: 'function swap(address recipient, bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, bytes calldata data)'
          }
        ],
        securityScore: 88,
        lastUpdated: '2023-12-01',
        hasChanges: false,
        connections: ['univ3-router', 'univ3-factory']
      }
    ],
    lastScan: '2023-12-20',
    overallScore: 92
  },
  {
    id: 'aave',
    name: 'Aave',
    logo: 'aave',
    description: 'Lending and borrowing protocol',
    contracts: [
      {
        id: 'aave-lending-pool',
        name: 'LendingPool',
        address: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
        type: 'Lending',
        description: 'Main contract for Aave lending operations',
        functions: [
          {
            id: 'fn-5',
            name: 'deposit',
            description: 'Deposits an amount of underlying asset',
            isVulnerable: false,
            hasChanged: false,
            signature: 'function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)'
          }
        ],
        securityScore: 94,
        lastUpdated: '2023-11-25',
        hasChanges: false,
        connections: []
      }
    ],
    lastScan: '2023-12-18',
    overallScore: 94
  },
  {
    id: 'compound',
    name: 'Compound',
    logo: 'compound',
    description: 'Lending and borrowing protocol',
    contracts: [],
    lastScan: '2023-12-15',
    overallScore: 90
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Contract Update',
    message: 'UniswapV3Router contract has been updated',
    timestamp: '2023-12-15T14:23:10',
    read: false,
    type: 'change',
    severity: 'medium',
    link: '/protocol/uniswap/contract/univ3-router'
  },
  {
    id: 'notif-2',
    title: 'Vulnerability Detected',
    message: 'Potential reentrancy vulnerability in UniswapV3Pool',
    timestamp: '2023-12-01T09:45:32',
    read: true,
    type: 'vulnerability',
    severity: 'high',
    link: '/protocol/uniswap/contract/univ3-pool'
  }
];

export const featuredStats = [
  {
    id: 'stat-1',
    title: 'Security Score',
    value: '92/100',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    change: '+3%',
    positive: true
  },
  {
    id: 'stat-2',
    title: 'Contract Changes',
    value: '12',
    icon: RefreshCw,
    color: 'text-blue-400',
    change: '+5',
    positive: false
  },
  {
    id: 'stat-3',
    title: 'Connected Protocols',
    value: '8',
    icon: Shuffle,
    color: 'text-purple-400',
    change: '+2',
    positive: true
  },
  {
    id: 'stat-4',
    title: 'TVL',
    value: '$1.24B',
    icon: DollarSign,
    color: 'text-yellow-400',
    change: '-2.5%',
    positive: false
  }
];