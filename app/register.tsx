import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "./hooks/useTheme";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const { colors } = useTheme();

  const handleRegister = () => {
    Haptics.selectionAsync();
    alert("Account created!");
    router.push("/login");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 30,
      paddingTop: 60,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 40,
    },
    logo: {
      width: 50,
      height: 50,
      marginRight: 15,
      resizeMode: "contain",
    },
    headerText: {
      fontSize: 24,
      color: colors.text,
      fontWeight: "600",
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
    },
    sectionLabel: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 10,
      marginTop: 10,
    },
    dobRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    dobInput: {
      flex: 1,
      backgroundColor: colors.surface,
      color: colors.text,
      borderRadius: 10,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
      textAlign: "center",
    },
    flexInput: {
      flex: 1,
    },
    genderRow: {
      flexDirection: "row",
      gap: 15,
      marginBottom: 30,
    },
    genderButton: {
      flex: 1,
      padding: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
    },
    genderSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    genderText: {
      color: colors.text,
      fontWeight: "500",
    },
    genderTextSelected: {
      color: colors.text,
      fontWeight: "600",
    },
    button: {
      width: "100%",
      padding: 15,
      borderRadius: 30,
      alignItems: "center",
      marginBottom: 20,
    },
    buttonText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 16,
    },
    loginLink: {
      textAlign: "center",
      color: colors.textSecondary,
    },
    loginLinkText: {
      color: colors.primary,
      fontWeight: "600",
    },
    smallText: {
      color: colors.textSecondary,
      marginBottom: 10,
      textAlign: "center",
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
    loginRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
    },
    loginText: {
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
      {/* Logo + Spotify text */}
      <View style={styles.headerRow}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>Spotify</Text>
      </View>

      {/* Email / Password */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Date of Birth */}
      <Text style={styles.sectionLabel}>Date of Birth</Text>
      <View style={styles.dobRow}>
        <TextInput
          style={[styles.dobInput, styles.flexInput]}
          placeholder="DD"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.dobInput, styles.flexInput]}
          placeholder="MM"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.dobInput, styles.flexInput]}
          placeholder="YYYY"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      {/* Gender */}
      <Text style={styles.sectionLabel}>Gender</Text>
      <View style={styles.genderRow}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === "male" && styles.genderSelected,
          ]}
          onPress={() => setGender("male")}
        >
          <Text
            style={[
              styles.genderText,
              gender === "male" && styles.genderTextSelected,
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === "female" && styles.genderSelected,
          ]}
          onPress={() => setGender("female")}
        >
          <Text
            style={[
              styles.genderText,
              gender === "female" && styles.genderTextSelected,
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity onPress={handleRegister} style={{ width: "100%" }}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Social sign up */}
      <Text style={styles.smallText}>Or Sign Up With</Text>
      <View style={styles.socialRow}>
        <TouchableOpacity>
          <LinearGradient
            colors={[colors.surface, colors.background]}
            style={styles.socialCircle}
          >
            <FontAwesome name="facebook" size={26} color={colors.text} />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity>
          <LinearGradient
            colors={[colors.surface, colors.background]}
            style={styles.socialCircle}
          >
            <FontAwesome name="google" size={26} color={colors.text} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Already have account */}
      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.loginLinkText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

