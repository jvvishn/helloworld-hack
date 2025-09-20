import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';

const TutorialOverlay = ({ isActive, steps, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightElement, setHighlightElement] = useState(null);

  const currentStepData = steps[currentStep];

  // Highlight target element
  useEffect(() => {
    if (!isActive || !currentStepData?.target) return;

    const element = document.querySelector(currentStepData.target);
    if (element) {
      setHighlightElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isActive, currentStepData]);

  // Handle overlay clicks
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      nextStep();
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    onSkip();
  };

  if (!isActive || !currentStepData) return null;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!highlightElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = highlightElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    
    let top = rect.bottom + 10;
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

    // Adjust if tooltip goes off screen
    if (top + tooltipHeight > window.innerHeight) {
      top = rect.top - tooltipHeight - 10;
    }
    if (left < 10) {
      left = 10;
    }
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    return { top: `${top}px`, left: `${left}px` };
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      {/* Highlight spotlight */}
      {highlightElement && (
        <div
          className="absolute border-4 border-blue-500 rounded-lg bg-transparent pointer-events-none animate-pulse"
          style={{
            top: `${highlightElement.getBoundingClientRect().top - 4}px`,
            left: `${highlightElement.getBoundingClientRect().left - 4}px`,
            width: `${highlightElement.getBoundingClientRect().width + 8}px`,
            height: `${highlightElement.getBoundingClientRect().height + 8}px`,
          }}
        />
      )}

      {/* Tutorial tooltip */}
      <div
        className="absolute bg-white rounded-lg shadow-xl p-6 max-w-sm"
        style={getTooltipPosition()}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <Button variant="outline" size="small" onClick={prevStep}>
                Back
              </Button>
            )}
            <Button size="small" onClick={nextStep}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
          
          <Button variant="outline" size="small" onClick={skipTutorial}>
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;