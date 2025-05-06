export interface SmartContract {
  id: string;
  name: string;
  address: string;
  type: 'DEX' | 'AMM' | 'Multisig' | 'Lending' | 'Other';
  description: string;
  functions: ContractFunction[];
  securityScore: number;
  lastUpdated: string;
  hasChanges: boolean;
  connections: string[]; // IDs of connected contracts
}

export interface ContractFunction {
  id: string;
  name: string;
  description: string;
  isVulnerable: boolean;
  hasChanged: boolean;
  signature: string;
}

export interface Protocol {
  id: string;
  name: string;
  logo: string;
  description: string;
  contracts: SmartContract[];
  lastScan: string;
  overallScore: number;
}

export interface ContractChange {
  id: string;
  contractId: string;
  timestamp: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  diff: string;
  impactDescription: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'change' | 'vulnerability' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  link?: string;
}