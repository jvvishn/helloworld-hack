import React, { useState, useEffect } from 'react';
import Button from './Button';

const DemoModeToggle = ({ onToggle }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  const handleToggle = () => {
    const newDemoMode = !isDemoMode;
    setIsDemoMode(newDemoMode);
    localStorage.setItem('demoMode', newDemoMode.toString());
    onToggle(newDemoMode);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        variant={isDemoMode ? 'success' : 'outline'}
        size="small"
        onClick={handleToggle}
        className="shadow-lg"
      >
        {isDemoMode ? '🎬 Demo ON' : '🎬 Demo OFF'}
      </Button>
    </div>
  );
};

export default DemoModeToggle;