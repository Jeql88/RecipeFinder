// app/components/ThemeProvider.tsx
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from '../app/store/store';
import { useTheme } from '../app/hooks/useTheme';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </>
  );
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <ThemeWrapper>
        {children}
      </ThemeWrapper>
    </Provider>
  );
};