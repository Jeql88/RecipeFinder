import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlaylistState } from './types';

const PLAYLIST_PREFIX = '@spotify_playlist_';

/**
 * Save the playlist state under a specific playlist name
 */
export const savePlaylistState = async (name: string, state: PlaylistState) => {
  try {
    const key = PLAYLIST_PREFIX + name;
    const json = JSON.stringify(state);
    await AsyncStorage.setItem(key, json);
  } catch (err) {
    console.error(`Failed to save playlist "${name}":`, err);
    throw err;
  }
};

/**
 * Load a playlist state by name
 */
export const loadPlaylistState = async (name: string): Promise<PlaylistState | null> => {
  try {
    const key = PLAYLIST_PREFIX + name;
    const json = await AsyncStorage.getItem(key);
    if (!json) return null;
    return JSON.parse(json);
  } catch (err) {
    console.error(`Failed to load playlist "${name}":`, err);
    return null;
  }
};

/**
 * Clear a playlist state from storage
 */
export const clearPlaylistState = async (name: string) => {
  try {
    const key = PLAYLIST_PREFIX + name;
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.error(`Failed to clear playlist "${name}":`, err);
    throw err;
  }
};

/**
 * Load all saved playlist names
 */
export const loadAllPlaylists = async (): Promise<string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const playlistKeys = keys.filter(key => key.startsWith(PLAYLIST_PREFIX));
    return playlistKeys.map(key => key.replace(PLAYLIST_PREFIX, ''));
  } catch (err) {
    console.error('Failed to load all playlists:', err);
    return [];
  }
};
