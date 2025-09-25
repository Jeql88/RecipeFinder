// components/ThemePreview.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeColors, CustomTheme } from '../app/store/slices/themeSlice';

interface ThemePreviewProps {
  theme: CustomTheme;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  isActive?: boolean;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  size = 'medium',
  onPress,
  isActive = false,
}) => {
  const sizeConfig = {
    small: { width: 80, height: 100, fontSize: 10 },
    medium: { width: 120, height: 150, fontSize: 12 },
    large: { width: 160, height: 200, fontSize: 14 },
  };

  const config = sizeConfig[size];

  const styles = StyleSheet.create({
    container: {
      width: config.width,
      height: config.height,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: isActive ? theme.colors.primary : 'transparent',
      backgroundColor: theme.colors.background,
    },
    header: {
      height: config.height * 0.3,
      backgroundColor: theme.colors.surface,
      padding: 8,
      justifyContent: 'center',
    },
    headerText: {
      fontSize: config.fontSize,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      padding: 8,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 6,
      padding: 6,
      marginBottom: 6,
    },
    cardText: {
      fontSize: config.fontSize - 2,
      color: theme.colors.text,
      marginBottom: 2,
    },
    cardSubtext: {
      fontSize: config.fontSize - 4,
      color: theme.colors.textSecondary,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
      padding: 4,
      alignItems: 'center',
      marginTop: 4,
    },
    buttonText: {
      fontSize: config.fontSize - 2,
      color: theme.colors.text,
      fontWeight: '500',
    },
    colorPalette: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    colorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    footer: {
      height: config.height * 0.2,
      backgroundColor: theme.colors.surface,
      padding: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      fontSize: config.fontSize - 2,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText} numberOfLines={1}>
          {theme.name}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Sample Card */}
        <View style={styles.card}>
          <Text style={styles.cardText}>Sample Card</Text>
          <Text style={styles.cardSubtext}>Preview text</Text>
        </View>

        {/* Sample Button */}
        <View style={styles.button}>
          <Text style={styles.buttonText}>Button</Text>
        </View>

        {/* Color Palette */}
        <View style={styles.colorPalette}>
          <View style={[styles.colorDot, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.colorDot, { backgroundColor: theme.colors.accent }]} />
          <View style={[styles.colorDot, { backgroundColor: theme.colors.secondary }]} />
          <View style={[styles.colorDot, { backgroundColor: theme.colors.success }]} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText} numberOfLines={1}>
          {theme.category} • v{theme.version}
        </Text>
      </View>
    </Component>
  );
};

export default ThemePreview;
