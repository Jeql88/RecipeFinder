// app/playlist-name.tsx
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, SafeAreaView, Keyboard } from "react-native";

type Props = {
  navigation?: any; // keep broad to avoid strict typing issues
};

export default function PlaylistNameScreen({ navigation }: Props) {
  const [name, setName] = useState("");

  const handleCreate = () => {
    const trimmed = name.trim() || "default";
    Keyboard.dismiss();
    // navigate to playlist builder with the chosen name
    navigation?.navigate?.("PlaylistBuilder", { playlistName: trimmed });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create / Select Playlist</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Playlist name (e.g., Roadtrip 2025)"
        placeholderTextColor="#999"
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={handleCreate}
      />
      <TouchableOpacity onPress={handleCreate} style={styles.button} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Create / Open</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 14, color: "#fff" },
  input: {
    backgroundColor: "#121212",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#272727",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#1DB954",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
