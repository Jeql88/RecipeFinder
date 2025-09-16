// components/BottomNav.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

type NavItem = {
  label: string;
  icon: (focused: boolean) => React.ReactNode;
  route: string;
};

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const NAV_ITEMS: NavItem[] = [
    {
      label: "Home",
      icon: (focused) => (
        <FontAwesome5
          name="home"
          size={22}
          color={focused ? "#1DB954" : "#fff"}
          solid={focused}
        />
      ),
      route: "/playlist",
    },
    {
      label: "Search",
      icon: (focused) => (
        <Feather
          name="search"
          size={22}
          color={focused ? "#1DB954" : "#fff"}
        />
      ),
      route: "/playlists",
    },
    {
      label: "Your Library",
      icon: (focused) => (
        <FontAwesome5
          name="book"
          size={20}
          color={focused ? "#1DB954" : "#fff"}
        />
      ),
      route: "/library",
    },
    {
      label: "Create",
      icon: (focused) => (
        <Feather
          name="plus-circle"
          size={22}
          color={focused ? "#1DB954" : "#fff"}
        />
      ),
      route: "/playlist-builder", // 👈 changed from /create
    },
  ];

  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const focused = pathname === item.route;
        return (
          <TouchableOpacity
            key={item.label}
            style={styles.navItem}
            onPress={() => router.push(item.route)}
            activeOpacity={0.7}
          >
            {item.icon(focused)}
            <Text
              style={[
                styles.label,
                focused && { color: "#1DB954", fontWeight: "600" },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute", // 👈 stick to bottom
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#121212",
    borderTopWidth: 0.5,
    borderTopColor: "#2a2a2a",
    height: 70,
    paddingBottom: Platform.OS === "ios" ? 20 : 10, // safe space for iOS
    zIndex: 100,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    color: "#bbb",
    fontSize: 12,
    marginTop: 4,
  },
});
