import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient"; // ✅ use gradient
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

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);

  const handleRegister = () => {
    Haptics.selectionAsync();
    alert("Account created!");
    router.push("/login");
  };

  return (
    <LinearGradient
      colors={["#0d0d0d", "#1a1a1a", "#000000"]}
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
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#777"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#777"
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
          placeholderTextColor="#777"
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.dobInput, styles.flexInput]}
          placeholder="MM"
          placeholderTextColor="#777"
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.dobInput, styles.flexInput]}
          placeholder="YYYY"
          placeholderTextColor="#777"
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
          colors={["#1DB954", "#1ed760"]}
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
            colors={["#1a1a1a", "#000"]}
            style={styles.socialCircle}
          >
            <FontAwesome name="facebook" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity>
          <LinearGradient
            colors={["#1a1a1a", "#000"]}
            style={styles.socialCircle}
          >
            <FontAwesome name="google" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Already have account */}
      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.loginLink}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginRight: 10,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
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
  sectionLabel: {
    color: "#1DB954",
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 8,
    marginTop: 5,
  },
  dobRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 20,
  },
  dobInput: {
    backgroundColor: "#121212",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#1f1f1f",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  flexInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  genderRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 25,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1DB954",
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "transparent",
    alignItems: "center",
    marginHorizontal: 5,
  },
  genderSelected: {
    backgroundColor: "rgba(29,185,84,0.25)",
  },
  genderText: {
    color: "#1DB954",
    fontWeight: "bold",
  },
  genderTextSelected: {
    color: "#fff",
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
    fontWeight: "bold",
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
  loginRow: {
    flexDirection: "row",
    marginTop: 15,
  },
  loginText: {
    color: "#777",
  },
  loginLink: {
    color: "#1DB954",
    fontWeight: "bold",
  },
});
