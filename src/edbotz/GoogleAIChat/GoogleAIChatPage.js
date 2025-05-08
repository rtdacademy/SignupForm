import React from 'react';
import GoogleAIChatApp from './GoogleAIChatApp';

// Simple wrapper component for the Google AI Chat application
const GoogleAIChatPage = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 min-h-0">
        <GoogleAIChatApp />
      </div>
    </div>
  );
};

export default GoogleAIChatPage;