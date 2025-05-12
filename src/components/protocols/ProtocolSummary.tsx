import React from 'react';
import { Shield, AlertCircle, ExternalLink, ArrowLeft, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Protocol } from '../../types';
import { useProtocol } from '../../context/ProtocolContext';
import { useTranslation } from 'react-i18next';

interface ProtocolSummaryProps {
  protocol: Protocol;
}

export const ProtocolSummary: React.FC<ProtocolSummaryProps> = ({ protocol }) => {
  const { setSelectedProtocol, setSelectedContract } = useProtocol();
  const { i18n, t } = useTranslation();
  
  const vulnerabilityCount = protocol.contracts.reduce(
    (count, contract) => count + contract.functions.filter(fn => fn.isVulnerable).length,
    0
  );
  
  const changesCount = protocol.contracts.reduce(
    (count, contract) => count + (contract.hasChanges ? 1 : 0),
    0
  );

  const handleLanguageToggle = () => {
    i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru');
  };

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
            
            <button
              onClick={handleLanguageToggle}
              className="ml-2 px-3 py-1 rounded bg-cyan-700 text-white hover:bg-cyan-600 transition-colors"
            >
              {i18n.language === 'ru' ? 'EN' : 'RU'}
            </button>
            
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-md bg-gray-700 flex items-center justify-center text-cyan-400 mr-4">
                <span className="text-2xl font-bold">{protocol.name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{protocol.name}</h1>
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar size={14} className="mr-1" />
                  <span>{t('Last scan')}: {protocol.lastScan}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex items-center px-3 py-1.5 bg-gray-700 rounded-full">
              <AlertTriangle size={14} className={vulnerabilityCount > 0 ? "text-yellow-400" : "text-gray-400"} />
              <span className="ml-2 text-sm text-gray-200">{vulnerabilityCount} {t('Vulnerabilities')}</span>
            </div>
            
            <div className="flex items-center px-3 py-1.5 bg-gray-700 rounded-full">
              <CheckCircle size={14} className="text-cyan-400" />
              <span className="ml-2 text-sm text-gray-200">{changesCount} {t('Changes')}</span>
            </div>
            
            <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-medium rounded-md transition-colors">
              {t('Scan Now')}
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

        <h3 className="text-lg font-semibold text-white mb-4 mt-8">{t('Smart Contracts')}</h3>
        
        {protocol.contracts.length === 0 ? (
          <div className="bg-gray-900 p-6 rounded-lg text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400">{t('No contract data available for this protocol')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {protocol.contracts.map(contract => (
              <div 
                key={contract.id}
                className="bg-gray-900/70 border border-gray-800 rounded-lg p-4 hover:border-cyan-500 transition-all cursor-pointer"
                onClick={() => setSelectedContract(contract)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-medium">{contract.name}</h4>
                    <p className="text-gray-400 text-xs flex items-center">
                      <span className="font-mono truncate max-w-xs">{contract.address}</span>
                      <a 
                        href={`https://bscscan.com/address/${contract.address}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-1 text-cyan-400 hover:text-cyan-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={12} />
                      </a>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Shield size={16} className={`${
                      contract.securityScore >= 90 ? 'text-green-400' : 
                      contract.securityScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                    } mr-1`} />
                    <span className={`text-xs font-semibold ${
                      contract.securityScore >= 90 ? 'text-green-400' : 
                      contract.securityScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {contract.securityScore}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-3">{contract.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-800 text-white">
                      {contract.type}
                    </span>
                    {contract.hasChanges && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-900/30 text-yellow-400">
                        {t('Recent Changes')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('Updated')}: {contract.lastUpdated}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};