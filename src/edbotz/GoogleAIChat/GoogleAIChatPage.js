import React from 'react';
import GoogleAIChatApp from './GoogleAIChatApp';

// Simple wrapper component for the Google AI Chat application
const GoogleAIChatPage = () => {
  // Define instructions and first message
  const instructions = "You are an educational AI assistant that helps users learn about various topics. Provide clear, accurate, and concise explanations.";
  const firstMessage = "Hello! I'm your Edbotz AI tutor. I can help you understand concepts, answer questions, or provide learning resources. What would you like to learn about today?";
  
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 min-h-0">
        <GoogleAIChatApp 
          instructions={instructions}
          firstMessage={firstMessage}
        />
      </div>
    </div>
  );
};

export default GoogleAIChatPage;