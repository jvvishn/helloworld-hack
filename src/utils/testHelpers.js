// Testing and demo utilities
export const testHelpers = {
  // Clear all stored data
  clearAllData: () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('All stored data cleared');
  },

  // Reset to fresh user state
  resetUser: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('hasCompletedOnboarding');
    localStorage.removeItem('seenTutorials');
    localStorage.removeItem('userPreferences');
    console.log('User data reset');
  },

  // Enable demo mode
  enableDemoMode: () => {
    localStorage.setItem('demoMode', 'true');
    console.log('Demo mode enabled');
  },

  // Performance testing
  measurePerformance: (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  },

  // Test network conditions
  simulateOffline: () => {
    window.dispatchEvent(new Event('offline'));
    console.log('Offline mode simulated');
  },

  simulateOnline: () => {
    window.dispatchEvent(new Event('online'));
    console.log('Online mode simulated');
  },

  // Log app state
  logAppState: () => {
    const state = {
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
      navigator: {
        onLine: navigator.onLine,
        userAgent: navigator.userAgent
      },
      performance: {
        memory: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        } : 'Not available'
      }
    };
    console.log('App State:', state);
    return state;
  }
};

// Make available in development
if (process.env.NODE_ENV === 'development') {
  window.testHelpers = testHelpers;
}