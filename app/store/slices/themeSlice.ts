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

export type ThemeCategory = 'music' | 'gaming' | 'professional' | 'creative' | 'minimal' | 'vibrant';

export interface CustomTheme {
  id: string;
  name: string;
  description?: string;
  colors: ThemeColors;
  isCustom: boolean;
  category: ThemeCategory;
  version: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isPublic: boolean;
}

export interface ThemeAnalytics {
  totalThemeSwitches: number;
  mostUsedTheme: string;
  averageSessionTime: number;
  themeUsageStats: Record<string, number>;
}

export interface ThemeState {
  currentTheme: 'light' | 'dark' | 'custom';
  customThemes: CustomTheme[];
  activeCustomThemeId?: string;
  isLoading: boolean;
  animationEnabled: boolean;
  analytics: ThemeAnalytics;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
  };
  lastBackup?: string;
  error?: string;
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
  name: 'Purple Dreams',
  description: 'A vibrant purple theme perfect for creative minds',
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
  category: 'creative',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  usageCount: 0,
  isPublic: false,
};

// Theme validation functions
export const validateThemeColors = (colors: any): colors is ThemeColors => {
  const requiredKeys: (keyof ThemeColors)[] = [
    'primary', 'secondary', 'accent', 'background', 'surface', 'card',
    'text', 'textSecondary', 'border', 'error', 'success', 'warning'
  ];
  
  return requiredKeys.every(key => 
    typeof colors[key] === 'string' && 
    /^#[0-9A-F]{6}$/i.test(colors[key])
  );
};

export const validateCustomTheme = (theme: any): theme is CustomTheme => {
  return (
    typeof theme === 'object' &&
    typeof theme.id === 'string' &&
    typeof theme.name === 'string' &&
    typeof theme.isCustom === 'boolean' &&
    typeof theme.category === 'string' &&
    typeof theme.version === 'string' &&
    typeof theme.createdAt === 'string' &&
    typeof theme.updatedAt === 'string' &&
    typeof theme.usageCount === 'number' &&
    typeof theme.isPublic === 'boolean' &&
    validateThemeColors(theme.colors)
  );
};

export const sanitizeThemeData = (data: any): ThemeState => {
  const defaultState: ThemeState = {
    currentTheme: 'dark',
    customThemes: [DEFAULT_CUSTOM_THEME],
    animationEnabled: true,
    isLoading: false,
    analytics: {
      totalThemeSwitches: 0,
      mostUsedTheme: 'dark',
      averageSessionTime: 0,
      themeUsageStats: {},
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
    },
  };

  if (!data || typeof data !== 'object') {
    return defaultState;
  }

  // Validate and sanitize custom themes
  const customThemes = Array.isArray(data.customThemes) 
    ? data.customThemes.filter(validateCustomTheme)
    : [DEFAULT_CUSTOM_THEME];

  return {
    currentTheme: ['light', 'dark', 'custom'].includes(data.currentTheme) 
      ? data.currentTheme 
      : 'dark',
    customThemes,
    activeCustomThemeId: typeof data.activeCustomThemeId === 'string' 
      ? data.activeCustomThemeId 
      : undefined,
    animationEnabled: typeof data.animationEnabled === 'boolean' 
      ? data.animationEnabled 
      : true,
    isLoading: false,
    analytics: {
      totalThemeSwitches: typeof data.analytics?.totalThemeSwitches === 'number' 
        ? data.analytics.totalThemeSwitches 
        : 0,
      mostUsedTheme: typeof data.analytics?.mostUsedTheme === 'string' 
        ? data.analytics.mostUsedTheme 
        : 'dark',
      averageSessionTime: typeof data.analytics?.averageSessionTime === 'number' 
        ? data.analytics.averageSessionTime 
        : 0,
      themeUsageStats: typeof data.analytics?.themeUsageStats === 'object' 
        ? data.analytics.themeUsageStats 
        : {},
    },
    accessibility: {
      highContrast: typeof data.accessibility?.highContrast === 'boolean' 
        ? data.accessibility.highContrast 
        : false,
      largeText: typeof data.accessibility?.largeText === 'boolean' 
        ? data.accessibility.largeText 
        : false,
      reducedMotion: typeof data.accessibility?.reducedMotion === 'boolean' 
        ? data.accessibility.reducedMotion 
        : false,
    },
    lastBackup: typeof data.lastBackup === 'string' ? data.lastBackup : undefined,
  };
};

const STORAGE_KEY = '@spotify_theme_settings';
const BACKUP_KEY = '@spotify_theme_backup';

const initialState: ThemeState = {
  currentTheme: 'dark',
  customThemes: [DEFAULT_CUSTOM_THEME],
  animationEnabled: true,
  isLoading: false,
  analytics: {
    totalThemeSwitches: 0,
    mostUsedTheme: 'dark',
    averageSessionTime: 0,
    themeUsageStats: {},
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
  },
};

// Async Thunks
export const loadThemeSettings = createAsyncThunk(
  'theme/loadSettings',
  async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsedData = JSON.parse(savedSettings);
        return sanitizeThemeData(parsedData);
      }
      return initialState;
    } catch (error) {
      console.error('Failed to load theme settings:', error);
      // Try to load from backup if main storage fails
      try {
        const backupSettings = await AsyncStorage.getItem(BACKUP_KEY);
        if (backupSettings) {
          const parsedBackup = JSON.parse(backupSettings);
          return sanitizeThemeData(parsedBackup);
        }
      } catch (backupError) {
        console.error('Failed to load backup theme settings:', backupError);
      }
      return initialState;
    }
  }
);

