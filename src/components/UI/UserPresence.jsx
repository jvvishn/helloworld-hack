import React, { useState, useEffect } from 'react';
import socketService from '../../services/socketService';

const UserPresence = ({ groupId }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userStatuses, setUserStatuses] = useState({});

  useEffect(() => {
    if (!groupId) return;

    // Listen for user presence updates
    const handleUserJoined = (userData) => {
      setOnlineUsers(prev => {
        const exists = prev.find(user => user.uid === userData.uid);
        if (!exists) {
          return [...prev, userData];
        }
        return prev;
      });
      
      setUserStatuses(prev => ({
        ...prev,
        [userData.uid]: 'active'
      }));
    };

    const handleUserLeft = (userData) => {
      setOnlineUsers(prev => prev.filter(user => user.uid !== userData.uid));
      
      setUserStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[userData.uid];
        return newStatuses;
      });
    };

    const handlePresenceUpdate = ({ userId, status }) => {
      setUserStatuses(prev => ({
        ...prev,
        [userId]: status
      }));
    };

    // Add event listeners
    socketService.on('user-joined', handleUserJoined);
    socketService.on('user-left', handleUserLeft);
    socketService.on('presence-update', handlePresenceUpdate);

    return () => {
      socketService.off('user-joined', handleUserJoined);
      socketService.off('user-left', handleUserLeft);
      socketService.off('presence-update', handlePresenceUpdate);
    };
  }, [groupId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'away': return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'idle': return 'Idle';
      case 'away': return 'Away';
      default: return 'Unknown';
    }
  };

  if (onlineUsers.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Online Members</h3>
        <p className="text-gray-500 text-sm">No one is online right now</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">
        Online Members ({onlineUsers.length})
      </h3>
      
      <div className="space-y-2">
        {onlineUsers.map((user) => {
          const status = userStatuses[user.uid] || 'active';
          
          return (
            <div key={user.uid} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              {/* Avatar */}
              <div className="relative">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Status indicator */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(status)}`}></div>
              </div>
              
              {/* User info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {getStatusText(status)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserPresence;