import React from 'react';
import { useProtocol } from '../context/ProtocolContext';
import { ProtocolSelector } from './protocols/ProtocolSelector';
import { ProtocolSummary } from './protocols/ProtocolSummary';
import { ContractList } from './contracts/ContractList';
import { ContractDetails } from './contracts/ContractDetails';
import { StatsGrid } from './stats/StatsGrid';
import { VisualizationCard } from './visualization/VisualizationCard';
import { RecentChanges } from './changes/RecentChanges';

export const Dashboard = () => {
  const { selectedProtocol, selectedContract } = useProtocol();

  return (
    <div className="container mx-auto">
      {!selectedProtocol ? (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Select a Protocol</h1>
          <ProtocolSelector />
        </div>
      ) : (
        <>
          <ProtocolSummary protocol={selectedProtocol} />
          <StatsGrid />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-1">
              <ContractList contracts={selectedProtocol.contracts} />
            </div>
            <div className="lg:col-span-2">
              {selectedContract ? (
                <ContractDetails contract={selectedContract} />
              ) : (
                <VisualizationCard protocol={selectedProtocol} />
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <RecentChanges protocolId={selectedProtocol.id} />
          </div>
        </>
      )}
    </div>
  );
};