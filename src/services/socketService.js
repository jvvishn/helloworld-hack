import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Connect to socket server
  connect(user) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const URL = process.env.REACT_APP_BACKEND_URL?.replace('/api', '') || 'http://localhost:4000';
    
    this.socket = io(URL, {
      auth: {
        userId: user?.uid,
        userName: user?.name,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
    });

    return this.socket;
  }

  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Join a study group room
  joinGroup(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-group', groupId);
      console.log(`Joined group: ${groupId}`);
    }
  }

  // Leave a study group room
  leaveGroup(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-group', groupId);
      console.log(`Left group: ${groupId}`);
    }
  }

  // Send chat message
  sendMessage(groupId, message, user) {
    if (this.socket && this.isConnected) {
      const messageData = {
        id: Date.now().toString(),
        groupId,
        message: message.trim(),
        user: {
          uid: user.uid,
          name: user.name,
        },
        timestamp: new Date().toISOString(),
      };

      this.socket.emit('chat-message', messageData);
      return messageData;
    }
    return null;
  }

  // Send whiteboard update
  sendWhiteboardUpdate(groupId, drawingData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('whiteboard-update', {
        groupId,
        data: drawingData,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Send typing indicator
  sendTyping(groupId, isTyping, userName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', {
        groupId,
        isTyping,
        userName,
      });
    }
  }

  // Send user presence update
  updatePresence(groupId, status) {
    if (this.socket && this.isConnected) {
      this.socket.emit('user-presence', {
        groupId,
        status, // 'active', 'idle', 'away'
      });
    }
  }

  // Generic event listener with cleanup tracking
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Track listeners for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from tracking
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      this.listeners.delete(event);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
    };
  }

  // Get socket instance (for advanced usage)
  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
export default new SocketService();