// app/hooks/useTheme.ts
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { 
  useSharedValue, 
  withTiming, 
  withSpring, 
  withSequence,
  withDelay,
  interpolateColor,
  runOnJS
} from 'react-native-reanimated';
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

  // Animation values with staggered timing
  const backgroundProgress = useSharedValue(themeState.currentTheme === 'light' ? 1 : 0);
  const textProgress = useSharedValue(themeState.currentTheme === 'light' ? 1 : 0);
  const cardProgress = useSharedValue(themeState.currentTheme === 'light' ? 1 : 0);
  const buttonProgress = useSharedValue(themeState.currentTheme === 'light' ? 1 : 0);
  const iconProgress = useSharedValue(themeState.currentTheme === 'light' ? 1 : 0);
  const loadingProgress = useSharedValue(0);

  // Update animation progress when theme changes
  useEffect(() => {
    if (themeState.animationEnabled && !themeState.accessibility.reducedMotion) {
      const targetValue = themeState.currentTheme === 'light' ? 1 : 0;
      
      // Show loading animation first
      loadingProgress.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 150 })
      );

      // Staggered animations with spring physics
      backgroundProgress.value = withDelay(0, withSpring(targetValue, {
        damping: 20,
        stiffness: 300,
        mass: 1,
      }));
      
      textProgress.value = withDelay(100, withSpring(targetValue, {
        damping: 25,
        stiffness: 400,
        mass: 0.8,
      }));
      
      cardProgress.value = withDelay(150, withSpring(targetValue, {
        damping: 22,
        stiffness: 350,
        mass: 0.9,
      }));
      
      buttonProgress.value = withDelay(200, withSpring(targetValue, {
        damping: 18,
        stiffness: 450,
        mass: 0.7,
      }));
      
      iconProgress.value = withDelay(250, withSpring(targetValue, {
        damping: 30,
        stiffness: 500,
        mass: 0.6,
      }));
    } else {
      const targetValue = themeState.currentTheme === 'light' ? 1 : 0;
      backgroundProgress.value = targetValue;
      textProgress.value = targetValue;
      cardProgress.value = targetValue;
      buttonProgress.value = targetValue;
      iconProgress.value = targetValue;
      loadingProgress.value = 0;
    }
  }, [themeState.currentTheme, themeState.animationEnabled, themeState.accessibility.reducedMotion]);

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
    cardProgress,
    buttonProgress,
    iconProgress,
    loadingProgress,
    switchToTheme,
    isDark: themeState.currentTheme === 'dark' || 
           (themeState.currentTheme === 'custom' && currentColors.background === DARK_THEME.background),
  };
};

// Animated color interpolation hook
export const useAnimatedTheme = () => {
  const { 
    colors, 
    backgroundProgress, 
    textProgress, 
    cardProgress,
    buttonProgress,
    iconProgress,
    loadingProgress,
    animationEnabled,
    accessibility 
  } = useTheme();

  const animatedBackgroundColor = useMemo(() => {
    if (!animationEnabled || accessibility.reducedMotion) return colors.background;
    
    return interpolateColor(
      backgroundProgress.value,
      [0, 1],
      [DARK_THEME.background, LIGHT_THEME.background]
    );
  }, [colors.background, backgroundProgress, animationEnabled, accessibility.reducedMotion]);

  const animatedTextColor = useMemo(() => {
    if (!animationEnabled || accessibility.reducedMotion) return colors.text;
    
    return interpolateColor(
      textProgress.value,
      [0, 1],
      [DARK_THEME.text, LIGHT_THEME.text]
    );
  }, [colors.text, textProgress, animationEnabled, accessibility.reducedMotion]);

  const animatedCardColor = useMemo(() => {
    if (!animationEnabled || accessibility.reducedMotion) return colors.card;
    
    return interpolateColor(
      cardProgress.value,
      [0, 1],
      [DARK_THEME.card, LIGHT_THEME.card]
    );
  }, [colors.card, cardProgress, animationEnabled, accessibility.reducedMotion]);

  const animatedButtonColor = useMemo(() => {
    if (!animationEnabled || accessibility.reducedMotion) return colors.primary;
    
    return interpolateColor(
      buttonProgress.value,
      [0, 1],
      [DARK_THEME.primary, LIGHT_THEME.primary]
    );
  }, [colors.primary, buttonProgress, animationEnabled, accessibility.reducedMotion]);

  const animatedSurfaceColor = useMemo(() => {
    if (!animationEnabled || accessibility.reducedMotion) return colors.surface;
    
    return interpolateColor(
      backgroundProgress.value,
      [0, 1],
      [DARK_THEME.surface, LIGHT_THEME.surface]
    );
  }, [colors.surface, backgroundProgress, animationEnabled, accessibility.reducedMotion]);

  return {
    colors,
    animatedBackgroundColor,
    animatedTextColor,
    animatedCardColor,
    animatedButtonColor,
    animatedSurfaceColor,
    backgroundProgress,
    textProgress,
    cardProgress,
    buttonProgress,
    iconProgress,
    loadingProgress,
  };
};

// Style generator hook
export const useThemedStyles = <T>(styleCreator: (colors: ThemeColors) => T): T => {
  const { colors } = useTheme();
  return useMemo(() => styleCreator(colors), [colors, styleCreator]);
};

// Skeleton loading hook for theme transitions
export const useSkeletonAnimation = () => {
  const { loadingProgress, animationEnabled, accessibility } = useTheme();
  
  const skeletonOpacity = useMemo(() => {
    if (!animationEnabled || accessibility.reducedMotion) return 0;
    return loadingProgress.value;
  }, [loadingProgress, animationEnabled, accessibility.reducedMotion]);

  const skeletonScale = useMemo(() => {
    if (!animationEnabled || accessibility.reducedMotion) return 1;
    return interpolateColor(
      loadingProgress.value,
      [0, 0.5, 1],
      [0.8, 1.1, 0.8]
    );
  }, [loadingProgress, animationEnabled, accessibility.reducedMotion]);

  return {
    skeletonOpacity,
    skeletonScale,
    isLoading: loadingProgress.value > 0,
  };
};