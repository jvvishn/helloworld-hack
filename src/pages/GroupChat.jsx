import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatBox from '../components/Chat/ChatBox';
import UserPresence from '../components/UI/UserPresence';
import Whiteboard from '../components/Whiteboard/Whiteboard';
import ChecklistView from '../components/Checklist/ChecklistView';
import Button from '../components/UI/Button';
import { useNotification } from '../contexts/NotificationContext';
import socketService from '../services/mockSocketService';

const GroupChat = () => {
  const { groupId } = useParams();
  const { showSuccess, showInfo } = useNotification();
  const [activeTab, setActiveTab] = useState('chat');

  // Mock group data
  const group = {
    id: groupId || 'demo-group',
    name: 'CS 101 - Data Structures Study Group',
    subject: 'Computer Science',
    members: 4,
  };

  const handleTestNotification = () => {
    showSuccess('Real-time features are working!', 3000);
  };

  const handleInfoNotification = () => {
    showInfo('This is a demo of the real-time chat system', 4000);
  };

  const handleSimulateMessage = () => {
    socketService.simulateIncomingMessage(group.id);
  };

  const tabs = [
    { 
      id: 'chat', 
      label: 'Chat', 
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' 
    },
    { 
      id: 'whiteboard', 
      label: 'Whiteboard', 
      icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' 
    },
    { 
      id: 'checklists', 
      label: 'Checklists', 
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h6m-6 4h6m-6 4h6' 
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          {group.name}
        </h1>
        <p className="text-gray-600 mt-1">
          {group.subject} • {group.members} members
        </p>
        
        {/* Test buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="small" onClick={handleTestNotification}>
            Test Success Notification
          </Button>
          <Button variant="outline" size="small" onClick={handleInfoNotification}>
            Test Info Notification
          </Button>
          <Button variant="outline" size="small" onClick={handleSimulateMessage}>
            Simulate Incoming Message
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white rounded-t-lg mb-6">
        <nav className="flex space-x-8 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-6">
            {/* Chat */}
            <div className="xl:col-span-3">
              <ChatBox groupId={group.id} />
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <UserPresence groupId={group.id} />
              
              {/* Group info */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Group Info</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Subject:</span>
                    <span className="ml-2 font-medium">{group.subject}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Members:</span>
                    <span className="ml-2 font-medium">{group.members}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2 font-medium">2 days ago</span>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="small" className="w-full">
                    View Schedule
                  </Button>
                  <Button variant="outline" size="small" className="w-full">
                    Shared Files
                  </Button>
                  <Button variant="outline" size="small" className="w-full">
                    Group Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'whiteboard' && (
          <div className="p-6">
            <Whiteboard groupId={group.id} />
          </div>
        )}
        
        {activeTab === 'checklists' && (
          <div className="p-6">
            <ChecklistView groupId={group.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;