// components/playlist/SongList.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Song } from "../../app/utils/types";
import PlaylistItem from "./PlaylistItem";

type Props = {
  songs: Song[];
  onRemove: (id: string) => void;
};

export default function SongList({ songs, onRemove }: Props) {
  return (
    <View style={styles.container}>
      {songs.map((song) => (
        <PlaylistItem
          key={song.id} // ✅ stable unique key for Reanimated
          song={song}
          onRemove={onRemove}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 8,
  },
});
