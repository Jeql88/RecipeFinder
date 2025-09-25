// app/screens/SettingsScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import NavBar from "../components/BottomNav";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../app/store/store";
import { 
  setTheme, 
  setCustomTheme, 
  setAnimationEnabled, 
  setAccessibilityOption,
  createThemeBackup,
  restoreFromBackup,
} from "../app/store/slices/themeSlice";
import { useTheme } from "./hooks/useTheme";

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, currentTheme, customThemes, activeCustomThemeId, animationEnabled, accessibility, analytics } = useTheme();

  const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    backButton: { paddingVertical: 8, paddingHorizontal: 4 },
    backButtonText: { fontSize: 16, fontWeight: "600", color: colors.primary },
    headerTitle: { fontSize: 24, fontWeight: "700", color: colors.text },
    headerSpacer: { width: 60 },
    content: { paddingBottom: 100 },
    section: { marginBottom: 32 },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 16,
      marginHorizontal: 20,
      color: colors.text,
    },
    settingsItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    settingsItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    settingsIcon: {
      fontSize: 24,
      marginRight: 16,
      width: 32,
      textAlign: "center",
      color: colors.primary,
    },
    settingsTextContainer: { flex: 1 },
    settingsTitle: { fontSize: 16, fontWeight: "500", marginBottom: 2, color: colors.text },
    settingsSubtitle: { fontSize: 14, color: colors.textSecondary },
    settingsRight: { marginLeft: 16 },
  });

  // reusable settings item
  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <Text style={styles.settingsIcon}>{icon}</Text>
        <View style={styles.settingsTextContainer}>
          <Text style={styles.settingsTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement && <View style={styles.settingsRight}>{rightElement}</View>}
    </TouchableOpacity>
  );

  // handle theme switch
  const handleThemeSwitch = (theme: "light" | "dark" | "custom", customThemeId?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (theme === "custom" && customThemeId) {
      dispatch(setCustomTheme(customThemeId));
    } else {
      dispatch(setTheme(theme));
    }
  };

  // toggle animations
  const handleToggleAnimations = () => {
    dispatch(setAnimationEnabled(!animationEnabled));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // handle accessibility options
  const handleAccessibilityToggle = (option: keyof typeof accessibility) => {
    dispatch(setAccessibilityOption({ option, value: !accessibility[option] }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCreateCustomTheme = () => {
    router.push("/theme-showcase");
  };

  const handleBackup = async () => {
    try {
      await dispatch(createThemeBackup());
      Alert.alert("Success", "Theme backup created successfully");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to create backup");
    }
  };

  const handleRestore = () => {
    Alert.alert(
      "Restore Backup",
      "This will restore your themes from the last backup. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: async () => {
            try {
              await dispatch(restoreFromBackup());
              Alert.alert("Success", "Themes restored from backup");
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert("Error", "Failed to restore from backup");
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1, width: "100%" }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Theme Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theme</Text>

            <SettingsItem
              icon="🎨"
              title="Appearance"
              subtitle={`Current: ${currentTheme === 'custom' ? customThemes.find(t => t.id === activeCustomThemeId)?.name || 'Custom' : currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`}
              rightElement={
                <Switch
                  value={currentTheme === 'dark' || currentTheme === 'custom'}
                  onValueChange={() => handleThemeSwitch(currentTheme === 'dark' ? "light" : "dark")}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              }
            />

            <SettingsItem
              icon="🎭"
              title="Theme Showcase"
              subtitle="Create and manage custom themes"
              onPress={handleCreateCustomTheme}
            />

            <SettingsItem
              icon="✨"
              title="Animations"
              subtitle="Theme transition animations"
              rightElement={
                <Switch
                  value={animationEnabled}
                  onValueChange={handleToggleAnimations}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              }
            />

            <SettingsItem
              icon="♿"
              title="High Contrast"
              subtitle="Enhanced contrast for better visibility"
              rightElement={
                <Switch
                  value={accessibility.highContrast}
                  onValueChange={() => handleAccessibilityToggle('highContrast')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              }
            />

            <SettingsItem
              icon="🔍"
              title="Large Text"
              subtitle="Increase text size for better readability"
              rightElement={
                <Switch
                  value={accessibility.largeText}
                  onValueChange={() => handleAccessibilityToggle('largeText')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              }
            />

            <SettingsItem
              icon="🚫"
              title="Reduce Motion"
              subtitle="Disable animations for accessibility"
              rightElement={
                <Switch
                  value={accessibility.reducedMotion}
                  onValueChange={() => handleAccessibilityToggle('reducedMotion')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              }
            />
          </View>

          {/* Backup & Restore Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Backup & Restore</Text>
            
            <SettingsItem
              icon="💾"
              title="Create Backup"
              subtitle="Save current theme settings"
              onPress={handleBackup}
            />
            
            <SettingsItem
              icon="🔄"
              title="Restore Backup"
              subtitle="Restore from last backup"
              onPress={handleRestore}
            />
          </View>

          {/* Analytics Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theme Analytics</Text>
            
            <SettingsItem
              icon="📊"
              title="Total Theme Switches"
              subtitle={`${analytics.totalThemeSwitches} switches`}
            />
            
            <SettingsItem
              icon="⭐"
              title="Most Used Theme"
              subtitle={analytics.mostUsedTheme}
            />
            
            <SettingsItem
              icon="🎨"
              title="Custom Themes"
              subtitle={`${customThemes.length} themes created`}
            />
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <SettingsItem
              icon="👤"
              title="Edit Profile"
              subtitle="Update your profile information"
              onPress={() => router.push("/edit-profile")}
            />
            <SettingsItem
              icon="🔒"
              title="Privacy"
              subtitle="Manage your privacy settings"
            />
            <SettingsItem
              icon="🔔"
              title="Notifications"
              subtitle="Push notification preferences"
            />
          </View>

          {/* App Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>
            <SettingsItem
              icon="📱"
              title="Storage"
              subtitle="Manage app data and cache"
            />
            <SettingsItem
              icon="📊"
              title="Analytics"
              subtitle="Help improve the app"
            />
            <SettingsItem
              icon="ℹ️"
              title="About"
              subtitle="Version 1.0.0"
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Navigation */}
      <NavBar />
    </LinearGradient>
  );
}
