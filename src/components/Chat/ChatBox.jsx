import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/mockSocketService';
import Button from '../UI/Button';

const ChatBox = ({ groupId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection and join group with error handling
  useEffect(() => {
    if (user && groupId) {
      try {
        socketService.connect(user);
        socketService.joinGroup(groupId);

        const handleNewMessage = (messageData) => {
          setMessages(prev => [...prev, messageData]);
          setError(null); // Clear any previous errors
        };

        const handleTyping = ({ userName, isTyping: typing }) => {
          if (userName !== user.name) {
            setTypingUsers(prev => {
              if (typing) {
                return prev.includes(userName) ? prev : [...prev, userName];
              } else {
                return prev.filter(name => name !== userName);
              }
            });
          }
        };

        const handleConnect = () => {
          setIsConnected(true);
          setError(null);
        };

        const handleDisconnect = () => {
          setIsConnected(false);
          setError('Connection lost. Trying to reconnect...');
        };

        const handleError = (errorData) => {
          setError('Failed to send message. Please try again.');
          console.error('Chat error:', errorData);
        };

        socketService.on('chat-message', handleNewMessage);
        socketService.on('typing', handleTyping);
        socketService.on('connect', handleConnect);
        socketService.on('disconnect', handleDisconnect);
        socketService.on('error', handleError);

        setIsConnected(socketService.getConnectionStatus().connected);

        return () => {
          socketService.off('chat-message', handleNewMessage);
          socketService.off('typing', handleTyping);
          socketService.off('connect', handleConnect);
          socketService.off('disconnect', handleDisconnect);
          socketService.off('error', handleError);
          socketService.leaveGroup(groupId);
        };
      } catch (error) {
        setError('Failed to connect to chat. Please refresh the page.');
        console.error('Chat initialization error:', error);
      }
    }
  }, [user, groupId]);

  // Handle typing indicators
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      socketService.sendTyping(groupId, true, user.name);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.sendTyping(groupId, false, user.name);
    }, 1000);
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected) return;

    try {
      // Send message through socket
      const messageData = socketService.sendMessage(groupId, newMessage, user);
      
      if (messageData) {
        // Add to local state immediately for better UX
        setMessages(prev => [...prev, messageData]);
        setNewMessage('');
        setError(null); // Clear any previous errors
        
        // Stop typing indicator
        setIsTyping(false);
        socketService.sendTyping(groupId, false, user.name);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    } catch (error) {
      setError('Failed to send message. Please try again.');
      console.error('Send message error:', error);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-96 bg-white border rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-gray-900">Group Chat</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.user.uid === user.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.user.uid === user.uid
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.user.uid !== user.uid && (
                  <div className="text-xs font-medium mb-1 opacity-75">
                    {message.user.name}
                  </div>
                )}
                <div className="break-words">{message.message}</div>
                <div className={`text-xs mt-1 ${
                  message.user.uid === user.uid ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
              <div className="text-sm text-gray-600">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
              <div className="flex space-x-1 mt-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            size="medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;