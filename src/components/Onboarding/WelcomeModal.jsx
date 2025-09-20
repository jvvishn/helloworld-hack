import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';

const WelcomeModal = ({ isOpen, onClose, onComplete, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    learningStyle: '',
    subjects: [],
    studyTimes: [],
    groupSize: 'small',
  });

  const steps = [
    {
      title: 'Welcome to StudyGroup!',
      component: 'welcome'
    },
    {
      title: 'What\'s your learning style?',
      component: 'learningStyle'
    },
    {
      title: 'What subjects are you studying?',
      component: 'subjects'
    },
    {
      title: 'When do you prefer to study?',
      component: 'studyTimes'
    },
    {
      title: 'Setup complete!',
      component: 'complete'
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(preferences);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleArrayItem = (key, item) => {
    setPreferences(prev => ({
      ...prev,
      [key]: prev[key].includes(item) 
        ? prev[key].filter(i => i !== item)
        : [...prev[key], item]
    }));
  };

  const renderStepContent = () => {
    switch (currentStepData.component) {
      case 'welcome':
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome, {user?.name}!
            </h2>
            <p className="text-gray-600 mb-6">
              Let's set up your profile to help you find the perfect study partners. 
              This will only take a minute!
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                We'll use this information to match you with compatible study groups
                and suggest optimal study sessions.
              </p>
            </div>
          </div>
        );

      case 'learningStyle':
        return (
          <div className="py-4">
            <p className="text-gray-600 mb-6">
              Understanding your learning style helps us match you with compatible study partners.
            </p>
            <div className="space-y-3">
              {[
                { id: 'visual', label: 'Visual', desc: 'Learn best with diagrams, charts, and visual aids' },
                { id: 'auditory', label: 'Auditory', desc: 'Learn best through listening and discussion' },
                { id: 'kinesthetic', label: 'Kinesthetic', desc: 'Learn best through hands-on activities' },
                { id: 'reading', label: 'Reading/Writing', desc: 'Learn best through reading and taking notes' }
              ].map(style => (
                <label key={style.id} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="learningStyle"
                    value={style.id}
                    checked={preferences.learningStyle === style.id}
                    onChange={(e) => updatePreference('learningStyle', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{style.label}</div>
                    <div className="text-sm text-gray-600">{style.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 'subjects':
        return (
          <div className="py-4">
            <p className="text-gray-600 mb-6">
              Select the subjects you're currently studying (choose multiple):
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Computer Science', 'Mathematics', 'Physics', 'Chemistry',
                'Biology', 'History', 'Literature', 'Psychology',
                'Economics', 'Engineering', 'Statistics', 'Other'
              ].map(subject => (
                <label key={subject} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={preferences.subjects.includes(subject)}
                    onChange={() => toggleArrayItem('subjects', subject)}
                  />
                  <span className="text-sm">{subject}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'studyTimes':
        return (
          <div className="py-4">
            <p className="text-gray-600 mb-6">
              When do you prefer to study? (select all that apply):
            </p>
            <div className="space-y-3">
              {[
                { id: 'morning', label: 'Morning (6 AM - 12 PM)', icon: '🌅' },
                { id: 'afternoon', label: 'Afternoon (12 PM - 6 PM)', icon: '☀️' },
                { id: 'evening', label: 'Evening (6 PM - 10 PM)', icon: '🌆' },
                { id: 'night', label: 'Night (10 PM - 12 AM)', icon: '🌙' },
                { id: 'weekends', label: 'Weekends', icon: '📅' }
              ].map(time => (
                <label key={time.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={preferences.studyTimes.includes(time.id)}
                    onChange={() => toggleArrayItem('studyTimes', time.id)}
                  />
                  <span className="text-lg">{time.icon}</span>
                  <span className="text-sm">{time.label}</span>
                </label>
              ))}
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred group size:
              </label>
              <select
                value={preferences.groupSize}
                onChange={(e) => updatePreference('groupSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small (2-3 people)</option>
                <option value="medium">Medium (4-5 people)</option>
                <option value="large">Large (6+ people)</option>
              </select>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              You're all set!
            </h2>
            <p className="text-gray-600 mb-6">
              Your profile has been created. We'll use this information to help you 
              find the perfect study partners and groups.
            </p>
            <div className="bg-green-50 p-4 rounded-lg text-left">
              <h3 className="font-medium text-green-800 mb-2">Your preferences:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>Learning style: {preferences.learningStyle}</li>
                <li>Subjects: {preferences.subjects.join(', ')}</li>
                <li>Study times: {preferences.studyTimes.join(', ')}</li>
                <li>Group size: {preferences.groupSize}</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className="min-h-[400px]">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{currentStepData.title}</span>
            <span>{currentStep + 1} of {steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <div>
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          
          <div className="space-x-2">
            {currentStep < steps.length - 1 && (
              <Button variant="outline" onClick={() => onComplete({})}>
                Skip Setup
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;