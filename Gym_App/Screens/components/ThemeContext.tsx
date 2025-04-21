import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
});

// Storage key for persistence
const DARK_MODE_STORAGE_KEY = 'app_dark_mode';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference when app starts
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(DARK_MODE_STORAGE_KEY);
        if (savedTheme !== null) {
          setDarkMode(savedTheme === 'true');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference whenever it changes
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(DARK_MODE_STORAGE_KEY, String(darkMode))
        .catch(error => console.error('Failed to save theme preference:', error));
    }
  }, [darkMode, isLoaded]);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        darkMode, 
        toggleDarkMode,
        setDarkMode 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for easier access to theme context
export const useTheme = () => useContext(ThemeContext);