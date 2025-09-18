import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import { useRouter } from "expo-router";
import { profileStorage } from "../app/utils/storage";
import NavBar from "../components/BottomNav";

// Types
interface ProfileFormData {
  username: string;
  email: string;
  genre: string;
  displayName?: string;
  bio?: string;
  avatar?: string; // Add avatar field
}

interface FormErrors {
  username?: string;
  email?: string;
  genre?: string;
  displayName?: string;
  bio?: string;
  avatar?: string; // Add avatar error field
}

// Default profile data
const DEFAULT_PROFILE: ProfileFormData = {
  username: "john_doe",
  email: "johndoe@email.com",
  genre: "Pop",
  displayName: "John Doe",
  bio: "Music lover and playlist creator",
  avatar: undefined, // Initialize avatar as undefined
};

// Validation utility
const validateField = (field: keyof ProfileFormData, value: string): string => {
  switch (field) {
    case "username":
      if (!value) return "What should we call you?";
      if (value.length < 3) return "Too short. Make it at least 3 characters.";
      if (value.length > 20) return "Too long. Keep it under 20 characters.";
      if (!/^[a-zA-Z0-9_]+$/.test(value))
        return "Only letters, numbers, and underscores allowed.";
      return "";
    case "email":
      if (!value) return "You'll need this to log in.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "This email doesn't look right.";
      return "";
    case "genre":
      if (!value) return "Pick your vibe! What gets you moving?";
      return "";
    case "displayName":
      if (value && value.length > 30) return "Display name too long.";
      return "";
    case "bio":
      if (value && value.length > 150)
        return "Bio is too long. Keep it under 150 characters.";
      return "";
    case "avatar":
      // Optional: Add validation for avatar (e.g., file size, format)
      return "";
    default:
      return "";
  }
};

// Genre options
const GENRES = [
  "Pop",
  "Rock",
  "Jazz",
  "Classical",
  "Hip-Hop",
  "Electronic",
  "R&B",
  "Country",
  "Indie",
  "Alternative",
];

// ProfilePreview Component
const ProfilePreview: React.FC<{
  formData: ProfileFormData;
  errors: FormErrors;
  onChangeAvatar: () => void; // Add callback for changing avatar
}> = ({ formData, errors, onChangeAvatar }) => {
  const getGenreImage = (selectedGenre: string) => {
    const genreImages: { [key: string]: string } = {
      Pop: "https://via.placeholder.com/100/FF1493/FFFFFF?text=POP",
      Rock: "https://via.placeholder.com/100/DC143C/FFFFFF?text=ROCK",
      Jazz: "https://via.placeholder.com/100/4682B4/FFFFFF?text=JAZZ",
      Classical: "https://via.placeholder.com/100/9370DB/FFFFFF?text=CLASSIC",
      "Hip-Hop": "https://via.placeholder.com/100/32CD32/FFFFFF?text=HIP-HOP",
      Electronic: "https://via.placeholder.com/100/00BFFF/FFFFFF?text=ELECTRO",
      "R&B": "https://via.placeholder.com/100/FF6347/FFFFFF?text=R&B",
      Country: "https://via.placeholder.com/100/DAA520/FFFFFF?text=COUNTRY",
      Indie: "https://via.placeholder.com/100/FF69B4/FFFFFF?text=INDIE",
      Alternative: "https://via.placeholder.com/100/8A2BE2/FFFFFF?text=ALT",
    };
    return genreImages[selectedGenre] || "https://via.placeholder.com/100/535353/FFFFFF?text=MUSIC";
  };

  return (
    <View style={styles.previewContainer}>
      <View style={styles.profilePreview}>
        <TouchableOpacity onPress={onChangeAvatar} style={styles.avatarContainer}>
          <Image
            source={{
              uri: formData.avatar || getGenreImage(formData.genre), // Use avatar if available, else genre image
            }}
            style={styles.previewAvatar}
          />
          <View style={styles.changeAvatarOverlay}>
            <Text style={styles.changeAvatarText}>Change</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.previewInfo}>
          <Text style={[styles.previewName, errors.username && styles.previewError]}>
            {formData.displayName || formData.username || "Your Name"}
          </Text>
          <Text style={[styles.previewUsername, errors.username && styles.previewError]}>
            @{formData.username || "username"}
          </Text>
          <Text style={[styles.previewEmail, errors.email && styles.previewError]}>
            {formData.email || "your.email@domain.com"}
          </Text>
          {formData.genre && (
            <View style={styles.genreChip}>
              <Text style={styles.genreText}>{formData.genre}</Text>
            </View>
          )}
          {formData.bio && <Text style={styles.previewBio}>{formData.bio}</Text>}
        </View>
      </View>
    </View>
  );
};

