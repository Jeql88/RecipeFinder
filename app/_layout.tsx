// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { ActivityIndicator, View } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Provider } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { store } from "./store/store";
import { ThemeProvider } from "../components/ThemeProvider";
import { useTheme } from "./hooks/useTheme";

// Theme-aware loading component
const ThemedLoadingScreen = () => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <StatusBar style={isDark ? "light" : "dark"} />
    </View>
  );
};

// Main layout content (must be inside ThemeProvider)
const RootLayoutContent = () => {
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const segments = useSegments();
  const { colors, isDark } = useTheme();

  React.useEffect(() => {
    const restoreState = async () => {
      try {
        const netInfo = await NetInfo.fetch();
        const savedScreen = await AsyncStorage.getItem("LAST_SCREEN");

        if (!netInfo.isConnected) {
          if (savedScreen) {
            router.replace(savedScreen);
          } else {
            router.replace("/profile");
          }
        }
      } catch (e) {
        console.warn("Failed to load navigation state", e);
        router.replace("/profile");
      } finally {
        setLoading(false);
      }
    };

    restoreState();
  }, [router]);

  // Save route to AsyncStorage
  React.useEffect(() => {
    const path = "/" + segments.join("/");
    if (path && path !== "/") {
      AsyncStorage.setItem("LAST_SCREEN", path);
    }
  }, [segments]);

  if (loading) {
    return <ThemedLoadingScreen />;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        initialRouteName="login"
        screenOptions={{
          headerTransparent: true,
          headerTitle: "",
          headerShown: false,
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Auth (no header) */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />

        {/* Tabs */}
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="playlists" options={{ headerShown: false }} />
        <Stack.Screen name="library" options={{ headerShown: false }} />
        <Stack.Screen name="create" options={{ headerShown: false }} />

        {/* Other screens */}
        <Stack.Screen
          name="profile"
          options={{
            headerTintColor: colors.primary,
            headerStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            headerTintColor: colors.primary,
            headerStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerTintColor: colors.primary,
            headerStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="theme-showcase"
          options={{
            headerTintColor: colors.primary,
            headerStyle: { backgroundColor: "transparent" },
          }}
        />

        {/* Playlist Builder */}
        <Stack.Screen name="playlist-builder" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

// Wrap everything in Redux + ThemeProvider
export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </Provider>
  );
}
