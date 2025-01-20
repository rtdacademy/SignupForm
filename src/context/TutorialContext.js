import React, { createContext, useContext, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { loadTutorial } from '../tutorials/tutorialLoader';

const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState(null);

  const showTutorial = async (tutorialId) => {
    try {
      const tutorial = await loadTutorial(tutorialId);
      setCurrentTutorial(tutorial);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to load tutorial:', error);
      // You might want to show a toast notification here
    }
  };

  const closeTutorial = () => {
    setIsOpen(false);
    setCurrentTutorial(null);
  };

  return (
    <TutorialContext.Provider value={{ showTutorial, closeTutorial }}>
      {children}
      {currentTutorial && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentTutorial.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {currentTutorial.content}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};