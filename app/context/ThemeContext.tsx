// app/context/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

type ThemeColors = {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
};

type ThemeContextType = {
  colors: ThemeColors;
  toggleTheme: () => void;
  darkMode: boolean;
};

const darkColors: ThemeColors = {
  background: "#000",
  surface: "#121212",
  card: "#2a2a2a",
  text: "#fff",
  textSecondary: "#aaa",
  border: "#272727",
};

const lightColors: ThemeColors = {
  background: "#fff",
  surface: "#f5f5f5",
  card: "#eaeaea",
  text: "#000",
  textSecondary: "#444",
  border: "#ccc",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const colors = darkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, toggleTheme, darkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return ctx;
};
