import { createContext, useState, useEffect, useContext } from 'react';

// Create attempts context
const AttemptsContext = createContext();

// Create provider component
export const AttemptsProvider = ({ children }) => {
  // Initialize attempts from localStorage or set to 0
  const [freeAttempts, setFreeAttempts] = useState(() => {
    const savedAttempts = localStorage.getItem('freeAttempts');
    return savedAttempts ? parseInt(savedAttempts) : 0;
  });

  // Update localStorage when freeAttempts changes
  useEffect(() => {
    localStorage.setItem('freeAttempts', freeAttempts.toString());
  }, [freeAttempts]);

  // Increment attempts
  const incrementAttempts = () => {
    setFreeAttempts(prev => prev + 1);
  };

  // Reset attempts
  const resetAttempts = () => {
    setFreeAttempts(0);
  };

  // Check if free attempts are available
  const hasAttemptsLeft = () => {
    return freeAttempts < 3;
  };

  return (
    <AttemptsContext.Provider
      value={{
        freeAttempts,
        incrementAttempts,
        resetAttempts,
        hasAttemptsLeft
      }}
    >
      {children}
    </AttemptsContext.Provider>
  );
};

// Custom hook to use attempts context
export const useAttempts = () => {
  const context = useContext(AttemptsContext);
  if (!context) {
    throw new Error('useAttempts must be used within an AttemptsProvider');
  }
  return context;
}; 