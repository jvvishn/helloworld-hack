import { useEffect } from 'react';

const usePerformance = (componentName) => {
  useEffect(() => {
    // Performance monitoring in development
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (renderTime > 100) { // Log slow renders
          console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      };
    }
  }, [componentName]);
};

export default usePerformance;