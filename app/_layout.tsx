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
            router.replace(savedScreen as any);
          } else {
            // Offline + no cache → default to profile
            router.replace("/profile");
          }
        }
        // Online → do nothing, Stack will start at its initialRouteName
      } catch (e) {
        console.warn("Failed to load navigation state", e);
        router.replace("/profile");
      } finally {
        setLoading(false);
      }
    };

    restoreState();
  }, []);

  // Whenever route changes, save it
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
      initialRouteName="login" // default entrypoint
      screenOptions={{
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {/* Auth screens - no header */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />

      {/* Tabs */}
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="playlist" options={{ headerShown: false }} />
      <Stack.Screen name="library" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />

      {/* Extra screens (header shown unless overridden) */}
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
