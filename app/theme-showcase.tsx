// app/theme-showcase.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { RootState, AppDispatch } from './store/store';
import {
  setTheme,
  setCustomTheme,
  addCustomTheme,
  deleteCustomTheme,
  exportThemes,
  importThemes,
  createThemeBackup,
  restoreFromBackup,
  ThemeCategory,
  CustomTheme,
  LIGHT_THEME,
  DARK_THEME,
} from './store/slices/themeSlice';
import { useAnimatedTheme } from './hooks/useTheme';
import NavBar from '../components/BottomNav';
import ColorPicker from '../components/ColorPicker';
import SkeletonLoader from '../components/SkeletonLoader';

const THEME_CATEGORIES: { key: ThemeCategory; label: string; icon: string }[] = [
  { key: 'music', label: 'Music', icon: '🎵' },
  { key: 'gaming', label: 'Gaming', icon: '🎮' },
  { key: 'professional', label: 'Professional', icon: '💼' },
  { key: 'creative', label: 'Creative', icon: '🎨' },
  { key: 'minimal', label: 'Minimal', icon: '⚪' },
  { key: 'vibrant', label: 'Vibrant', icon: '🌈' },
];

export default function ThemeShowcaseScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { 
    colors, 
    animatedBackgroundColor, 
    animatedTextColor, 
    animatedCardColor,
    animatedButtonColor,
    animatedSurfaceColor,
    currentTheme,
    customThemes,
    activeCustomThemeId,
    analytics,
    isLoading,
  } = useAnimatedTheme();

  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>('music');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeDescription, setNewThemeDescription] = useState('');
  const [newThemeCategory, setNewThemeCategory] = useState<ThemeCategory>('music');

  const currentCustomTheme = customThemes.find(t => t.id === activeCustomThemeId);

  const handleThemeSwitch = (theme: 'light' | 'dark' | 'custom', customThemeId?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (theme === 'custom' && customThemeId) {
      dispatch(setCustomTheme(customThemeId));
    } else {
      dispatch(setTheme(theme));
    }
  };

  const handleCreateTheme = () => {
    if (!newThemeName.trim()) {
      Alert.alert('Error', 'Please enter a theme name');
      return;
    }

    const newTheme: CustomTheme = {
      id: `custom-${Date.now()}`,
      name: newThemeName.trim(),
      description: newThemeDescription.trim(),
      colors: currentCustomTheme?.colors || DARK_THEME,
      isCustom: true,
      category: newThemeCategory,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      isPublic: false,
    };

    dispatch(addCustomTheme(newTheme));
    setShowCreateModal(false);
    setNewThemeName('');
    setNewThemeDescription('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleExportTheme = async (themeId: string) => {
    try {
      const result = await dispatch(exportThemes([themeId]));
      if (result.payload) {
        await Share.share({
          message: JSON.stringify(result.payload, null, 2),
          title: 'Theme Export',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export theme');
    }
  };

  const handleDeleteTheme = (themeId: string) => {
    Alert.alert(
      'Delete Theme',
      'Are you sure you want to delete this theme?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteCustomTheme(themeId));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const handleBackup = async () => {
    try {
      await dispatch(createThemeBackup());
      Alert.alert('Success', 'Theme backup created successfully');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to create backup');
    }
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Backup',
      'This will restore your themes from the last backup. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await dispatch(restoreFromBackup());
              Alert.alert('Success', 'Themes restored from backup');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert('Error', 'Failed to restore from backup');
            }
          },
        },
      ]
    );
  };

  const filteredThemes = customThemes.filter(theme => theme.category === selectedCategory);

  const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    backButton: { paddingVertical: 8, paddingHorizontal: 4 },
    backButtonText: { fontSize: 16, fontWeight: '600', color: colors.primary },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
    headerSpacer: { width: 60 },
    content: { paddingBottom: 100 },
    section: { marginBottom: 32 },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 16,
      marginHorizontal: 20,
      color: colors.text,
    },
    presetThemes: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 12,
    },
    presetTheme: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    presetThemeActive: {
      borderColor: colors.primary,
    },
    presetThemeText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginTop: 8,
    },
    categoryFilter: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 8,
      marginBottom: 20,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    categoryButtonTextActive: {
      color: colors.text,
    },
    themeGrid: {
      paddingHorizontal: 20,
      gap: 12,
    },
    themeCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeCardActive: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    themeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    themeName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    themeDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    themeActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    actionButtonPrimary: {
      backgroundColor: colors.primary,
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    actionButtonTextPrimary: {
      color: colors.text,
    },
    createButton: {
      marginHorizontal: 20,
      padding: 16,
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: 'center',
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalButtonPrimary: {
      backgroundColor: colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: colors.surface,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    analyticsCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 20,
    },
    analyticsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    analyticsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    analyticsLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    analyticsValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
  });

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Theme Showcase</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Analytics */}
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Theme Analytics</Text>
            <View style={styles.analyticsRow}>
              <Text style={styles.analyticsLabel}>Total Switches:</Text>
              <Text style={styles.analyticsValue}>{analytics.totalThemeSwitches}</Text>
            </View>
            <View style={styles.analyticsRow}>
              <Text style={styles.analyticsLabel}>Most Used:</Text>
              <Text style={styles.analyticsValue}>{analytics.mostUsedTheme}</Text>
            </View>
            <View style={styles.analyticsRow}>
              <Text style={styles.analyticsLabel}>Custom Themes:</Text>
              <Text style={styles.analyticsValue}>{customThemes.length}</Text>
            </View>
          </View>

          {/* Preset Themes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preset Themes</Text>
            <View style={styles.presetThemes}>
              <TouchableOpacity
                style={[
                  styles.presetTheme,
                  { backgroundColor: LIGHT_THEME.background },
                  currentTheme === 'light' && styles.presetThemeActive,
                ]}
                onPress={() => handleThemeSwitch('light')}
              >
                <View style={{ width: 40, height: 40, backgroundColor: LIGHT_THEME.primary, borderRadius: 20 }} />
                <Text style={[styles.presetThemeText, { color: LIGHT_THEME.text }]}>Light</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetTheme,
                  { backgroundColor: DARK_THEME.background },
                  currentTheme === 'dark' && styles.presetThemeActive,
                ]}
                onPress={() => handleThemeSwitch('dark')}
              >
                <View style={{ width: 40, height: 40, backgroundColor: DARK_THEME.primary, borderRadius: 20 }} />
                <Text style={[styles.presetThemeText, { color: DARK_THEME.text }]}>Dark</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Themes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryFilter}>
                {THEME_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.key && styles.categoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(category.key)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory === category.key && styles.categoryButtonTextActive,
                    ]}>
                      {category.icon} {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Custom Themes Grid */}
          <View style={styles.themeGrid}>
            {filteredThemes.map((theme) => (
              <Animated.View
                key={theme.id}
                entering={FadeIn.delay(100)}
                exiting={FadeOut}
                style={[
                  styles.themeCard,
                  activeCustomThemeId === theme.id && styles.themeCardActive,
                ]}
              >
                <View style={styles.themeHeader}>
                  <Text style={styles.themeName}>{theme.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <View style={{ width: 12, height: 12, backgroundColor: theme.colors.primary, borderRadius: 6 }} />
                    <View style={{ width: 12, height: 12, backgroundColor: theme.colors.accent, borderRadius: 6 }} />
                    <View style={{ width: 12, height: 12, backgroundColor: theme.colors.secondary, borderRadius: 6 }} />
                  </View>
                </View>
                {theme.description && (
                  <Text style={styles.themeDescription}>{theme.description}</Text>
                )}
                <View style={styles.themeActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      activeCustomThemeId === theme.id && styles.actionButtonPrimary,
                    ]}
                    onPress={() => handleThemeSwitch('custom', theme.id)}
                  >
                    <Text style={[
                      styles.actionButtonText,
                      activeCustomThemeId === theme.id && styles.actionButtonTextPrimary,
                    ]}>
                      {activeCustomThemeId === theme.id ? 'Active' : 'Use'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleExportTheme(theme.id)}
                  >
                    <Text style={styles.actionButtonText}>Export</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteTheme(theme.id)}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Create Theme Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>+ Create New Theme</Text>
          </TouchableOpacity>

          {/* Backup/Restore */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Backup & Restore</Text>
            <View style={styles.themeGrid}>
              <TouchableOpacity style={styles.themeCard} onPress={handleBackup}>
                <Text style={styles.themeName}>Create Backup</Text>
                <Text style={styles.themeDescription}>Save current themes to backup</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.themeCard} onPress={handleRestore}>
                <Text style={styles.themeName}>Restore Backup</Text>
                <Text style={styles.themeDescription}>Restore themes from backup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Create Theme Modal */}
        <Modal
          visible={showCreateModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View
              entering={SlideInRight}
              exiting={SlideOutLeft}
              style={styles.modalContent}
            >
              <Text style={styles.modalTitle}>Create New Theme</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Theme name"
                placeholderTextColor={colors.textSecondary}
                value={newThemeName}
                onChangeText={setNewThemeName}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Description (optional)"
                placeholderTextColor={colors.textSecondary}
                value={newThemeDescription}
                onChangeText={setNewThemeDescription}
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonPrimary}
                  onPress={handleCreateTheme}
                >
                  <Text style={styles.modalButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>

      {/* Bottom Navigation */}
      <NavBar />
    </LinearGradient>
  );
}
