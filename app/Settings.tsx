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
import {
  toggleDarkMode,
  toggleAnimations,
  setDarkMode,
} from "../store/settingsSlice";
import { RootState } from "../store/store";

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  // pull global state from Redux
  const darkMode = useSelector((state: RootState) => state.settings.darkMode);
  const animationsEnabled = useSelector(
    (state: RootState) => state.settings.animationsEnabled
  );

  // derive theme colors based on darkMode
  const colors = {
    background: darkMode ? "#121212" : "#FFFFFF",
    surface: darkMode ? "#181818" : "#F8F9FA",
    card: darkMode ? "#282828" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : "#000000",
    textSecondary: darkMode ? "#B3B3B3" : "#6C757D",
    border: darkMode ? "#404040" : "#E9ECEF",
    primary: "#1DB954",
    secondary: "#1ed760",
    accent: "#FF6B6B",
  };

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
  const handleThemeSwitch = (theme: "light" | "dark") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(setDarkMode(theme === "dark"));
  };

  // toggle animations
  const handleToggleAnimations = () => {
    dispatch(toggleAnimations());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCreateCustomTheme = () => {
    Alert.alert("Custom Themes", "Custom theme creation will be available soon!");
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
              subtitle={`Current: ${darkMode ? "Dark" : "Light"}`}
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={() => handleThemeSwitch(darkMode ? "light" : "dark")}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              }
            />

            <SettingsItem
              icon="✨"
              title="Animations"
              subtitle="Theme transition animations"
              rightElement={
                <Switch
                  value={animationsEnabled}
                  onValueChange={handleToggleAnimations}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              }
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
