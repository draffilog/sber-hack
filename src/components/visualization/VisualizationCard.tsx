import React from 'react';
import { Protocol } from '../../types';

interface VisualizationCardProps {
  protocol: Protocol;
}

export const VisualizationCard = ({ protocol }: VisualizationCardProps) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Contract Ecosystem</h2>
        <p className="text-sm text-gray-400">Visualization of contract relationships</p>
      </div>
      
      <div className="relative p-4 flex items-center justify-center" style={{ height: '400px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-3xl font-mono text-gray-700">
            <pre className="opacity-30">{protocolAsciiArt}</pre>
          </div>
        </div>
        
        <div className="relative z-10 bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg border border-gray-700 max-w-md text-center">
          <h3 className="text-xl font-bold text-white mb-3">Contract Visualization</h3>
          <p className="text-gray-300 mb-4">
            Interactive contract visualization enables you to explore relationships between smart contracts in the {protocol.name} ecosystem.
          </p>
          <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-medium rounded-md transition-colors">
            Generate Visualization
          </button>
        </div>
      </div>
    </div>
  );
};

const protocolAsciiArt = `
   +----------+    +----------+    +----------+
   |  Router  |--->|  Factory |<---|   Pool   |
   +----------+    +----------+    +----------+
         |               |               |
         v               v               v
   +----------+    +----------+    +----------+
   | Token A  |    | Token B  |    | Token C  |
   +----------+    +----------+    +----------+
         \\              |              /
          \\             |             /
           \\            |            /
            \\           v           /
             +-----> +-------+ <----+
                     | Vault |
                     +-------+
`;