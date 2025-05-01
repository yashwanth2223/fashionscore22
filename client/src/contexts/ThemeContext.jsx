import React, { createContext, useState, useContext, useEffect } from 'react';

// Create theme context
const ThemeContext = createContext();

// Create theme provider component
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // First check localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // Then check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  });

  // Apply theme to document element when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light-mode', 'dark-mode');
    
    // Add appropriate class based on current theme
    root.classList.add(`${theme}-mode`);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Log to confirm theme change
    console.log('Theme changed to:', theme);
  }, [theme]);

  // Toggle between light and dark mode
  function toggleTheme() {
    console.log('Toggle theme called, current theme:', theme);
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('Switching from', prevTheme, 'to', newTheme);
      return newTheme;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 