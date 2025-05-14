import React from 'react';
import GoogleAIChatApp from './GoogleAIChatApp';

// Simple wrapper component for the Google AI Chat application
const GoogleAIChatPage = () => {
  // Enhanced first message with rich content example
  const richFirstMessage = `
    <div>
      <h3 style="font-weight: bold; margin-bottom: 8px;">Hello! I'm your AI assistant</h3>
      <p>I can help you with a variety of tasks. Would you like to:</p>
      <ul style="margin-top: 8px; margin-left: 16px; list-style-type: disc;">
        <li>Hear a joke</li>
        <li>Learn about a topic</li>
        <li>Get help with a question</li>
      </ul>
      <p style="margin-top: 8px;">Just let me know how I can assist you today!</p>
    </div>
  `;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 min-h-0">
        <GoogleAIChatApp 
          firstMessage={richFirstMessage}
        />
      </div>
    </div>
  );
};

export default GoogleAIChatPage;