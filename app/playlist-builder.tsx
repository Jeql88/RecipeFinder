import React, { useEffect, useReducer, useCallback, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  Alert,
  FlatList 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { playlistStorage } from "../app/utils/storage";
import NavBar from "../components/BottomNav";

// Types
interface Song {
  id: string;
  title: string;
  artist: string;
  duration?: number;
  addedAt: number;
}

interface PlaylistState {
  present: Song[];
  past: Song[][];
  future: Song[][];
}

type PlaylistAction = 
  | { type: 'ADD_SONG'; payload: Song }
  | { type: 'REMOVE_SONG'; payload: { id: string } }
  | { type: 'CLEAR' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_FULL_STATE'; payload: PlaylistState };

// Initial state
const initialState: PlaylistState = {
  present: [],
  past: [],
  future: []
};

// Reducer
function playlistReducer(state: PlaylistState, action: PlaylistAction): PlaylistState {
  switch (action.type) {
    case 'ADD_SONG':
      return {
        present: [...state.present, action.payload],
        past: [...state.past, state.present],
        future: []
      };
    
    case 'REMOVE_SONG':
      return {
        present: state.present.filter(song => song.id !== action.payload.id),
        past: [...state.past, state.present],
        future: []
      };
    
    case 'CLEAR':
      return {
        present: [],
        past: [...state.past, state.present],
        future: []
      };
    
    case 'UNDO':
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        present: previous,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future]
      };
    
    case 'REDO':
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        present: next,
        past: [...state.past, state.present],
        future: state.future.slice(1)
      };
    
    case 'SET_FULL_STATE':
      return action.payload;
    
    default:
      return state;
  }
}

// SongInput Component
const SongInput: React.FC<{ onAdd: (song: Song) => void }> = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  const handleAdd = () => {
    if (!title.trim() || !artist.trim()) {
      Alert.alert("Error", "Please enter both title and artist");
      return;
    }

    const song: Song = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      artist: artist.trim(),
      addedAt: Date.now()
    };

    onAdd(song);
    setTitle("");
    setArtist("");
  };

  return (
    <View style={styles.songInputContainer}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Song title"
        placeholderTextColor="#9a9a9a"
        style={styles.songInput}
        returnKeyType="next"
      />
      <TextInput
        value={artist}
        onChangeText={setArtist}
        placeholder="Artist"
        placeholderTextColor="#9a9a9a"
        style={styles.songInput}
        returnKeyType="done"
        onSubmitEditing={handleAdd}
      />
      <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

// SongItem Component
const SongItem: React.FC<{ song: Song; onRemove: (id: string) => void }> = ({ song, onRemove }) => {
  return (
    <View style={styles.songItem}>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onRemove(song.id)}
        style={styles.removeButton}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

// SongList Component
const SongList: React.FC<{ songs: Song[]; onRemove: (id: string) => void }> = ({ songs, onRemove }) => {
  if (songs.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No songs added yet</Text>
        <Text style={styles.emptyStateSubtext}>Add some songs to get started!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SongItem song={item} onRemove={onRemove} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.songListContainer}
    />
  );
};

// Main PlaylistBuilder Component
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
        const playlists = await playlistStorage.getAllPlaylistNames();
        if (isMounted) setSavedPlaylists(playlists);
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
        const saved = await playlistStorage.loadPlaylist(playlistName);
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
        await playlistStorage.savePlaylist(playlistName, state);
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
      await playlistStorage.savePlaylist(playlistName, state);
      const updated = savedPlaylists.includes(playlistName) 
        ? savedPlaylists 
        : [...savedPlaylists, playlistName];
      setSavedPlaylists(updated);
      await playlistStorage.savePlaylistNames(updated);
      
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
              await playlistStorage.clearPlaylist(playlistName);
              dispatch({ type: "SET_FULL_STATE", payload: initialState });
              Alert.alert("Success", `Cache cleared for "${playlistName}"`);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch (error) {
              Alert.alert("Error", "Failed to clear cache");
              console.error("Clear cache error:", error);
            }
          }
        }
      ]
    );
  };

  const handleLoadPlaylist = async (name: string) => {
    setPlaylistName(name);
  };

  const handleDeletePlaylist = async (name: string) => {
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
              await playlistStorage.clearPlaylist(name);
              const updated = savedPlaylists.filter(p => p !== name);
              setSavedPlaylists(updated);
              await playlistStorage.savePlaylistNames(updated);
              
              if (playlistName === name) {
                setPlaylistName("");
                dispatch({ type: "SET_FULL_STATE", payload: initialState });
              }
              Alert.alert("Success", `Playlist "${name}" deleted`);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch (error) {
              Alert.alert("Error", "Failed to delete playlist");
              console.error("Delete playlist error:", error);
            }
          }
        }
      ]
    );
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
            
            <TouchableOpacity
              onPress={handleClear}
              style={[styles.actionBtn, styles.warnBtn]}
            >
              <Text style={styles.actionText}>Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleClearCache}
              style={[styles.actionBtn, styles.greyBtn]}
            >
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

        <ScrollView 
          contentContainerStyle={styles.scrollArea} 
          showsVerticalScrollIndicator={false}
        >
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
            {/* Bottom Nav */}
            <NavBar />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: { color: "#fff", fontSize: 28, fontWeight: "600", marginBottom: 16 },
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
  songInputContainer: { marginBottom: 12 },
  songInput: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#1DB954",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
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
  songListContainer: { paddingVertical: 4 },
  songItem: {
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  songInfo: { flex: 1, marginRight: 12 },
  songTitle: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 2 },
  songArtist: { color: "#9a9a9a", fontSize: 14 },
  removeButton: {
    width: 24,
    height: 24,
    backgroundColor: "#8b1d1d",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  emptyStateText: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 8 },
  emptyStateSubtext: { color: "#9a9a9a", fontSize: 14 },
  playlistInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a"
  },
  playlistInfoText: { color: "#1DB954", fontSize: 14, textAlign: "center", fontWeight: "500" },
  savedPlaylistsContainer: { marginTop: 16, paddingBottom: 8 },
  savedPlaylistsHeader: { color: "#fff", fontWeight: "600", marginBottom: 8, fontSize: 16 },
  savedPlaylistsList: { gap: 8, paddingRight: 20 },
  savedPlaylistItem: { flexDirection: "row", alignItems: "center" },
  savedPlaylistButton: {
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3a3a3a"
  },
  activePlaylistButton: { backgroundColor: "#1DB954", borderColor: "#22c55e" },
  savedPlaylistText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  activePlaylistText: { color: "#000" },
  deleteButton: {
    marginLeft: 4,
    width: 20,
    height: 20,
    backgroundColor: "#8b1d1d",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  deleteButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fff", fontSize: 16 },
});