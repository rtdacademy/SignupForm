import React from 'react';
import { Button } from '../../../components/ui/button';
import { useAudio } from '../../../context/AudioContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * A simple button that uses the global audio context to play text
 */
const SimpleReadButton = ({
  text,
  buttonText = "Read Aloud",
  buttonVariant = "outline",
  iconPosition = "left",
  className = ""
}) => {
  const { playText, stopAudio, isPlaying, isLoading, currentText } = useAudio();
  
  // Check if this specific button's text is currently playing
  const isThisPlaying = isPlaying && currentText === text;
  
  // Handle button click - either play or stop
  const handleClick = () => {
    playText(text);
  };
  
  // Get icon based on state
  const getIcon = () => {
    if (isLoading && currentText === text) {
      return <LoadingSpinner />;
    }
    
    if (isThisPlaying) {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
        </svg>
      );
    }
    
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>
    );
  };
  
  // Get button text based on state
  const getButtonText = () => {
    if (isLoading && currentText === text) return "Generating audio...";
    if (isThisPlaying) return "Stop";
    return buttonText;
  };
  
  // Get button classes based on variant
  const getButtonClasses = () => {
    const baseClasses = `flex items-center gap-1.5 text-sm font-medium ${className}`;
    
    switch (buttonVariant) {
      case 'solid':
        return `${baseClasses} bg-purple-600 hover:bg-purple-700 text-white`;
      case 'minimal':
        return `${baseClasses} text-purple-600 hover:bg-purple-50`;
      case 'outline':
      default:
        return `${baseClasses} border border-purple-300 hover:bg-purple-50 text-purple-700`;
    }
  };
  
  return (
    <Button 
      onClick={handleClick}
      disabled={isLoading && !isThisPlaying}
      className={getButtonClasses()}
    >
      {iconPosition !== 'right' && iconPosition !== 'none' && getIcon()}
      <span>{getButtonText()}</span>
      {iconPosition === 'right' && getIcon()}
    </Button>
  );
};

export default SimpleReadButton;