export const saveThemeSettings = createAsyncThunk(
  'theme/saveSettings',
  async (state: Omit<ThemeState, 'isLoading'>) => {
    try {
      const stateToSave = { ...state, lastBackup: new Date().toISOString() };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      // Create backup
      await AsyncStorage.setItem(BACKUP_KEY, JSON.stringify(stateToSave));
      return stateToSave;
    } catch (error) {
      console.error('Failed to save theme settings:', error);
      throw error;
    }
  }
);

export const exportThemes = createAsyncThunk(
  'theme/exportThemes',
  async (themeIds?: string[]) => {
    try {
      const state = await AsyncStorage.getItem(STORAGE_KEY);
      if (!state) throw new Error('No theme data found');
      
      const themeData = JSON.parse(state);
      const themesToExport = themeIds 
        ? themeData.customThemes.filter((theme: CustomTheme) => themeIds.includes(theme.id))
        : themeData.customThemes;
      
      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        themes: themesToExport,
        metadata: {
          totalThemes: themesToExport.length,
          categories: [...new Set(themesToExport.map((t: CustomTheme) => t.category))],
        },
      };
      
      return exportData;
    } catch (error) {
      console.error('Failed to export themes:', error);
      throw error;
    }
  }
);

export const importThemes = createAsyncThunk(
  'theme/importThemes',
  async (importData: any) => {
    try {
      if (!importData || !importData.themes || !Array.isArray(importData.themes)) {
        throw new Error('Invalid import data format');
      }
      
      const validThemes = importData.themes.filter(validateCustomTheme);
      if (validThemes.length === 0) {
        throw new Error('No valid themes found in import data');
      }
      
      // Generate new IDs and timestamps for imported themes
      const importedThemes = validThemes.map((theme: CustomTheme) => ({
        ...theme,
        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        isPublic: false,
      }));
      
      return importedThemes;
    } catch (error) {
      console.error('Failed to import themes:', error);
      throw error;
    }
  }
);

export const createThemeBackup = createAsyncThunk(
  'theme/createBackup',
  async () => {
    try {
      const state = await AsyncStorage.getItem(STORAGE_KEY);
      if (!state) throw new Error('No theme data to backup');
      
      const backupData = {
        ...JSON.parse(state),
        backupCreatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(BACKUP_KEY, JSON.stringify(backupData));
      return backupData.backupCreatedAt;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }
);

export const restoreFromBackup = createAsyncThunk(
  'theme/restoreFromBackup',
  async () => {
    try {
      const backupData = await AsyncStorage.getItem(BACKUP_KEY);
      if (!backupData) throw new Error('No backup found');
      
      const parsedBackup = JSON.parse(backupData);
      const sanitizedData = sanitizeThemeData(parsedBackup);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedData));
      return sanitizedData;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
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
      // Update analytics
      state.analytics.totalThemeSwitches += 1;
      state.analytics.themeUsageStats[action.payload] = (state.analytics.themeUsageStats[action.payload] || 0) + 1;
      
      // Update most used theme
      const mostUsed = Object.entries(state.analytics.themeUsageStats)
        .sort(([,a], [,b]) => b - a)[0];
      if (mostUsed) {
        state.analytics.mostUsedTheme = mostUsed[0];
      }
    },
    setCustomTheme: (state, action: PayloadAction<string>) => {
      state.currentTheme = 'custom';
      state.activeCustomThemeId = action.payload;
      
      // Update theme usage count
      const themeIndex = state.customThemes.findIndex(t => t.id === action.payload);
      if (themeIndex >= 0) {
        state.customThemes[themeIndex].usageCount += 1;
      }
      
      // Update analytics
      state.analytics.totalThemeSwitches += 1;
      state.analytics.themeUsageStats[action.payload] = (state.analytics.themeUsageStats[action.payload] || 0) + 1;
    },
    addCustomTheme: (state, action: PayloadAction<CustomTheme>) => {
      const existingIndex = state.customThemes.findIndex(t => t.id === action.payload.id);
      if (existingIndex >= 0) {
        state.customThemes[existingIndex] = { 
          ...action.payload, 
          updatedAt: new Date().toISOString() 
        };
      } else {
        state.customThemes.push(action.payload);
      }
    },
    updateCustomTheme: (state, action: PayloadAction<{ id: string; updates: Partial<CustomTheme> }>) => {
      const themeIndex = state.customThemes.findIndex(t => t.id === action.payload.id);
      if (themeIndex >= 0) {
        state.customThemes[themeIndex] = { 
          ...state.customThemes[themeIndex], 
          ...action.payload.updates,
          updatedAt: new Date().toISOString()
        };
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
        state.customThemes[themeIndex].updatedAt = new Date().toISOString();
      }
    },
    toggleAnimation: (state) => {
      state.animationEnabled = !state.animationEnabled;
    },
    setAnimationEnabled: (state, action: PayloadAction<boolean>) => {
      state.animationEnabled = action.payload;
    },
    setAccessibilityOption: (state, action: PayloadAction<{ option: keyof ThemeState['accessibility']; value: boolean }>) => {
      const { option, value } = action.payload;
      state.accessibility[option] = value;
    },
    clearError: (state) => {
      state.error = undefined;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadThemeSettings.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(loadThemeSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(loadThemeSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load theme settings';
      })
      .addCase(saveThemeSettings.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(saveThemeSettings.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(saveThemeSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to save theme settings';
      })
      .addCase(importThemes.fulfilled, (state, action) => {
        state.customThemes.push(...action.payload);
      })
      .addCase(importThemes.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to import themes';
      })
      .addCase(createThemeBackup.fulfilled, (state, action) => {
        state.lastBackup = action.payload;
      })
      .addCase(restoreFromBackup.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(restoreFromBackup.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to restore from backup';
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
  setAccessibilityOption,
  clearError,
  setError,
} = themeSlice.actions;

export default themeSlice.reducer;