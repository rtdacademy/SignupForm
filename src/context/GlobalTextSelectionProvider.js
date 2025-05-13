import React from 'react';
import GlobalTextSelectionHandler from '../FirebaseCourses/components/TextToSpeech/GlobalTextSelectionHandler';

/**
 * Provider component that adds global text selection and text-to-speech functionality
 */
const GlobalTextSelectionProvider = ({ children }) => {
  return (
    <>
      {children}
      <GlobalTextSelectionHandler />
    </>
  );
};

export default GlobalTextSelectionProvider;