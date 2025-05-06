import React from 'react';
import { Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface RecentChangesProps {
  protocolId: string;
}

export const RecentChanges = ({ protocolId }: RecentChangesProps) => {
  // Mocked changes data
  const changes = [
    {
      id: 'change-1',
      contractName: 'UniswapV3Router',
      function: 'swapExactTokensForTokens',
      timestamp: '2023-12-15',
      severity: 'medium',
      description: 'Added token blacklist checking in swap function'
    },
    {
      id: 'change-2',
      contractName: 'UniswapV3Factory',
      function: 'createPool',
      timestamp: '2023-11-10',
      severity: 'low',
      description: 'Updated fee calculation mechanism'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent Changes</h2>
          <p className="text-sm text-gray-400">Latest updates to contracts</p>
        </div>
        <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          View all changes
        </button>
      </div>
      
      <div className="divide-y divide-gray-700">
        {changes.map(change => (
          <div key={change.id} className="p-4 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${
                  change.severity === 'high' ? 'bg-red-400' :
                  change.severity === 'medium' ? 'bg-yellow-400' :
                  'bg-blue-400'
                } mr-2`}></div>
                <h3 className="font-medium text-white">{change.contractName}</h3>
                <ArrowRight size={14} className="mx-2 text-gray-500" />
                <span className="text-cyan-400 font-mono">{change.function}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Clock size={14} className="mr-1" />
                <span>{change.timestamp}</span>
              </div>
            </div>
            <p className="text-gray-300 mb-2">{change.description}</p>
            <div className="flex">
              <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
                View changes
                <ArrowRight size={12} className="ml-1" />
              </button>
              {change.severity !== 'low' && (
                <div className="ml-4 flex items-center text-xs">
                  <AlertTriangle size={12} className="text-yellow-400 mr-1" />
                  <span className="text-yellow-400">Requires attention</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};