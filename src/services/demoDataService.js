// Demo data for presentations and testing
class DemoDataService {
  constructor() {
    this.demoUsers = [
      { uid: 'demo1', name: 'Alice Johnson', email: 'alice@university.edu' },
      { uid: 'demo2', name: 'Bob Smith', email: 'bob@university.edu' },
      { uid: 'demo3', name: 'Carol Davis', email: 'carol@university.edu' },
      { uid: 'demo4', name: 'David Wilson', email: 'david@university.edu' },
    ];

    this.demoGroups = [
      {
        id: 'cs101-group',
        name: 'CS 101 - Data Structures',
        subject: 'Computer Science',
        members: 4,
        description: 'Study group focused on algorithms and data structures',
        nextSession: 'Today, 3:00 PM',
        location: 'Library Room 201'
      },
      {
        id: 'math205-group',
        name: 'MATH 205 - Calculus II',
        subject: 'Mathematics',
        members: 3,
        description: 'Working through integration and series problems',
        nextSession: 'Tomorrow, 2:00 PM',
        location: 'Math Building 305'
      },
      {
        id: 'phys101-group',
        name: 'PHYS 101 - Mechanics',
        subject: 'Physics',
        members: 5,
        description: 'Lab prep and problem solving sessions',
        nextSession: 'Wednesday, 4:00 PM',
        location: 'Science Building'
      }
    ];

    this.demoMessages = [
      "Hey everyone! Ready for today's study session?",
      "I have some questions about the linked list implementation",
      "Should we start with reviewing the homework problems?",
      "I found a great resource for understanding binary trees",
      "Can someone explain the difference between BFS and DFS?",
      "Let's work through problem 3.7 together",
      "Does anyone have notes from last week's lecture?",
      "I think we should focus on the upcoming midterm topics",
    ];

    this.demoStats = {
      activeGroups: 3,
      studySessions: 12,
      studyPartners: 8,
      averageRating: 4.2
    };
  }

  // Get demo user
  getDemoUser() {
    return {
      uid: 'demo-user',
      name: 'Demo User',
      email: 'demo@studygroup.com',
      profile: {
        learningStyle: 'visual',
        subjects: ['Computer Science', 'Mathematics'],
        studyTimes: ['afternoon', 'evening'],
        groupSize: 'medium'
      }
    };
  }

  // Get demo groups
  getDemoGroups() {
    return this.demoGroups;
  }

  // Get demo stats
  getDemoStats() {
    return this.demoStats;
  }

  // Get random demo message
  getRandomMessage() {
    return this.demoMessages[Math.floor(Math.random() * this.demoMessages.length)];
  }

  // Get demo users for presence
  getDemoUsers() {
    return this.demoUsers.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  // Simulate realistic demo flow
  startDemoSequence(callbacks) {
    const sequence = [
      { delay: 2000, action: () => callbacks.showNotification('Alice joined the group', 'info') },
      { delay: 4000, action: () => callbacks.addMessage('demo2', 'Alice Johnson', this.getRandomMessage()) },
      { delay: 7000, action: () => callbacks.showTyping('Bob Smith', true) },
      { delay: 9000, action: () => callbacks.showTyping('Bob Smith', false) },
      { delay: 9500, action: () => callbacks.addMessage('demo3', 'Bob Smith', this.getRandomMessage()) },
      { delay: 12000, action: () => callbacks.addWhiteboardUpdate('Alice drew a diagram') },
      { delay: 15000, action: () => callbacks.showNotification('Study session starting in 5 minutes', 'warning') },
    ];

    sequence.forEach(({ delay, action }) => {
      setTimeout(action, delay);
    });
  }
}

export default new DemoDataService();