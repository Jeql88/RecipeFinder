import React, { useEffect, useReducer, useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playlistReducer, initialState } from "../app/utils/playlistReducer";
import { loadPlaylistState, savePlaylistState, clearPlaylistState } from "../app/utils/storage";
import SongInput from "../components/playlist/SongInput";
import SongList from "../components/playlist/SongList";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Song } from "../app/utils/types";

const PLAYLISTS_KEY = "@spotify_playlists_list";

export default function PlaylistBuilderScreen() {
  const [state, dispatch] = useReducer(playlistReducer, initialState);
  const [playlistName, setPlaylistName] = useState("");
  const [savedPlaylists, setSavedPlaylists] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored playlists
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const json = await AsyncStorage.getItem(PLAYLISTS_KEY);
        if (isMounted && json) setSavedPlaylists(JSON.parse(json));
      } catch (error) {
        console.error("Failed to load playlists:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // Load current playlist state
  useEffect(() => {
    if (!playlistName.trim()) return;
    let isMounted = true;

    (async () => {
      try {
        const saved = await loadPlaylistState(playlistName);
        if (isMounted) {
          dispatch({ type: "SET_FULL_STATE", payload: saved ?? initialState });
        }
      } catch (error) {
        console.error("Failed to load playlist state:", error);
      }
    })();

    return () => { isMounted = false; };
  }, [playlistName]);

  // Persist playlist state
  useEffect(() => {
    if (!playlistName.trim() || isLoading) return;
    let isMounted = true;

    (async () => {
      try {
        await savePlaylistState(playlistName, state);
      } catch (error) {
        console.error("Failed to persist playlist:", error);
      }
    })();

    return () => { isMounted = false; };
  }, [state, playlistName, isLoading]);

  const handleAdd = useCallback((song: Song) => {
    dispatch({ type: "ADD_SONG", payload: song });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleRemove = useCallback((id: string) => {
    Haptics.selectionAsync();
    dispatch({ type: "REMOVE_SONG", payload: { id } });
  }, []);

  const handleClear = () => {
    Alert.alert(
      "Clear Playlist",
      "Are you sure you want to remove all songs?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => {
            dispatch({ type: "CLEAR" });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }
      ]
    );
  };

  const handleUndo = () => {
    dispatch({ type: "UNDO" });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRedo = () => {
    dispatch({ type: "REDO" });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSavePlaylist = async () => {
    if (!playlistName.trim()) {
      Alert.alert("Error", "Please enter a playlist name");
      return;
    }
    if (state.present.length === 0) {
      Alert.alert("Error", "Cannot save an empty playlist");
      return;
    }

    try {
      await savePlaylistState(playlistName, state);

      const updated = savedPlaylists.includes(playlistName)
        ? savedPlaylists
        : [...savedPlaylists, playlistName];
      setSavedPlaylists(updated);
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));

      Alert.alert("Success", `Playlist "${playlistName}" saved!`);
      dispatch({ type: "SET_FULL_STATE", payload: initialState });
      setPlaylistName("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      Alert.alert("Error", "Failed to save playlist");
      console.error("Save playlist error:", error);
    }
  };

  const handleClearCache = async () => {
    if (!playlistName.trim()) {
      Alert.alert("Error", "Please enter a playlist name first");
      return;
    }

    let isMounted = true;

    Alert.alert(
      "Clear Cache",
      `Are you sure you want to clear cache for "${playlistName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: async () => {
            try {
              await clearPlaylistState(playlistName);
              if (isMounted) dispatch({ type: "SET_FULL_STATE", payload: initialState });
              if (isMounted) Alert.alert("Success", `Cache cleared for "${playlistName}"`);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch (error) {
              if (isMounted) Alert.alert("Error", "Failed to clear cache");
              console.error("Clear cache error:", error);
            }
          }
        }
      ]
    );

    return () => { isMounted = false; };
  };

  const handleLoadPlaylist = async (name: string) => {
    setPlaylistName(name);
  };

  const handleDeletePlaylist = async (name: string) => {
    let isMounted = true;

    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await clearPlaylistState(name);
              const updated = savedPlaylists.filter(p => p !== name);
              if (isMounted) setSavedPlaylists(updated);
              await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));

              if (isMounted && playlistName === name) {
                setPlaylistName("");
                dispatch({ type: "SET_FULL_STATE", payload: initialState });
              }

              if (isMounted) Alert.alert("Success", `Playlist "${name}" deleted`);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch (error) {
              if (isMounted) Alert.alert("Error", "Failed to delete playlist");
              console.error("Delete playlist error:", error);
            }
          }
        }
      ]
    );

    return () => { isMounted = false; };
  };

  if (isLoading) {
    return (
      <LinearGradient colors={["#0d0d0d", "#121212"]} style={styles.bg}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading playlists...</Text>
          </View>
          </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0d0d0d", "#121212"]} style={styles.bg}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Create Playlist</Text>

        <TextInput
          value={playlistName}
          onChangeText={setPlaylistName}
          placeholder="Enter playlist name"
          placeholderTextColor="#9a9a9a"
          style={styles.playlistInput}
          returnKeyType="done"
        />

        <View style={styles.controls}>
          <SongInput onAdd={handleAdd} />

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleUndo}
              disabled={state.past.length === 0}
              style={[styles.actionBtn, state.past.length === 0 && styles.disabled]}
            >
              <Text style={styles.actionText}>Undo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRedo}
              disabled={state.future.length === 0}
              style={[styles.actionBtn, state.future.length === 0 && styles.disabled]}
            >
              <Text style={styles.actionText}>Redo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleClear} style={[styles.actionBtn, styles.warnBtn]}>
              <Text style={styles.actionText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleClearCache} style={[styles.actionBtn, styles.greyBtn]}>
              <Text style={styles.actionText}>Cache</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={handleSavePlaylist} 
            style={[styles.actionBtn, styles.saveBtn]}
            disabled={!playlistName.trim() || state.present.length === 0}
          >
            <Text style={styles.actionText}>Save Playlist</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <SongList songs={state.present} onRemove={handleRemove} />
          
          {playlistName.trim() && state.present.length > 0 && (
            <View style={styles.playlistInfo}>
              <Text style={styles.playlistInfoText}>
                "{playlistName}" • {state.present.length} songs
              </Text>
            </View>
          )}
        </ScrollView>

        {savedPlaylists.length > 0 && (
          <View style={styles.savedPlaylistsContainer}>
            <Text style={styles.savedPlaylistsHeader}>Saved Playlists:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.savedPlaylistsList}
            >
              {savedPlaylists.map((playlist) => (
                <View key={playlist} style={styles.savedPlaylistItem}>
                  <TouchableOpacity
                    onPress={() => handleLoadPlaylist(playlist)}
                    style={[
                      styles.savedPlaylistButton,
                      playlistName === playlist && styles.activePlaylistButton
                    ]}
                  >
                    <Text style={[
                      styles.savedPlaylistText,
                      playlistName === playlist && styles.activePlaylistText
                    ]}>
                      {playlist}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeletePlaylist(playlist)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: { color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  playlistInput: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 25,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    marginBottom: 16,
  },
  controls: { width: "100%", marginBottom: 16 },
  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, gap: 8 },
  actionBtn: {
    backgroundColor: "#1f1f1f",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  warnBtn: { backgroundColor: "#8b1d1d", borderColor: "#a02525" },
  greyBtn: { backgroundColor: "#2b2b2b", borderColor: "#3a3a3a" },
  disabled: { opacity: 0.3 },
  saveBtn: { backgroundColor: "#1DB954", borderColor: "#22c55e", marginTop: 8 },
  scrollArea: { paddingVertical: 8, paddingBottom: 120 },
  playlistInfo: { marginTop: 16, padding: 12, backgroundColor: "#1a1a1a", borderRadius: 8, borderWidth: 1, borderColor: "#2a2a2a" },
  playlistInfoText: { color: "#1DB954", fontSize: 14, textAlign: "center", fontWeight: "500" },
  savedPlaylistsContainer: { marginTop: 16, paddingBottom: 8 },
  savedPlaylistsHeader: { color: "#fff", fontWeight: "600", marginBottom: 8, fontSize: 16 },
  savedPlaylistsList: { gap: 8, paddingRight: 20 },
  savedPlaylistItem: { flexDirection: "row", alignItems: "center" },
  savedPlaylistButton: { backgroundColor: "#2a2a2a", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: "#3a3a3a" },
  activePlaylistButton: { backgroundColor: "#1DB954", borderColor: "#22c55e" },
  savedPlaylistText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  activePlaylistText: { color: "#000" },
  deleteButton: { marginLeft: 4, width: 20, height: 20, backgroundColor: "#8b1d1d", borderRadius: 10, justifyContent: "center", alignItems: "center" },
  deleteButtonText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fff", fontSize: 16 },
});
