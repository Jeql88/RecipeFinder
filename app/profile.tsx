import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import NavBar from "../components/BottomNav";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { useTheme } from "./hooks/useTheme";

export default function ProfileScreen() {
  const router = useRouter();
  const [name] = useState("John Doe");
  const [email] = useState("johndoe@email.com");
  const { colors } = useTheme();

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/edit-profile");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      alignItems: "center",
      paddingTop: 60,
      paddingBottom: 30,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 20,
    },
    name: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    email: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 30,
    },
    editButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
    },
    editButtonText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 16,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 15,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
      paddingHorizontal: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 10,
    },
    menuIcon: {
      fontSize: 20,
      marginRight: 15,
      width: 24,
      textAlign: "center",
    },
    menuText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    menuArrow: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });

  return (
    <LinearGradient
      colors={[colors.background, colors.surface, colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1, width: "100%" }}>
        {/* Header without Back */}


        {/* Content */}
        <View style={styles.content}>
          {/* Profile Picture */}
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // placeholder avatar
            }}
            style={styles.avatar}
          />

          {/* User Info */}
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>

          {/* Edit Button */}
          <TouchableOpacity onPress={handleEdit} style={{ width: "80%" }}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Nav */}
      <NavBar />
    </LinearGradient>
  );
}

