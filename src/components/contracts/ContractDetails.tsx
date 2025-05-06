import React, { useState } from 'react';
import { Shield, FileCode, GitBranch, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { SmartContract, ContractFunction } from '../../types';

interface ContractDetailsProps {
  contract: SmartContract;
}

export const ContractDetails = ({ contract }: ContractDetailsProps) => {
  const [activeTab, setActiveTab] = useState<'functions' | 'connections' | 'security'>('functions');
  
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-md flex items-center justify-center ${
              contract.type === 'DEX' ? 'bg-blue-500/20 text-blue-400' :
              contract.type === 'AMM' ? 'bg-purple-500/20 text-purple-400' :
              contract.type === 'Lending' ? 'bg-green-500/20 text-green-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              <span className="text-md font-semibold">{contract.type}</span>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-white">{contract.name}</h2>
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-1">{contract.address}</span>
                <a href={`https://etherscan.io/address/${contract.address}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={12} className="text-gray-500 hover:text-cyan-400" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1.5 bg-gray-700 rounded-md flex items-center">
              <Shield size={16} className="mr-2 text-cyan-400" />
              <span className={`font-semibold ${
                contract.securityScore >= 90 ? 'text-green-400' : 
                contract.securityScore >= 70 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {contract.securityScore}/100
              </span>
            </div>
            <div className="px-3 py-1.5 bg-gray-700 rounded-md flex items-center">
              <Clock size={16} className="mr-2 text-gray-400" />
              <span className="text-sm text-gray-300">Updated: {contract.lastUpdated}</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-300">{contract.description}</p>
      </div>
      
      <div className="border-b border-gray-700">
        <nav className="flex">
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'functions' 
                ? 'text-white border-b-2 border-cyan-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('functions')}
          >
            <FileCode size={16} className="inline-block mr-2" />
            Functions
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'connections' 
                ? 'text-white border-b-2 border-cyan-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('connections')}
          >
            <GitBranch size={16} className="inline-block mr-2" />
            Connections
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'security' 
                ? 'text-white border-b-2 border-cyan-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={16} className="inline-block mr-2" />
            Security
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {activeTab === 'functions' && (
          <div className="space-y-6">
            {contract.functions.map(fn => (
              <FunctionCard key={fn.id} func={fn} />
            ))}
          </div>
        )}
        
        {activeTab === 'connections' && (
          <div className="p-8 text-center text-gray-400">
            <GitBranch size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Connection visualization coming soon</p>
          </div>
        )}
        
        {activeTab === 'security' && (
          <div className="p-8 text-center text-gray-400">
            <Shield size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Security analysis coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface FunctionCardProps {
  func: ContractFunction;
}

const FunctionCard = ({ func }: FunctionCardProps) => {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-mono text-cyan-400">{func.name}</h3>
          <p className="text-sm text-gray-400">{func.description}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {func.isVulnerable && (
            <div className="px-2 py-1 rounded-md bg-yellow-500/20 flex items-center">
              <AlertTriangle size={14} className="text-yellow-400 mr-1" />
              <span className="text-xs text-yellow-400">Vulnerability</span>
            </div>
          )}
          {func.hasChanged && (
            <div className="px-2 py-1 rounded-md bg-cyan-500/20 flex items-center">
              <Clock size={14} className="text-cyan-400 mr-1" />
              <span className="text-xs text-cyan-400">Recently Changed</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-950 p-3 rounded border border-gray-800 font-mono text-sm text-gray-300 overflow-x-auto">
        <code>{func.signature}</code>
      </div>
    </div>
  );
};