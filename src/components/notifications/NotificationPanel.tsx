import React from 'react';
import { Bell, X, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { mockNotifications } from '../../data/mockData';

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <Bell size={16} className="text-cyan-400 mr-2" />
          <h3 className="font-medium text-white">Notifications</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
          <X size={16} />
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {mockNotifications.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {mockNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 ${notification.read ? '' : 'bg-gray-750'} hover:bg-gray-700 transition-colors`}
              >
                <div className="flex items-start mb-2">
                  <div className="mr-3 mt-0.5">
                    {notification.type === 'vulnerability' && (
                      <AlertTriangle size={16} className="text-yellow-400" />
                    )}
                    {notification.type === 'change' && (
                      <RefreshCw size={16} className="text-cyan-400" />
                    )}
                    {notification.type === 'info' && (
                      <Info size={16} className="text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                    <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs">
                    {new Date(notification.timestamp).toLocaleString()}
                  </span>
                  {notification.link && (
                    <a href={notification.link} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                      View details
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-400">
            <Bell size={24} className="mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-700">
        <button className="w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          Mark all as read
        </button>
      </div>
    </div>
  );
};