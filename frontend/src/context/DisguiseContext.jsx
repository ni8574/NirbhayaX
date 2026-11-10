import React, { createContext, useContext, useState, useEffect } from 'react';

const DisguiseContext = createContext(null);

export const DisguiseProvider = ({ children }) => {
  const [isDisguised, setIsDisguised] = useState(false);
  const [disguiseMode, setDisguiseMode] = useState('calculator'); // 'calculator' or 'weather'

  const toggleDisguise = () => {
    setIsDisguised(prev => !prev);
  };

  const exitDisguise = () => {
    setIsDisguised(false);
  };

  // Keyboard shortcut: ESC 3 times quickly or Ctrl+Q
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        toggleDisguise();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <DisguiseContext.Provider
      value={{
        isDisguised,
        disguiseMode,
        setDisguiseMode,
        toggleDisguise,
        exitDisguise
      }}
    >
      {children}
    </DisguiseContext.Provider>
  );
};

export const useDisguise = () => {
  const context = useContext(DisguiseContext);
  if (!context) {
    throw new Error('useDisguise must be used within a DisguiseProvider');
  }
  return context;
};

