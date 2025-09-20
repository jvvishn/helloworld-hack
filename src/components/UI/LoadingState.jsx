import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingState = ({ message = "Loading...", fullScreen = false }) => {
  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-gray-50"
    : "flex items-center justify-center py-12";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;