// Field Input Component
const FieldInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: "default" | "email-address";
}> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  maxLength,
  keyboardType = "default",
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9a9a9a"
        style={[
          styles.fieldInput,
          multiline && styles.multilineInput,
          error && styles.inputError,
          focused && !error && styles.inputFocused,
        ]}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType={multiline ? "default" : "next"}
      />
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Genre Selector Component
const GenreSelector: React.FC<{
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  error?: string;
}> = ({ selectedGenre, onSelectGenre, error }) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>Favorite Genre</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.genreScrollContainer}
      >
        {GENRES.map((genre) => (
          <TouchableOpacity
            key={genre}
            onPress={() => onSelectGenre(genre)}
            style={[
              styles.genreOption,
              selectedGenre === genre && styles.genreOptionSelected,
              error && selectedGenre === genre && styles.genreOptionError,
            ]}
          >
            <Text
              style={[
                styles.genreOptionText,
                selectedGenre === genre && styles.genreOptionTextSelected,
              ]}
            >
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Main EditProfile Component
export default function EditProfileScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>(DEFAULT_PROFILE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing profile or use defaults
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Load existing profile
        const profile = await profileStorage.loadProfile();
        if (profile && isMounted) {
          const loadedData: ProfileFormData = {
            username: profile.username,
            email: profile.email,
            genre: profile.genre,
            displayName: profile.displayName || "",
            bio: profile.bio || "",
            avatar: profile.avatar, // Load avatar
          };
          setFormData(loadedData);
        }
        // If no profile exists, DEFAULT_PROFILE will remain
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Validate form in real-time
  useEffect(() => {
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const field = key as keyof ProfileFormData;
      const value = formData[field] || "";
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
  }, [formData]);

  const handleFieldUpdate = useCallback(
    (field: keyof ProfileFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    []
  );

  // Handle image picker
  const handleChangeAvatar = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to change your profile picture."
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 0.7, // Compress image
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setFormData((prev) => ({ ...prev, avatar: uri }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleSave = async () => {
    // Validate all required fields
    const requiredFields: (keyof ProfileFormData)[] = [
      "username",
      "email",
      "genre",
    ];
    let hasErrors = false;

    for (const field of requiredFields) {
      const value = formData[field] || "";
      if (!value || validateField(field, value)) {
        hasErrors = true;
        break;
      }
    }

    if (hasErrors) {
      Alert.alert("Validation Error", "Please fix all errors before saving.");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }

    setIsSaving(true);
    try {
      // Check if profile exists
      const existingProfile = await profileStorage.loadProfile();

      if (existingProfile) {
        // Update existing profile
        await profileStorage.updateProfile({
          username: formData.username,
          email: formData.email,
          genre: formData.genre,
          displayName: formData.displayName,
          bio: formData.bio,
          avatar: formData.avatar, // Save avatar
        });
      } else {
        // Create new profile
        await profileStorage.createProfile(formData);
      }

      Alert.alert("Success", "Profile saved successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      Alert.alert("Error", "Failed to save profile. Please try again.");
      console.error("Save profile error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid =
    !Object.values(errors).some((error) => error) &&
    formData.username &&
    formData.email &&
    formData.genre;

  if (isLoading) {
    return (
      <LinearGradient colors={["#0d0d0d", "#121212"]} style={styles.bg}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0d0d0d", "#121212"]} style={styles.bg}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollArea}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Preview at Top */}
          <ProfilePreview
            formData={formData}
            errors={errors}
            onChangeAvatar={handleChangeAvatar} // Pass the avatar change handler
          />

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <FieldInput
              label="Username *"
              value={formData.username}
              onChangeText={(text) => handleFieldUpdate("username", text)}
              placeholder="Enter your username"
              error={errors.username}
              maxLength={20}
            />

            <FieldInput
              label="Display Name"
              value={formData.displayName || ""}
              onChangeText={(text) => handleFieldUpdate("displayName", text)}
              placeholder="How should people see your name?"
              error={errors.displayName}
              maxLength={30}
            />

            <FieldInput
              label="Email *"
              value={formData.email}
              onChangeText={(text) => handleFieldUpdate("email", text)}
              placeholder="Enter your email address"
              error={errors.email}
              keyboardType="email-address"
            />

            <GenreSelector
              selectedGenre={formData.genre}
              onSelectGenre={(genre) => handleFieldUpdate("genre", genre)}
              error={errors.genre}
            />

            <FieldInput
              label="Bio"
              value={formData.bio || ""}
              onChangeText={(text) => handleFieldUpdate("bio", text)}
              placeholder="Tell us a bit about yourself..."
              error={errors.bio}
              multiline={true}
              maxLength={150}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, (!isFormValid || isSaving) && styles.saveButtonDisabled]}
            disabled={!isFormValid || isSaving}
          >
            <LinearGradient
              colors={
                isFormValid && !isSaving
                  ? ["#1DB954", "#1ed760"]
                  : ["#535353", "#535353"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  (!isFormValid || isSaving) && styles.saveButtonTextDisabled,
                ]}
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Nav */}
      <NavBar />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    color: "#1DB954",
    fontSize: 18,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 60,
  },
  scrollArea: {
    paddingBottom: 120,
  },
  previewContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  profilePreview: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  previewAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  changeAvatarOverlay: {
    position: "absolute",
    bottom: 0,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeAvatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  previewUsername: {
    color: "#9a9a9a",
    fontSize: 16,
    marginBottom: 4,
  },
  previewEmail: {
    color: "#9a9a9a",
    fontSize: 14,
    marginBottom: 8,
  },
  previewError: {
    color: "#f15e6c",
  },
  genreChip: {
    backgroundColor: "#1DB954",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  genreText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
  },
  previewBio: {
    color: "#b3b3b3",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 18,
  },
  formContainer: {
    marginBottom: 30,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#8b1d1d",
    backgroundColor: "#1a0f0f",
  },
  inputFocused: {
    borderColor: "#1DB954",
  },
  characterCount: {
    color: "#9a9a9a",
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  errorText: {
    color: "#f15e6c",
    fontSize: 12,
    marginTop: 4,
  },
  genreScrollContainer: {
    gap: 8,
    paddingRight: 20,
  },
  genreOption: {
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  genreOptionSelected: {
    backgroundColor: "#1DB954",
    borderColor: "#22c55e",
  },
  genreOptionError: {
    borderColor: "#8b1d1d",
  },
  genreOptionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  genreOptionTextSelected: {
    color: "#000",
    fontWeight: "600",
  },
  saveButton: {
    width: "100%",
    marginBottom: 20,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  saveButtonTextDisabled: {
    color: "#b3b3b3",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
});