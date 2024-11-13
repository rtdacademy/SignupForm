import React, { createContext, useContext, useState } from 'react';

const ModeContext = createContext();

export const MODES = {
  TEACHER: 'teacher',
 
  REGISTRATION: 'registration'
};

export function ModeProvider({ children }) {
  const [currentMode, setCurrentMode] = useState(MODES.TEACHER);

  const value = {
    currentMode,
    setCurrentMode,
    MODES,
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}