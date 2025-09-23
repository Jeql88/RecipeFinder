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

export default function ProfileScreen() {
  const router = useRouter();
  const [name] = useState("John Doe");
  const [email] = useState("johndoe@email.com");

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/edit-profile");
  };

  return (
    <LinearGradient
      colors={["#0d0d0d", "#1a1a1a", "#000"]}
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
              colors={["#1DB954", "#1ed760"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Nav */}
      <NavBar />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginBottom: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  content: {
    flex: 1,
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 30,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
