import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { useProtocol } from '../../context/ProtocolContext';
import { SmartContract } from '../../types';

interface ContractListProps {
  contracts: SmartContract[];
}

export const ContractList = ({ contracts }: ContractListProps) => {
  const { selectedContract, setSelectedContract } = useProtocol();

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Smart Contracts</h2>
        <p className="text-sm text-gray-400">Select a contract to analyze</p>
      </div>
      
      <ul className="divide-y divide-gray-700">
        {contracts.map(contract => {
          const vulnerableCount = contract.functions.filter(fn => fn.isVulnerable).length;
          
          return (
            <li key={contract.id}>
              <button
                className={`w-full text-left p-4 hover:bg-gray-700 transition-colors ${
                  selectedContract?.id === contract.id ? 'bg-gray-700' : ''
                }`}
                onClick={() => setSelectedContract(contract)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                      contract.type === 'DEX' ? 'bg-blue-500/20 text-blue-400' :
                      contract.type === 'AMM' ? 'bg-purple-500/20 text-purple-400' :
                      contract.type === 'Lending' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      <span className="text-sm font-semibold">{contract.type}</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-white">{contract.name}</h3>
                      <div className="flex items-center text-xs text-gray-400">
                        <Shield size={12} className="mr-1" />
                        <span className={`${
                          contract.securityScore >= 90 ? 'text-green-400' : 
                          contract.securityScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {contract.securityScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {vulnerableCount > 0 && (
                      <div className="flex items-center px-2 py-1 rounded-full bg-yellow-500/20">
                        <AlertTriangle size={12} className="text-yellow-400 mr-1" />
                        <span className="text-xs text-yellow-400">{vulnerableCount}</span>
                      </div>
                    )}
                    {contract.hasChanges && (
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    )}
                  </div>
                </div>
                
                <p className="mt-1 text-xs text-gray-400 truncate">{contract.address}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};