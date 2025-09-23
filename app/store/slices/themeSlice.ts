// app/store/slices/themeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  isCustom: boolean;
}

export interface ThemeState {
  currentTheme: 'light' | 'dark' | 'custom';
  customThemes: CustomTheme[];
  activeCustomThemeId?: string;
  isLoading: boolean;
  animationEnabled: boolean;
}

// Predefined Themes
export const LIGHT_THEME: ThemeColors = {
  primary: '#1DB954',
  secondary: '#1ed760', 
  accent: '#FF6B6B',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
};

export const DARK_THEME: ThemeColors = {
  primary: '#1DB954',
  secondary: '#1ed760',
  accent: '#FF6B6B', 
  background: '#121212',
  surface: '#181818',
  card: '#282828',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  border: '#404040',
  error: '#F15E6C',
  success: '#1DB954',
  warning: '#FFB84D',
};

export const DEFAULT_CUSTOM_THEME: CustomTheme = {
  id: 'custom-1',
  name: 'Custom Theme',
  colors: {
    primary: '#9D4EDD',
    secondary: '#C77DFF',
    accent: '#E0AAFF',
    background: '#10002B',
    surface: '#240046',
    card: '#3C096C',
    text: '#FFFFFF',
    textSecondary: '#C77DFF',
    border: '#5A189A',
    error: '#FF006E',
    success: '#06FFA5',
    warning: '#FFBE0B',
  },
  isCustom: true,
};

const STORAGE_KEY = '@spotify_theme_settings';

const initialState: ThemeState = {
  currentTheme: 'dark',
  customThemes: [DEFAULT_CUSTOM_THEME],
  animationEnabled: true,
  isLoading: false,
};

// Async Thunks
export const loadThemeSettings = createAsyncThunk(
  'theme/loadSettings',
  async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      return savedSettings ? JSON.parse(savedSettings) : initialState;
    } catch (error) {
      console.error('Failed to load theme settings:', error);
      return initialState;
    }
  }
);

export const saveThemeSettings = createAsyncThunk(
  'theme/saveSettings',
  async (state: Omit<ThemeState, 'isLoading'>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    } catch (error) {
      console.error('Failed to save theme settings:', error);
      throw error;
    }
  }
);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'custom'>) => {
      state.currentTheme = action.payload;
      if (action.payload !== 'custom') {
        state.activeCustomThemeId = undefined;
      }
    },
    setCustomTheme: (state, action: PayloadAction<string>) => {
      state.currentTheme = 'custom';
      state.activeCustomThemeId = action.payload;
    },
    addCustomTheme: (state, action: PayloadAction<CustomTheme>) => {
      const existingIndex = state.customThemes.findIndex(t => t.id === action.payload.id);
      if (existingIndex >= 0) {
        state.customThemes[existingIndex] = action.payload;
      } else {
        state.customThemes.push(action.payload);
      }
    },
    updateCustomTheme: (state, action: PayloadAction<{ id: string; updates: Partial<CustomTheme> }>) => {
      const themeIndex = state.customThemes.findIndex(t => t.id === action.payload.id);
      if (themeIndex >= 0) {
        state.customThemes[themeIndex] = { ...state.customThemes[themeIndex], ...action.payload.updates };
      }
    },
    deleteCustomTheme: (state, action: PayloadAction<string>) => {
      state.customThemes = state.customThemes.filter(t => t.id !== action.payload);
      if (state.activeCustomThemeId === action.payload) {
        state.currentTheme = 'dark';
        state.activeCustomThemeId = undefined;
      }
    },
    updateThemeColor: (state, action: PayloadAction<{ themeId: string; colorKey: keyof ThemeColors; color: string }>) => {
      const { themeId, colorKey, color } = action.payload;
      const themeIndex = state.customThemes.findIndex(t => t.id === themeId);
      if (themeIndex >= 0) {
        state.customThemes[themeIndex].colors[colorKey] = color;
      }
    },
    toggleAnimation: (state) => {
      state.animationEnabled = !state.animationEnabled;
    },
    setAnimationEnabled: (state, action: PayloadAction<boolean>) => {
      state.animationEnabled = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadThemeSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadThemeSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(loadThemeSettings.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(saveThemeSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveThemeSettings.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(saveThemeSettings.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  setTheme,
  setCustomTheme,
  addCustomTheme,
  updateCustomTheme,
  deleteCustomTheme,
  updateThemeColor,
  toggleAnimation,
  setAnimationEnabled,
} = themeSlice.actions;

export default themeSlice.reducer;