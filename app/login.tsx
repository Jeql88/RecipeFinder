import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient"; // ✅ gradient
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  AccessibilityInfo,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handlePress = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    AccessibilityInfo.announceForAccessibility(`${action} pressed`);
    router.push("/playlist");
  };

  return (
    <LinearGradient
      colors={["#0d0d0d", "#1a1a1a", "#000000"]} // ✅ stronger gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Spotify Logo */}
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        accessibilityLabel="Spotify Logo"
      />
      <Text style={styles.title}>Spotify</Text>

      {/* Username / Password */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#777"
        accessibilityLabel="Enter Username"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#777"
        secureTextEntry
        accessibilityLabel="Enter Password"
      />

      <TouchableOpacity
        style={styles.forgot}
        onPress={() => handlePress("Forgot Password")}
      >
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

{/* Sign In Button */}
<TouchableOpacity 
  style={{ width: "100%" }}   // ✅ makes wrapper match inputs
  onPress={() => handlePress("Sign In")}
>
  <LinearGradient
      colors={["#1DB954", "#15883e"]} 
    start={{ x: 1, y: 0 }}
    end={{ x: 0, y: 0 }}
    style={styles.button}
  >
    <Text style={styles.buttonText}>Sign In</Text>
  </LinearGradient>
</TouchableOpacity>

      {/* Social login */}
      <Text style={styles.smallText}>Or Connect With</Text>
      <View style={styles.socialRow}>
        <TouchableOpacity
          onPress={() => handlePress("Facebook")}
          accessibilityLabel="Sign in with Facebook"
        >
          <LinearGradient
            colors={["#1a1a1a", "#000"]} 
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.socialCircle}
          >
            <FontAwesome name="facebook" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePress("Google")}
          accessibilityLabel="Sign in with Google"
        >
          <LinearGradient
            colors={["#1a1a1a", "#000"]} 
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.socialCircle}
          >
            <FontAwesome name="google" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Sign up link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  signupContainer: { flexDirection: "row", marginTop: 20 },
  signupText: { color: "#aaa" },
  signupLink: { color: "#1DB954", fontWeight: "600" },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    resizeMode: "contain",
  },
  title: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    backgroundColor: "#121212",
    color: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  forgot: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "#777",
    fontSize: 12,
  },
  button: {
    width: "100%", 
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 25,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  smallText: {
    color: "#aaa",
    marginBottom: 10,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginBottom: 25,
  },
  socialCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
