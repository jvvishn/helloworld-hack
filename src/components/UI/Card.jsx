import React from 'react';

const Card = ({ children, className = '', hover = false, ...props }) => {
  const cardClasses = `
    bg-white rounded-lg shadow-md border border-gray-200 p-6
    ${hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}
    ${className}
  `;

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;