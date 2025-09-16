// components/playlist/PlaylistItem.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { FontAwesome } from "@expo/vector-icons";
import { Song } from "../../app/utils/types";

type Props = {
  song: Song;
  onRemove: (id: string) => void;
};

export default function PlaylistItem({ song, onRemove }: Props) {
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={Layout}
      style={styles.container}
    >
      <Text numberOfLines={1} style={styles.title}>
        {song.title}
      </Text>
      <TouchableOpacity onPress={() => onRemove(song.id)} style={styles.removeBtn}>
        <FontAwesome name="trash" size={16} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1f1f1f",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2b2b2b",
  },
  title: { color: "#fff", flex: 1, fontSize: 16 },
  removeBtn: { padding: 6, marginLeft: 8 },
});
