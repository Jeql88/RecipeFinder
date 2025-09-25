import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
import { useTheme } from "./hooks/useTheme";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { colors } = useTheme();

  const handlePress = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    AccessibilityInfo.announceForAccessibility(`${action} pressed`);
    router.push("/playlist");
  };

  const styles = StyleSheet.create({
    signupContainer: { flexDirection: "row", marginTop: 20 },
    signupText: { color: colors.textSecondary },
    signupLink: { color: colors.primary, fontWeight: "600" },

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
      color: colors.text,
      fontWeight: "600",
      marginBottom: 40,
    },
    input: {
      width: "100%",
      backgroundColor: colors.surface,
      color: colors.text,
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.textSecondary,
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
      color: colors.text,
      fontWeight: "600",
      fontSize: 16,
    },
    smallText: {
      color: colors.textSecondary,
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

  return (
    <LinearGradient
      colors={[colors.background, colors.surface, colors.background]}
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
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel="Enter Username"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
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
  style={{ width: "100%" }}
  onPress={() => handlePress("Sign In")}
>
  <LinearGradient
      colors={[colors.primary, colors.secondary]} 
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
            colors={[colors.surface, colors.background]} 
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.socialCircle}
          >
            <FontAwesome name="facebook" size={26} color={colors.text} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePress("Google")}
          accessibilityLabel="Sign in with Google"
        >
          <LinearGradient
            colors={[colors.surface, colors.background]} 
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.socialCircle}
          >
            <FontAwesome name="google" size={26} color={colors.text} />
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
