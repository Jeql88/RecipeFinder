// components/playlist/SongList.tsx
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Song } from "../../app/utils/types";
import PlaylistItem from "./PlaylistItem";

type Props = {
  songs: Song[];
  onRemove: (id: string) => void;
};

function SongListComponent({ songs, onRemove }: Props) {
  if (!songs.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Your playlist is empty</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {songs.map((s) => (
        <PlaylistItem key={s.id} song={s} onRemove={onRemove} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { width: "100%", marginTop: 8 },
  empty: { width: "100%", padding: 20, alignItems: "center" },
  emptyText: { color: "#999" },
});

export default React.memo(SongListComponent);
