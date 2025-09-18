// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { ActivityIndicator, View } from "react-native";
import NetInfo from "@react-native-community/netinfo";

export default function RootLayout() {
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    const restoreState = async () => {
      try {
        const netInfo = await NetInfo.fetch();
        const savedScreen = await AsyncStorage.getItem("LAST_SCREEN");

        if (!netInfo.isConnected) {
          if (savedScreen) {
            // Offline + cache → restore last visited
            router.replace(savedScreen);
          } else {
            // Offline + no cache → default to profile
            router.replace("/profile");
          }
        }
        // Online → do nothing (initialRouteName will show)
      } catch (e) {
        console.warn("Failed to load navigation state", e);
        router.replace("/profile");
      } finally {
        setLoading(false);
      }
    };

    restoreState();
  }, [router]);

  // save current route (segments -> path)
  React.useEffect(() => {
    const path = "/" + segments.join("/");
    if (path && path !== "/") {
      AsyncStorage.setItem("LAST_SCREEN", path);
    }
  }, [segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerTransparent: true, // keeps header space but shows your gradient
        headerTitle: "",
        headerShown: false,
        headerTintColor: "#fff",
      }}
    >
      {/* Auth (no header) */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />

      {/* Tabs / App */}
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="playlists" options={{ headerShown: false }} />
      <Stack.Screen name="library" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />

      {/* Screens that should show back arrow (header transparent reserved space) */}
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="settings" />

      {/* Playlist Builder route (new) */}
      <Stack.Screen name="playlist-builder" options={{ headerShown: false }} />
    </Stack>
  );
}
