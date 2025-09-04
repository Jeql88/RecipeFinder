import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CustomDrawer({ isOpen, onClose }: DrawerProps) {
  const router = useRouter();

  // shared value starts hidden
  const translateX = useSharedValue(-width);

  // run animation whenever isOpen changes
  React.useEffect(() => {
    translateX.value = isOpen
      ? withSpring(0, { damping: 15, stiffness: 120 })
      : withSpring(-width, { damping: 15, stiffness: 120 });
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <Animated.View style={[styles.drawer, animatedStyle]}>
      {/* Drawer Header */}
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={60} color="#fff" />
        <Text style={styles.username}>Hello, User!</Text>
      </View>

      {/* Drawer Links */}
      <TouchableOpacity style={styles.link} onPress={() => navigate("/profile")}>
        <Ionicons name="person-outline" size={24} color="#fff" />
        <Text style={styles.linkText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => navigate("/settings")}>
        <Ionicons name="settings-outline" size={24} color="#fff" />
        <Text style={styles.linkText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => navigate("/playlists")}>
        <Ionicons name="musical-notes-outline" size={24} color="#fff" />
        <Text style={styles.linkText}>Playlists</Text>
      </TouchableOpacity>

      {/* Close Button */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: "#121214",
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 100,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  username: {
    color: "#fff",
    fontSize: 18,
    marginTop: 8,
    fontWeight: "600",
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  linkText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
  },
});
