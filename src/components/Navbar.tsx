import React from 'react';
import { Menu, Home, Layers, AlertTriangle, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';

export const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#0A0F16]/80 backdrop-blur-sm border-b border-gray-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-cyan-400">SH1FR</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/"
              className={`flex items-center gap-2 ${
                isHome ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-400'
              } transition-colors`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/dashboard"
              className={`flex items-center gap-2 ${
                isDashboard ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-400'
              } transition-colors`}
            >
              <Layers className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            <a href="#" className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors">
              <AlertTriangle className="w-4 h-4" />
              <span>Documentation</span>
            </a>
            
            <a href="#" className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors">
              <Info className="w-4 h-4" />
              <span>About</span>
            </a>
            
            {isDashboard ? null : <WalletConnect />}
          </div>

          <button className="md:hidden text-gray-300 hover:text-cyan-400">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};