import React from 'react';
import { featuredStats } from '../../data/mockData';

export const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredStats.map(stat => (
        <div key={stat.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-md bg-gray-900 flex items-center justify-center ${stat.color} mr-4`}>
              <stat.icon size={24} />
            </div>
            <div>
              <h3 className="text-sm text-gray-400 font-medium">{stat.title}</h3>
              <div className="flex items-center mt-1">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full flex items-center ${
                  stat.positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};