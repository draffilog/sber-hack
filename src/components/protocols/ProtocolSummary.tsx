import React from 'react';
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProtocol } from '../../context/ProtocolContext';
import { Protocol } from '../../types';

interface ProtocolSummaryProps {
  protocol: Protocol;
}

export const ProtocolSummary = ({ protocol }: ProtocolSummaryProps) => {
  const { setSelectedProtocol } = useProtocol();
  
  const vulnerabilityCount = protocol.contracts.reduce(
    (count, contract) => count + contract.functions.filter(fn => fn.isVulnerable).length,
    0
  );
  
  const changesCount = protocol.contracts.reduce(
    (count, contract) => count + (contract.hasChanges ? 1 : 0),
    0
  );

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 relative overflow-hidden mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-50"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={() => setSelectedProtocol(null)}
              className="mr-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft size={16} className="text-gray-300" />
            </button>
            
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-md bg-gray-700 flex items-center justify-center text-cyan-400 mr-4">
                <span className="text-2xl font-bold">{protocol.name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{protocol.name}</h1>
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar size={14} className="mr-1" />
                  <span>Last scan: {protocol.lastScan}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex items-center px-3 py-1.5 bg-gray-700 rounded-full">
              <AlertTriangle size={14} className={vulnerabilityCount > 0 ? "text-yellow-400" : "text-gray-400"} />
              <span className="ml-2 text-sm text-gray-200">{vulnerabilityCount} Vulnerabilities</span>
            </div>
            
            <div className="flex items-center px-3 py-1.5 bg-gray-700 rounded-full">
              <CheckCircle size={14} className="text-cyan-400" />
              <span className="ml-2 text-sm text-gray-200">{changesCount} Changes</span>
            </div>
            
            <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-medium rounded-md transition-colors">
              Scan Now
            </button>
          </div>
        </div>
        
        <p className="text-gray-300 max-w-4xl">{protocol.description}</p>
        
        <div className="mt-6 flex items-center">
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                protocol.overallScore >= 90 ? 'bg-green-500' : 
                protocol.overallScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${protocol.overallScore}%` }}
            ></div>
          </div>
          <span className="ml-4 font-semibold text-white">{protocol.overallScore}/100</span>
        </div>
      </div>
    </div>
  );
};