import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useProtocol } from '../../context/ProtocolContext';

export const ProtocolSelector = () => {
  const { protocols, setSelectedProtocol } = useProtocol();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {protocols.map((protocol) => (
        <div 
          key={protocol.id}
          className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-cyan-500 transition-all hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer group"
          onClick={() => setSelectedProtocol(protocol)}
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-md bg-gray-700 flex items-center justify-center text-cyan-400 mr-3">
                {protocol.logo === 'uniswap' && <span className="text-lg font-bold">U</span>}
                {protocol.logo === 'aave' && <span className="text-lg font-bold">A</span>}
                {protocol.logo === 'compound' && <span className="text-lg font-bold">C</span>}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{protocol.name}</h3>
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                  <span className="text-xs text-gray-400">Last scanned: {protocol.lastScan}</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">{protocol.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="bg-gray-700 px-3 py-1 rounded-full flex items-center">
                <span className="text-xs font-medium text-white mr-1">Security:</span>
                <span className={`text-xs font-semibold ${
                  protocol.overallScore >= 90 ? 'text-green-400' : 
                  protocol.overallScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {protocol.overallScore}/100
                </span>
              </div>
              
              <ChevronRight className="text-gray-500 group-hover:text-cyan-400 transition-colors" size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};