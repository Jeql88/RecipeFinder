// app/hooks/useTheme.ts
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { useSharedValue, withTiming, interpolateColor } from 'react-native-reanimated';
import { RootState, AppDispatch } from '../store/store';
import { 
  ThemeColors, 
  LIGHT_THEME, 
  DARK_THEME, 
  loadThemeSettings, 
  saveThemeSettings,
  setTheme,
  setCustomTheme 
} from '../store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch<AppDispatch>();
  const themeState = useSelector((state: RootState) => state.theme);

  // Get current theme colors
  const currentColors = useMemo((): ThemeColors => {
    switch (themeState.currentTheme) {
      case 'light':
        return LIGHT_THEME;
      case 'dark':
        return DARK_THEME;
      case 'custom':
        if (themeState.activeCustomThemeId) {
          const customTheme = themeState.customThemes.find(
            t => t.id === themeState.activeCustomThemeId
          );
          return customTheme?.colors || DARK_THEME;
        }
        return DARK_THEME;
      default:
        return DARK_THEME;
    }
  }, [themeState.currentTheme, themeState.activeCustomThemeId, themeState.customThemes]);

  // Animation values
  const backgroundProgress = useSharedValue(themeState.currentTheme === 'light' ? 1 : 0);
  const textProgress = useSharedValue(themeState.currentTheme === 'light' ? 1 : 0);

  // Update animation progress when theme changes
  useEffect(() => {
    if (themeState.animationEnabled) {
      const targetValue = themeState.currentTheme === 'light' ? 1 : 0;
      backgroundProgress.value = withTiming(targetValue, { duration: 300 });
      textProgress.value = withTiming(targetValue, { duration: 300 });
    } else {
      const targetValue = themeState.currentTheme === 'light' ? 1 : 0;
      backgroundProgress.value = targetValue;
      textProgress.value = targetValue;
    }
  }, [themeState.currentTheme, themeState.animationEnabled]);

  // Load theme settings on mount
  useEffect(() => {
    dispatch(loadThemeSettings());
  }, [dispatch]);

  // Save theme settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      if (!themeState.isLoading) {
        const { isLoading, ...settingsToSave } = themeState;
        dispatch(saveThemeSettings(settingsToSave));
      }
    };
    
    const timeoutId = setTimeout(saveSettings, 500);
    return () => clearTimeout(timeoutId);
  }, [themeState, dispatch]);

  const switchToTheme = (theme: 'light' | 'dark' | 'custom', customThemeId?: string) => {
    if (theme === 'custom' && customThemeId) {
      dispatch(setCustomTheme(customThemeId));
    } else {
      dispatch(setTheme(theme));
    }
  };

  return {
    ...themeState,
    colors: currentColors,
    backgroundProgress,
    textProgress,
    switchToTheme,
    isDark: themeState.currentTheme === 'dark' || 
           (themeState.currentTheme === 'custom' && currentColors.background === DARK_THEME.background),
  };
};

// Animated color interpolation hook
export const useAnimatedTheme = () => {
  const { colors, backgroundProgress, textProgress, animationEnabled } = useTheme();

  const animatedBackgroundColor = useMemo(() => {
    if (!animationEnabled) return colors.background;
    
    return interpolateColor(
      backgroundProgress.value,
      [0, 1],
      [DARK_THEME.background, LIGHT_THEME.background]
    );
  }, [colors.background, backgroundProgress, animationEnabled]);

  const animatedTextColor = useMemo(() => {
    if (!animationEnabled) return colors.text;
    
    return interpolateColor(
      textProgress.value,
      [0, 1],
      [DARK_THEME.text, LIGHT_THEME.text]
    );
  }, [colors.text, textProgress, animationEnabled]);

  return {
    colors,
    animatedBackgroundColor,
    animatedTextColor,
    backgroundProgress,
    textProgress,
  };
};

// Style generator hook
export const useThemedStyles = <T>(styleCreator: (colors: ThemeColors) => T): T => {
  const { colors } = useTheme();
  return useMemo(() => styleCreator(colors), [colors, styleCreator]);
};