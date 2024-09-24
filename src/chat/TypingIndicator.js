// TypingIndicator.jsx
import React from 'react';
import './TypingAnimation.css'; // Ensure the path is correct based on your project structure

const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  // Helper function to format the typing message
  const formatTypingMessage = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing`;
    } else {
      return 'Several people are typing';
    }
  };

  return (
    <div
      className="flex items-center text-gray-500 italic"
      aria-live="polite" // Enhances accessibility
    >
      <span>{formatTypingMessage()}</span>
      <div className="typing-animation ml-2">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
