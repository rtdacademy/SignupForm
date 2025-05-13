import React, { createContext, useContext, useState, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Create a global audio context to manage all text-to-speech
const AudioContext = createContext(null);

/**
 * Global provider for audio management across the entire application
 * This ensures that only one audio can play at a time
 */
export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const audioRef = useRef(new Audio());
  const functions = getFunctions();

  // Play text using TTS
  const playText = async (text) => {
    if (!text || text.trim() === '') return;
    
    // If already playing the same text, stop it
    if (isPlaying && text === currentText) {
      stopAudio();
      return;
    }
    
    // Stop any current audio
    stopAudio();
    
    // Set new text and start loading
    setCurrentText(text);
    setIsLoading(true);
    
    try {
      const textToSpeech = httpsCallable(functions, 'textToSpeechV2');
      const result = await textToSpeech({ text });
      
      setIsLoading(false);
      
      if (result.data && result.data.audioContent) {
        // Play the new audio
        const audioSrc = `data:audio/wav;base64,${result.data.audioContent}`;
        audioRef.current.src = audioSrc;
        audioRef.current.onended = () => setIsPlaying(false);
        
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      setIsLoading(false);
    }
  };

  // Stop audio playback
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  // Context value
  const value = {
    playText,
    stopAudio,
    isPlaying,
    isLoading,
    currentText
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

// Hook to use the audio context
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export default AudioContext;