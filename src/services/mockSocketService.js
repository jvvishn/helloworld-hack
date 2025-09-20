// Mock Socket Service for testing without real backend
class MockSocketService {
  constructor() {
    this.isConnected = false;
    this.listeners = new Map();
    this.mockMessages = [];
  }

  connect(user) {
    console.log('Mock socket connected for user:', user?.name);
    this.isConnected = true;
    
    // Simulate connection after a delay
    setTimeout(() => {
      this.triggerEvent('connect');
    }, 1000);
    
    return this;
  }

  disconnect() {
    console.log('Mock socket disconnected');
    this.isConnected = false;
    this.triggerEvent('disconnect');
  }

  joinGroup(groupId) {
    console.log(`Mock: Joined group ${groupId}`);
  }

  leaveGroup(groupId) {
    console.log(`Mock: Left group ${groupId}`);
  }

  sendMessage(groupId, message, user) {
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

  console.log('Mock: Sending message', messageData);
  
  // DON'T simulate receiving your own message back
  // Real socket.io would broadcast to others, not back to sender
  // setTimeout(() => {
  //   this.triggerEvent('chat-message', messageData);
  // }, 100);

  return messageData;
}

  sendWhiteboardUpdate(groupId, drawingData) {
    console.log('Mock: Whiteboard update sent');
  }

  sendTyping(groupId, isTyping, userName) {
    console.log(`Mock: ${userName} is ${isTyping ? 'typing' : 'stopped typing'}`);
    
    // Simulate typing indicator
    setTimeout(() => {
      this.triggerEvent('typing', { userName, isTyping });
    }, 100);
  }

  updatePresence(groupId, status) {
    console.log(`Mock: Presence updated to ${status}`);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  removeAllListeners(event) {
    this.listeners.delete(event);
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: 'mock-socket-id',
    };
  }

  getSocket() {
    return this;
  }

  // Helper method to trigger events
  triggerEvent(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Simulate incoming messages for testing
  // Simulate incoming messages for testing
simulateIncomingMessage(groupId) {
  const mockUsers = [
    { uid: 'user2', name: 'Alice Johnson' },
    { uid: 'user3', name: 'Bob Smith' },
    { uid: 'user4', name: 'Carol Davis' }
  ];
  
  const mockMessages = [
    "Hey everyone! Ready for today's study session?",
    "I have some questions about the data structures assignment",
    "Should we start with reviewing linked lists?",
    "I found a great resource for tree algorithms",
    "Can someone explain binary search trees?"
  ];
  
  const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
  
  const messageData = {
    id: Date.now().toString(),
    groupId,
    message: randomMessage,
    user: randomUser,
    timestamp: new Date().toISOString(),
  };
  
  // This simulates receiving a message from someone ELSE
  this.triggerEvent('chat-message', messageData);
}

sendWhiteboardUpdate(groupId, drawingData) {
  console.log('Mock: Whiteboard update sent', drawingData);
  
  // Simulate receiving whiteboard updates from other users occasionally
  if (Math.random() < 0.1) { // 10% chance
    setTimeout(() => {
      this.simulateRemoteDrawing(groupId);
    }, 2000);
  }
}

// Add this new method for simulating remote drawing
simulateRemoteDrawing(groupId) {
  const mockUsers = [
    { uid: 'user2', name: 'Alice Johnson' },
    { uid: 'user3', name: 'Bob Smith' },
  ];
  
  const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  
  // Simple mock canvas data representing a circle
  const mockCanvasData = {
    version: '5.2.4',
    objects: [
      {
        type: 'circle',
        version: '5.2.4',
        left: Math.random() * 600 + 100,
        top: Math.random() * 300 + 100,
        width: 60,
        height: 60,
        fill: 'transparent',
        stroke: '#' + Math.floor(Math.random()*16777215).toString(16),
        strokeWidth: 2,
        radius: 30,
      }
    ],
    background: 'white'
  };
  
  const updateData = {
    type: 'object:added',
    userId: randomUser.uid,
    userName: randomUser.name,
    timestamp: Date.now(),
    canvasData: mockCanvasData
  };
  
  this.triggerEvent('whiteboard-update', updateData);
}
}

export default new MockSocketService();