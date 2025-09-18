import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  PLAYLISTS_LIST: '@spotify_playlists_list',
  PLAYLIST_PREFIX: '@playlist_',
  USER_PREFERENCES: '@user_preferences',
  APP_SETTINGS: '@app_settings',
  USER_PROFILE: '@user_profile',
  PROFILE_FORM_CACHE: '@profile_form_cache',
} as const;

// Types
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration?: number;
  addedAt: number;
}

export interface PlaylistState {
  present: Song[];
  past: Song[][];
  future: Song[][];
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  autoSave: boolean;
  hapticFeedback: boolean;
  notifications: boolean;
}

export interface AppSettings {
  version: string;
  lastOpened: number;
  firstTimeUser: boolean;
}

// New Profile Types
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  genre: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProfileFormData {
  username: string;
  email: string;
  genre: string;
  displayName?: string;
  bio?: string;
}

export interface ProfileFormState {
  present: ProfileFormData;
  past: ProfileFormData[];
  future: ProfileFormData[];
}

// Generic storage utilities
class StorageManager {
  /**
   * Store any JSON-serializable data
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Failed to store item with key ${key}:`, error);
      throw new Error(`Storage error: Unable to save ${key}`);
    }
  }

  /**
   * Retrieve and parse JSON data
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Failed to retrieve item with key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item with key ${key}:`, error);
      throw new Error(`Storage error: Unable to remove ${key}`);
    }
  }

  /**
   * Get all keys from storage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Clear all storage
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error('Storage error: Unable to clear all data');
    }
  }

  /**
   * Get multiple items at once
   */
  async getMultipleItems(keys: string[]): Promise<Array<[string, string | null]>> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Failed to get multiple items:', error);
      return [];
    }
  }

  /**
   * Set multiple items at once
   */
  async setMultipleItems(keyValuePairs: Array<[string, string]>): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Failed to set multiple items:', error);
      throw new Error('Storage error: Unable to save multiple items');
    }
  }

  /**
   * Remove multiple items at once
   */
  async removeMultipleItems(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Failed to remove multiple items:', error);
      throw new Error('Storage error: Unable to remove multiple items');
    }
  }

  /**
   * Check if a key exists in storage
   */
  async keyExists(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Failed to check if key ${key} exists:`, error);
      return false;
    }
  }

  /**
   * Get storage size information
   */
  async getStorageInfo(): Promise<{ totalKeys: number; keys: string[] }> {
    try {
      const keys = await this.getAllKeys();
      return {
        totalKeys: keys.length,
        keys
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { totalKeys: 0, keys: [] };
    }
  }
}

// Playlist-specific storage functions
class PlaylistStorage extends StorageManager {
  /**
   * Save playlist state
   */
  async savePlaylist(name: string, state: PlaylistState): Promise<void> {
    const key = `${STORAGE_KEYS.PLAYLIST_PREFIX}${name}`;
    await this.setItem(key, state);
  }

  /**
   * Load playlist state
   */
  async loadPlaylist(name: string): Promise<PlaylistState | null> {
    const key = `${STORAGE_KEYS.PLAYLIST_PREFIX}${name}`;
    return await this.getItem<PlaylistState>(key);
  }

  /**
   * Delete playlist
   */
  async clearPlaylist(name: string): Promise<void> {
    const key = `${STORAGE_KEYS.PLAYLIST_PREFIX}${name}`;
    await this.removeItem(key);
  }

  /**
   * Save list of playlist names
   */
  async savePlaylistNames(names: string[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.PLAYLISTS_LIST, names);
  }

  /**
   * Get all playlist names
   */
  async getAllPlaylistNames(): Promise<string[]> {
    const names = await this.getItem<string[]>(STORAGE_KEYS.PLAYLISTS_LIST);
    return names || [];
  }

  /**
   * Check if playlist exists
   */
  async playlistExists(name: string): Promise<boolean> {
    const key = `${STORAGE_KEYS.PLAYLIST_PREFIX}${name}`;
    return await this.keyExists(key);
  }

  /**
   * Get all playlists with their data
   */
  async getAllPlaylists(): Promise<Array<{ name: string; data: PlaylistState }>> {
    const names = await this.getAllPlaylistNames();
    const playlists: Array<{ name: string; data: PlaylistState }> = [];

    for (const name of names) {
      const data = await this.loadPlaylist(name);
      if (data) {
        playlists.push({ name, data });
      }
    }

    return playlists;
  }

  /**
   * Export playlist as JSON
   */
  async exportPlaylist(name: string): Promise<string | null> {
    const data = await this.loadPlaylist(name);
    if (!data) return null;

    const exportData = {
      name,
      songs: data.present,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import playlist from JSON
   */
  async importPlaylist(jsonData: string): Promise<{ success: boolean; playlistName?: string; error?: string }> {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.name || !Array.isArray(data.songs)) {
        return { success: false, error: 'Invalid playlist format' };
      }

      const playlistState: PlaylistState = {
        present: data.songs,
        past: [],
        future: []
      };

      await this.savePlaylist(data.name, playlistState);
      
      // Update playlist names list
      const existingNames = await this.getAllPlaylistNames();
      if (!existingNames.includes(data.name)) {
        await this.savePlaylistNames([...existingNames, data.name]);
      }

      return { success: true, playlistName: data.name };
    } catch (error) {
      console.error('Failed to import playlist:', error);
      return { success: false, error: 'Failed to parse or save playlist data' };
    }
  }

  /**
   * Duplicate playlist with new name
   */
  async duplicatePlaylist(originalName: string, newName: string): Promise<boolean> {
    try {
      const originalData = await this.loadPlaylist(originalName);
      if (!originalData) return false;

      await this.savePlaylist(newName, originalData);
      
      const existingNames = await this.getAllPlaylistNames();
      if (!existingNames.includes(newName)) {
        await this.savePlaylistNames([...existingNames, newName]);
      }

      return true;
    } catch (error) {
      console.error('Failed to duplicate playlist:', error);
      return false;
    }
  }

  /**
   * Get playlist statistics
   */
  async getPlaylistStats(name: string): Promise<{
    totalSongs: number;
    totalDuration: number;
    oldestSong?: Song;
    newestSong?: Song;
  } | null> {
    const data = await this.loadPlaylist(name);
    if (!data) return null;

    const songs = data.present;
    const totalSongs = songs.length;
    const totalDuration = songs.reduce((sum, song) => sum + (song.duration || 0), 0);
    
    let oldestSong: Song | undefined;
    let newestSong: Song | undefined;

    if (songs.length > 0) {
      oldestSong = songs.reduce((oldest, song) => 
        song.addedAt < oldest.addedAt ? song : oldest
      );
      newestSong = songs.reduce((newest, song) => 
        song.addedAt > newest.addedAt ? song : newest
      );
    }

    return {
      totalSongs,
      totalDuration,
      oldestSong,
      newestSong
    };
  }
}

// User preferences storage
class UserPreferencesStorage extends StorageManager {
  private defaultPreferences: UserPreferences = {
    theme: 'dark',
    autoSave: true,
    hapticFeedback: true,
    notifications: true
  };

  async savePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const current = await this.getPreferences();
    const updated = { ...current, ...preferences };
    await this.setItem(STORAGE_KEYS.USER_PREFERENCES, updated);
  }

  async getPreferences(): Promise<UserPreferences> {
    const preferences = await this.getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
    return preferences || this.defaultPreferences;
  }

  async resetPreferences(): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_PREFERENCES, this.defaultPreferences);
  }

  async getPreference<K extends keyof UserPreferences>(key: K): Promise<UserPreferences[K]> {
    const preferences = await this.getPreferences();
    return preferences[key];
  }

  async setPreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): Promise<void> {
    await this.savePreferences({ [key]: value } as Partial<UserPreferences>);
  }
}

// App settings storage
class AppSettingsStorage extends StorageManager {
  private defaultSettings: AppSettings = {
    version: '1.0.0',
    lastOpened: Date.now(),
    firstTimeUser: true
  };

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await this.setItem(STORAGE_KEYS.APP_SETTINGS, updated);
  }

  async getSettings(): Promise<AppSettings> {
    const settings = await this.getItem<AppSettings>(STORAGE_KEYS.APP_SETTINGS);
    return settings || this.defaultSettings;
  }

  async updateLastOpened(): Promise<void> {
    await this.saveSettings({ lastOpened: Date.now() });
  }

  async setFirstTimeUserComplete(): Promise<void> {
    await this.saveSettings({ firstTimeUser: false });
  }

  async isFirstTimeUser(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.firstTimeUser;
  }

  async getAppVersion(): Promise<string> {
    const settings = await this.getSettings();
    return settings.version;
  }

  async updateAppVersion(version: string): Promise<void> {
    await this.saveSettings({ version });
  }
}

// Profile storage functions
class ProfileStorage extends StorageManager {
  /**
   * Save user profile
   */
  async saveProfile(profile: UserProfile): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
  }

  /**
   * Load user profile
   */
  async loadProfile(): Promise<UserProfile | null> {
    return await this.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  }

  /**
   * Update profile fields
   */
  async updateProfile(updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): Promise<void> {
    const current = await this.loadProfile();
    if (!current) {
      throw new Error('No profile found to update');
    }

    const updated: UserProfile = {
      ...current,
      ...updates,
      updatedAt: Date.now()
    };

    await this.saveProfile(updated);
  }

  /**
   * Create new profile
   */
  async createProfile(data: ProfileFormData): Promise<UserProfile> {
    const now = Date.now();
    const profile: UserProfile = {
      id: `profile_${now}_${Math.random().toString(36).substr(2, 9)}`,
      username: data.username,
      email: data.email,
      genre: data.genre,
      displayName: data.displayName,
      bio: data.bio,
      createdAt: now,
      updatedAt: now
    };

    await this.saveProfile(profile);
    return profile;
  }

  /**
   * Check if profile exists
   */
  async profileExists(): Promise<boolean> {
    return await this.keyExists(STORAGE_KEYS.USER_PROFILE);
  }

  /**
   * Delete profile
   */
  async deleteProfile(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.USER_PROFILE);
    await this.clearFormCache();
  }

  /**
   * Save form cache for edit session
   */
  async saveFormCache(state: ProfileFormState): Promise<void> {
    await this.setItem(STORAGE_KEYS.PROFILE_FORM_CACHE, state);
  }

  /**
   * Load form cache
   */
  async loadFormCache(): Promise<ProfileFormState | null> {
    return await this.getItem<ProfileFormState>(STORAGE_KEYS.PROFILE_FORM_CACHE);
  }

  /**
   * Clear form cache
   */
  async clearFormCache(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.PROFILE_FORM_CACHE);
  }

  /**
   * Get profile statistics
   */
  async getProfileStats(): Promise<{
    profileAge: number;
    lastUpdated: number;
    hasAvatar: boolean;
    hasBio: boolean;
    completionPercentage: number;
  } | null> {
    const profile = await this.loadProfile();
    if (!profile) return null;

    const now = Date.now();
    const profileAge = now - profile.createdAt;
    const lastUpdated = now - profile.updatedAt;

    const requiredFields = ['username', 'email', 'genre'];
    const optionalFields = ['displayName', 'bio', 'avatar'];
    
    let filledRequired = 0;
    let filledOptional = 0;

    requiredFields.forEach(field => {
      if (profile[field as keyof UserProfile]) filledRequired++;
    });

    optionalFields.forEach(field => {
      if (profile[field as keyof UserProfile]) filledOptional++;
    });

    const completionPercentage = Math.round(
      ((filledRequired / requiredFields.length) * 70 + 
       (filledOptional / optionalFields.length) * 30)
    );

    return {
      profileAge,
      lastUpdated,
      hasAvatar: !!profile.avatar,
      hasBio: !!profile.bio,
      completionPercentage
    };
  }

  /**
   * Export profile as JSON
   */
  async exportProfile(): Promise<string | null> {
    const profile = await this.loadProfile();
    if (!profile) return null;

    const exportData = {
      profile,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import profile from JSON
   */
  async importProfile(jsonData: string): Promise<{ success: boolean; error?: string }> {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.profile || !data.profile.username || !data.profile.email) {
        return { success: false, error: 'Invalid profile format' };
      }

      const profile: UserProfile = {
        ...data.profile,
        updatedAt: Date.now()
      };

      await this.saveProfile(profile);
      return { success: true };
    } catch (error) {
      console.error('Failed to import profile:', error);
      return { success: false, error: 'Failed to parse or save profile data' };
    }
  }
}

// Cache management utilities
class CacheManager extends StorageManager {
  /**
   * Clear all cached data (keeps user preferences and settings)
   */
  async clearCache(): Promise<void> {
    try {
      const allKeys = await this.getAllKeys();
      const cacheKeys = allKeys.filter(key => 
        key.startsWith(STORAGE_KEYS.PLAYLIST_PREFIX) || 
        key === STORAGE_KEYS.PLAYLISTS_LIST ||
        key === STORAGE_KEYS.PROFILE_FORM_CACHE
      );
      
      if (cacheKeys.length > 0) {
        await this.removeMultipleItems(cacheKeys);
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw new Error('Failed to clear cache');
    }
  }

  /**
   * Get cache size information
   */
  async getCacheInfo(): Promise<{
    totalCacheKeys: number;
    playlistKeys: number;
    profileCacheKeys: number;
    totalKeys: number;
  }> {
    const allKeys = await this.getAllKeys();
    const playlistKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.PLAYLIST_PREFIX));
    const profileCacheKeys = allKeys.filter(key => key === STORAGE_KEYS.PROFILE_FORM_CACHE);
    
    return {
      totalCacheKeys: playlistKeys.length + (allKeys.includes(STORAGE_KEYS.PLAYLISTS_LIST) ? 1 : 0) + profileCacheKeys.length,
      playlistKeys: playlistKeys.length,
      profileCacheKeys: profileCacheKeys.length,
      totalKeys: allKeys.length
    };
  }

  /**
   * Clean up orphaned playlist data
   */
  async cleanupOrphanedPlaylists(): Promise<number> {
    try {
      const allKeys = await this.getAllKeys();
      const playlistKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.PLAYLIST_PREFIX));
      const savedNames = await this.getItem<string[]>(STORAGE_KEYS.PLAYLISTS_LIST) || [];
      
      const expectedKeys = savedNames.map(name => `${STORAGE_KEYS.PLAYLIST_PREFIX}${name}`);
      const orphanedKeys = playlistKeys.filter(key => !expectedKeys.includes(key));
      
      if (orphanedKeys.length > 0) {
        await this.removeMultipleItems(orphanedKeys);
      }
      
      return orphanedKeys.length;
    } catch (error) {
      console.error('Failed to cleanup orphaned playlists:', error);
      return 0;
    }
  }
}

// Main storage instances
export const storage = new StorageManager();
export const playlistStorage = new PlaylistStorage();
export const userPreferencesStorage = new UserPreferencesStorage();
export const appSettingsStorage = new AppSettingsStorage();
export const profileStorage = new ProfileStorage();
export const cacheManager = new CacheManager();

// Utility functions for common operations
export const storageUtils = {
  /**
   * Initialize storage on app start
   */
  async initialize(): Promise<void> {
    try {
      await appSettingsStorage.updateLastOpened();
      
      // Clean up any orphaned data
      const orphanedCount = await cacheManager.cleanupOrphanedPlaylists();
      if (orphanedCount > 0) {
        console.log(`Cleaned up ${orphanedCount} orphaned playlists`);
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  },

  /**
   * Get comprehensive storage statistics
   */
  async getStorageStats(): Promise<{
    totalKeys: number;
    totalPlaylists: number;
    cacheSize: number;
    hasUserPreferences: boolean;
    hasAppSettings: boolean;
    hasUserProfile: boolean;
  }> {
    const [storageInfo, cacheInfo, hasPrefs, hasSettings, hasProfile] = await Promise.all([
      storage.getStorageInfo(),
      cacheManager.getCacheInfo(),
      storage.keyExists(STORAGE_KEYS.USER_PREFERENCES),
      storage.keyExists(STORAGE_KEYS.APP_SETTINGS),
      storage.keyExists(STORAGE_KEYS.USER_PROFILE)
    ]);

    return {
      totalKeys: storageInfo.totalKeys,
      totalPlaylists: cacheInfo.playlistKeys,
      cacheSize: cacheInfo.totalCacheKeys,
      hasUserPreferences: hasPrefs,
      hasAppSettings: hasSettings,
      hasUserProfile: hasProfile
    };
  },

  /**
   * Export all data for backup
   */
  async exportAllData(): Promise<string> {
    try {
      const [playlists, preferences, settings, profile] = await Promise.all([
        playlistStorage.getAllPlaylists(),
        userPreferencesStorage.getPreferences(),
        appSettingsStorage.getSettings(),
        profileStorage.loadProfile()
      ]);

      const exportData = {
        playlists,
        preferences,
        settings,
        profile,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export all data:', error);
      throw new Error('Failed to export data');
    }
  },

  /**
   * Import all data from backup
   */
  async importAllData(jsonData: string): Promise<{ success: boolean; error?: string }> {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.playlists || !data.preferences || !data.settings) {
        return { success: false, error: 'Invalid backup format' };
      }

      // Import playlists
      const playlistNames: string[] = [];
      for (const playlist of data.playlists) {
        await playlistStorage.savePlaylist(playlist.name, playlist.data);
        playlistNames.push(playlist.name);
      }
      await playlistStorage.savePlaylistNames(playlistNames);

      // Import preferences and settings
      await userPreferencesStorage.savePreferences(data.preferences);
      await appSettingsStorage.saveSettings(data.settings);

      // Import profile if exists
      if (data.profile) {
        await profileStorage.saveProfile(data.profile);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to import all data:', error);
      return { success: false, error: 'Failed to parse or import backup data' };
    }
  }
};

// Export storage keys for external use if needed
export { STORAGE_KEYS };