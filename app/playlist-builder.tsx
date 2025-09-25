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
import { useTheme } from "./hooks/useTheme";

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
const SongInput: React.FC<{ onAdd: (song: Song) => void; colors: any }> = ({ onAdd, colors }) => {
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

  const songInputStyles = StyleSheet.create({
    songInputContainer: { marginBottom: 12 },
    songInput: {
      backgroundColor: colors.surface,
      color: colors.text,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.primary,
    },
    addButtonText: { color: colors.text, fontWeight: "600", fontSize: 14 },
  });

  return (
    <View style={songInputStyles.songInputContainer}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Song title"
        placeholderTextColor={colors.textSecondary}
        style={songInputStyles.songInput}
        returnKeyType="next"
      />
      <TextInput
        value={artist}
        onChangeText={setArtist}
        placeholder="Artist"
        placeholderTextColor={colors.textSecondary}
        style={songInputStyles.songInput}
        returnKeyType="done"
        onSubmitEditing={handleAdd}
      />
      <TouchableOpacity onPress={handleAdd} style={songInputStyles.addButton}>
        <Text style={songInputStyles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

// SongItem Component
const SongItem: React.FC<{ song: Song; onRemove: (id: string) => void; colors: any }> = ({ song, onRemove, colors }) => {
  const songItemStyles = StyleSheet.create({
    songItem: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
    },
    songInfo: { flex: 1, marginRight: 12 },
    songTitle: { color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: 2 },
    songArtist: { color: colors.textSecondary, fontSize: 14 },
    removeButton: {
      width: 24,
      height: 24,
      backgroundColor: colors.error,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    removeButtonText: { color: colors.text, fontSize: 16, fontWeight: "600" },
  });

  return (
    <View style={songItemStyles.songItem}>
      <View style={songItemStyles.songInfo}>
        <Text style={songItemStyles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={songItemStyles.songArtist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onRemove(song.id)}
        style={songItemStyles.removeButton}
      >
        <Text style={songItemStyles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

// SongList Component
const SongList: React.FC<{ songs: Song[]; onRemove: (id: string) => void; colors: any }> = ({ songs, onRemove, colors }) => {
  const songListStyles = StyleSheet.create({
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
    emptyStateText: { color: colors.text, fontSize: 18, fontWeight: "600", marginBottom: 8 },
    emptyStateSubtext: { color: colors.textSecondary, fontSize: 14 },
    songListContainer: { paddingVertical: 4 },
  });

  if (songs.length === 0) {
    return (
      <View style={songListStyles.emptyState}>
        <Text style={songListStyles.emptyStateText}>No songs added yet</Text>
        <Text style={songListStyles.emptyStateSubtext}>Add some songs to get started!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SongItem song={item} onRemove={onRemove} colors={colors} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={songListStyles.songListContainer}
    />
  );
};

// Main PlaylistBuilder Component
export default function PlaylistBuilderScreen() {
  const [state, dispatch] = useReducer(playlistReducer, initialState);
  const [playlistName, setPlaylistName] = useState("");
  const [savedPlaylists, setSavedPlaylists] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = useTheme();

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

  const mainStyles = StyleSheet.create({
    bg: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    header: { color: colors.text, fontSize: 28, fontWeight: "600", marginBottom: 16 },
    playlistInput: {
      backgroundColor: colors.surface,
      color: colors.text,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 25,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    controls: { width: "100%", marginBottom: 16 },
    actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, gap: 8 },
    actionBtn: {
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 20,
      flex: 1,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionText: { color: colors.text, fontWeight: "600", fontSize: 12 },
    warnBtn: { backgroundColor: colors.error, borderColor: colors.error },
    greyBtn: { backgroundColor: colors.textSecondary, borderColor: colors.textSecondary },
    disabled: { opacity: 0.3 },
    saveBtn: { backgroundColor: colors.primary, borderColor: colors.primary, marginTop: 8 },
    scrollArea: { paddingVertical: 8, paddingBottom: 120 },
    playlistInfo: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border
    },
    playlistInfoText: { color: colors.primary, fontSize: 14, textAlign: "center", fontWeight: "500" },
    savedPlaylistsContainer: { marginTop: 16, paddingBottom: 8 },
    savedPlaylistsHeader: { color: colors.text, fontWeight: "600", marginBottom: 8, fontSize: 16 },
    savedPlaylistsList: { gap: 8, paddingRight: 20 },
    savedPlaylistItem: { flexDirection: "row", alignItems: "center" },
    savedPlaylistButton: {
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border
    },
    activePlaylistButton: { backgroundColor: colors.primary, borderColor: colors.primary },
    savedPlaylistText: { color: colors.text, fontSize: 14, fontWeight: "500" },
    activePlaylistText: { color: colors.text },
    deleteButton: {
      marginLeft: 4,
      width: 20,
      height: 20,
      backgroundColor: colors.error,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center"
    },
    deleteButtonText: { color: colors.text, fontSize: 12, fontWeight: "600" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { color: colors.text, fontSize: 16 },
  });

  if (isLoading) {
    return (
      <LinearGradient colors={[colors.background, colors.surface]} style={mainStyles.bg}>
        <SafeAreaView style={mainStyles.container}>
          <View style={mainStyles.loadingContainer}>
            <Text style={mainStyles.loadingText}>Loading playlists...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.background, colors.surface]} style={mainStyles.bg}>
      <SafeAreaView style={mainStyles.container}>
        <Text style={mainStyles.header}>Create Playlist</Text>
        
        <TextInput
          value={playlistName}
          onChangeText={setPlaylistName}
          placeholder="Enter playlist name"
          placeholderTextColor={colors.textSecondary}
          style={mainStyles.playlistInput}
          returnKeyType="done"
        />

        <View style={mainStyles.controls}>
          <SongInput onAdd={handleAdd} colors={colors} />
          
          <View style={mainStyles.actionRow}>
            <TouchableOpacity
              onPress={handleUndo}
              disabled={state.past.length === 0}
              style={[mainStyles.actionBtn, state.past.length === 0 && mainStyles.disabled]}
            >
              <Text style={mainStyles.actionText}>Undo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleRedo}
              disabled={state.future.length === 0}
              style={[mainStyles.actionBtn, state.future.length === 0 && mainStyles.disabled]}
            >
              <Text style={mainStyles.actionText}>Redo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleClear}
              style={[mainStyles.actionBtn, mainStyles.warnBtn]}
            >
              <Text style={mainStyles.actionText}>Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleClearCache}
              style={[mainStyles.actionBtn, mainStyles.greyBtn]}
            >
              <Text style={mainStyles.actionText}>Cache</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSavePlaylist}
            style={[mainStyles.actionBtn, mainStyles.saveBtn]}
            disabled={!playlistName.trim() || state.present.length === 0}
          >
            <Text style={mainStyles.actionText}>Save Playlist</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={mainStyles.scrollArea} 
          showsVerticalScrollIndicator={false}
        >
          <SongList songs={state.present} onRemove={handleRemove} colors={colors} />
          
          {playlistName.trim() && state.present.length > 0 && (
            <View style={mainStyles.playlistInfo}>
              <Text style={mainStyles.playlistInfoText}>
                "{playlistName}" • {state.present.length} songs
              </Text>
            </View>
          )}
        </ScrollView>

        {savedPlaylists.length > 0 && (
          <View style={mainStyles.savedPlaylistsContainer}>
            <Text style={mainStyles.savedPlaylistsHeader}>Saved Playlists:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={mainStyles.savedPlaylistsList}
            >
              {savedPlaylists.map((playlist) => (
                <View key={playlist} style={mainStyles.savedPlaylistItem}>
                  <TouchableOpacity
                    onPress={() => handleLoadPlaylist(playlist)}
                    style={[
                      mainStyles.savedPlaylistButton,
                      playlistName === playlist && mainStyles.activePlaylistButton
                    ]}
                  >
                    <Text style={[
                      mainStyles.savedPlaylistText,
                      playlistName === playlist && mainStyles.activePlaylistText
                    ]}>
                      {playlist}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeletePlaylist(playlist)}
                    style={mainStyles.deleteButton}
                  >
                    <Text style={mainStyles.deleteButtonText}>×</Text>
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
