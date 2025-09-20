import { useState, useEffect } from 'react';

const useTutorial = (tutorialKey) => {
  const [isActive, setIsActive] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  // Check if user has seen this tutorial
  useEffect(() => {
    const seenTutorials = JSON.parse(localStorage.getItem('seenTutorials') || '{}');
    const hasSeen = seenTutorials[tutorialKey] || false;
    setHasSeenTutorial(hasSeen);
  }, [tutorialKey]);

  // Start tutorial
  const startTutorial = () => {
    setIsActive(true);
  };

  // Complete tutorial
  const completeTutorial = () => {
    setIsActive(false);
    markTutorialAsSeen();
  };

  // Skip tutorial
  const skipTutorial = () => {
    setIsActive(false);
    markTutorialAsSeen();
  };

  // Mark tutorial as seen
  const markTutorialAsSeen = () => {
    const seenTutorials = JSON.parse(localStorage.getItem('seenTutorials') || '{}');
    seenTutorials[tutorialKey] = true;
    localStorage.setItem('seenTutorials', JSON.stringify(seenTutorials));
    setHasSeenTutorial(true);
  };

  // Reset tutorial (for testing)
  const resetTutorial = () => {
    const seenTutorials = JSON.parse(localStorage.getItem('seenTutorials') || '{}');
    delete seenTutorials[tutorialKey];
    localStorage.setItem('seenTutorials', JSON.stringify(seenTutorials));
    setHasSeenTutorial(false);
  };

  return {
    isActive,
    hasSeenTutorial,
    startTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
};

export default useTutorial;