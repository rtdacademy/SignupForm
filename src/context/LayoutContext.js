import React, { createContext, useState, useContext } from 'react';

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <LayoutContext.Provider value={{ isFullScreen, setIsFullScreen }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);