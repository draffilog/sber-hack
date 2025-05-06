import React from 'react';
import { Menu } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#0A0F16]/80 backdrop-blur-sm border-b border-gray-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-cyan-400">SH1FR</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">Features</a>
            <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">Documentation</a>
            <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">About</a>
            <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg font-bold transition-all">
              Launch App
            </button>
          </div>

          <button className="md:hidden text-gray-300 hover:text-cyan-400">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};