import React from 'react';

const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <span className="text-gray-600 text-sm">{message}</span>
    </div>
  );
};

export default PageLoader;