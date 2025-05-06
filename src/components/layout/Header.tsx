import React, { useState } from 'react';
import { Menu, Bell, Search, X } from 'lucide-react';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { mockNotifications } from '../../data/mockData';

export const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="border-b border-gray-800 backdrop-blur-md bg-gray-900/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-4 text-gray-400 hover:text-cyan-400 transition-colors"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center">
            <span className="text-cyan-400 font-mono text-xl font-bold">DeFi</span>
            <span className="text-white font-mono text-xl font-bold">Scanner</span>
          </div>
        </div>
        
        <div className="hidden md:flex relative max-w-md w-full mx-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search protocols, contracts, functions..."
            className="w-full bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <div className="relative">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-800 transition-colors relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} className="text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            )}
          </div>
          
          <button className="ml-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-medium rounded-md flex items-center transition-colors">
            Connect
          </button>
        </div>
      </div>
      
      {showMobileMenu && (
        <div className="md:hidden bg-gray-800 p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <nav>
            <ul className="space-y-2">
              <li>
                <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-700 text-gray-200">Dashboard</a>
              </li>
              <li>
                <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-700 text-gray-200">Protocols</a>
              </li>
              <li>
                <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-700 text-gray-200">Smart Contracts</a>
              </li>
              <li>
                <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-700 text-gray-200">Security Scans</a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};