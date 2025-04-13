// ThemeContext.js
import React, { createContext, useState } from "react";
import { View } from "react-native";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <View className={isDark ? "dark flex-1" : "flex-1"}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};
