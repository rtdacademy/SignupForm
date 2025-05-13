import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { useAudio } from '../../../context/AudioContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Global text selection handler that shows a read-aloud button when text is selected
 * Uses the global AudioContext for consistent audio state management
 */
const GlobalTextSelectionHandler = () => {
  const [selectedText, setSelectedText] = useState('');
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [showButton, setShowButton] = useState(false);
  const { playText, isPlaying, isLoading, currentText } = useAudio();

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text) {
        // Get position for the button (near the end of selection)
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(text);
        setButtonPosition({
          top: rect.bottom + window.scrollY,
          left: rect.right + window.scrollX
        });
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    // Add listener for mouseup (when selection is made)
    document.addEventListener('mouseup', handleSelection);
    
    // Clean up
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);

  // Handle click outside to hide the button
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showButton && !e.target.closest('.tts-button')) {
        setShowButton(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showButton]);
  
  // Check if the currently selected text is playing
  const isThisTextPlaying = isPlaying && currentText === selectedText;

  // Get icon based on state
  const getIcon = () => {
    if (isLoading && currentText === selectedText) {
      return <LoadingSpinner />;
    }
    
    if (isThisTextPlaying) {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-4 h-4" 
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
        className="w-4 h-4" 
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

  return (
    <>
      {showButton && (
        <div 
          className="tts-button fixed z-50 shadow-lg rounded-md bg-white border border-gray-200"
          style={{ 
            top: `${buttonPosition.top}px`, 
            left: `${buttonPosition.left}px`,
            transform: 'translate(-50%, 10px)'
          }}
        >
          <Button
            onClick={() => playText(selectedText)}
            size="sm"
            className="flex items-center gap-1 py-1 px-3 bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading && !isThisTextPlaying}
          >
            {getIcon()}
            <span>
              {isLoading && currentText === selectedText ? "Generating audio..." : 
               isThisTextPlaying ? "Stop" : "Read Aloud"}
            </span>
          </Button>
        </div>
      )}
    </>
  );
};

export default GlobalTextSelectionHandler;