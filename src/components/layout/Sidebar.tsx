import React from 'react';
import { LayoutDashboard, GitBranch, Shield, Activity, Settings, HelpCircle } from 'lucide-react';
import { useProtocol } from '../../context/ProtocolContext';

export const Sidebar = () => {
  const { protocols, selectedProtocol, setSelectedProtocol } = useProtocol();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-800 bg-gray-900/90 h-[calc(100vh-64px)] sticky top-16">
      <nav className="flex-1 px-4 pt-4">
        <ul className="space-y-2">
          <li>
            <a 
              href="#" 
              className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-800 rounded-md group transition-colors"
            >
              <LayoutDashboard className="mr-3 text-gray-400 group-hover:text-cyan-400" size={20} />
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className="flex items-center px-4 py-3 bg-gray-800 text-cyan-400 rounded-md group transition-colors"
            >
              <GitBranch className="mr-3 text-cyan-400" size={20} />
              <span>Protocols</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-800 rounded-md group transition-colors"
            >
              <Shield className="mr-3 text-gray-400 group-hover:text-cyan-400" size={20} />
              <span>Security</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-800 rounded-md group transition-colors"
            >
              <Activity className="mr-3 text-gray-400 group-hover:text-cyan-400" size={20} />
              <span>Analytics</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs uppercase text-gray-500 font-semibold mb-3">Protocols</p>
        <ul className="space-y-1">
          {protocols.map(protocol => (
            <li key={protocol.id}>
              <button
                className={`w-full text-left px-3 py-2 rounded-md ${
                  selectedProtocol?.id === protocol.id
                    ? 'bg-gray-800 text-cyan-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                } transition-colors flex items-center`}
                onClick={() => setSelectedProtocol(protocol)}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></span>
                {protocol.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-auto p-4 border-t border-gray-800">
        <ul className="space-y-2">
          <li>
            <a 
              href="#" 
              className="flex items-center px-4 py-2 text-gray-400 hover:text-gray-200 rounded-md group transition-colors"
            >
              <Settings className="mr-3 text-gray-500 group-hover:text-gray-400" size={18} />
              <span>Settings</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className="flex items-center px-4 py-2 text-gray-400 hover:text-gray-200 rounded-md group transition-colors"
            >
              <HelpCircle className="mr-3 text-gray-500 group-hover:text-gray-400" size={18} />
              <span>Help</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};