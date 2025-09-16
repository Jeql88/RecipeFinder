import "react-native-get-random-values";
import React, { useState } from "react"; // ✅ must be imported
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { v4 as uuidv4 } from "uuid";
import { Song } from "../../app/utils/types"; // ✅ make sure this file exists

type Props = {
  onAdd: (song: Song) => void;
};

export default function SongInput({ onAdd }: Props) {
  const [text, setText] = useState(""); // ✅ useState works fine here

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newSong: Song = {
      id: uuidv4(),
      title: trimmed,
      addedAt: Date.now(),
    };

    Haptics.selectionAsync();
    onAdd(newSong);
    setText(""); // clear input
  };

  return (
    <View style={styles.row}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Add a song title"
        placeholderTextColor="#9a9a9a"
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={handleAdd}
      />
      <TouchableOpacity
        onPress={handleAdd}
        style={styles.button}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#121212",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#272727",
  },
  button: {
    marginLeft: 10,
    backgroundColor: "#1DB954",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
