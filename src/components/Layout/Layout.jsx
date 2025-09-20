import React from 'react';
import Header from './Header';

const Layout = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto py-4 lg:py-6 px-0 lg:px-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;