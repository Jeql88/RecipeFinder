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
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { profileStorage } from "../app/utils/storage";
import NavBar from "../components/BottomNav";
import { useTheme } from "./hooks/useTheme";

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
  onChangeAvatar: () => void;
  colors: any;
}> = ({ formData, errors, onChangeAvatar, colors }) => {
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

  const previewStyles = StyleSheet.create({
    previewContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    previewInfo: {
      flex: 1,
    },
    previewName: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 4,
    },
    previewUsername: {
      color: colors.textSecondary,
      fontSize: 16,
      marginBottom: 4,
    },
    previewEmail: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: 8,
    },
    previewError: {
      color: colors.error,
    },
    genreChip: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-start",
      marginBottom: 8,
    },
    genreText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    previewBio: {
      color: colors.textSecondary,
      fontSize: 14,
      fontStyle: "italic",
      lineHeight: 18,
    },
  });

  return (
    <View style={previewStyles.previewContainer}>
      <View style={previewStyles.profilePreview}>
        <TouchableOpacity onPress={onChangeAvatar} style={previewStyles.avatarContainer}>
          <Image
            source={{
              uri: formData.avatar || getGenreImage(formData.genre),
            }}
            style={previewStyles.previewAvatar}
          />
          <View style={previewStyles.changeAvatarOverlay}>
            <Text style={previewStyles.changeAvatarText}>Change</Text>
          </View>
        </TouchableOpacity>
        <View style={previewStyles.previewInfo}>
          <Text style={[previewStyles.previewName, errors.username && previewStyles.previewError]}>
            {formData.displayName || formData.username || "Your Name"}
          </Text>
          <Text style={[previewStyles.previewUsername, errors.username && previewStyles.previewError]}>
            @{formData.username || "username"}
          </Text>
          <Text style={[previewStyles.previewEmail, errors.email && previewStyles.previewError]}>
            {formData.email || "your.email@domain.com"}
          </Text>
          {formData.genre && (
            <View style={previewStyles.genreChip}>
              <Text style={previewStyles.genreText}>{formData.genre}</Text>
            </View>
          )}
          {formData.bio && <Text style={previewStyles.previewBio}>{formData.bio}</Text>}
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
  colors: any;
}> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  maxLength,
  keyboardType = "default",
  colors,
}) => {
  const [focused, setFocused] = useState(false);

  const fieldStyles = StyleSheet.create({
    fieldContainer: {
      marginBottom: 20,
    },
    fieldLabel: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 16,
      marginBottom: 8,
    },
    fieldInput: {
      backgroundColor: colors.surface,
      color: colors.text,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 8,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    multilineInput: {
      height: 80,
      textAlignVertical: "top",
    },
    inputError: {
      borderColor: colors.error,
      backgroundColor: colors.surface,
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    characterCount: {
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: "right",
      marginTop: 4,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 4,
    },
  });

  return (
    <View style={fieldStyles.fieldContainer}>
      <Text style={fieldStyles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[
          fieldStyles.fieldInput,
          multiline && fieldStyles.multilineInput,
          error && fieldStyles.inputError,
          focused && !error && fieldStyles.inputFocused,
        ]}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType={multiline ? "default" : "next"}
      />
      {maxLength && (
        <Text style={fieldStyles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
      {error && <Text style={fieldStyles.errorText}>{error}</Text>}
    </View>
  );
};

// Genre Selector Component
const GenreSelector: React.FC<{
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  error?: string;
  colors: any;
}> = ({ selectedGenre, onSelectGenre, error, colors }) => {
  const genreStyles = StyleSheet.create({
    fieldContainer: {
      marginBottom: 20,
    },
    fieldLabel: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 16,
      marginBottom: 8,
    },
    genreScrollContainer: {
      gap: 8,
      paddingRight: 20,
    },
    genreOption: {
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    genreOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    genreOptionError: {
      borderColor: colors.error,
    },
    genreOptionText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "500",
    },
    genreOptionTextSelected: {
      color: colors.text,
      fontWeight: "600",
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 4,
    },
  });

  return (
    <View style={genreStyles.fieldContainer}>
      <Text style={genreStyles.fieldLabel}>Favorite Genre</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={genreStyles.genreScrollContainer}
      >
        {GENRES.map((genre) => (
          <TouchableOpacity
            key={genre}
            onPress={() => onSelectGenre(genre)}
            style={[
              genreStyles.genreOption,
              selectedGenre === genre && genreStyles.genreOptionSelected,
              error && selectedGenre === genre && genreStyles.genreOptionError,
            ]}
          >
            <Text
              style={[
                genreStyles.genreOptionText,
                selectedGenre === genre && genreStyles.genreOptionTextSelected,
              ]}
            >
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {error && <Text style={genreStyles.errorText}>{error}</Text>}
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
  const { colors } = useTheme();

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

  const mainStyles = StyleSheet.create({
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
      color: colors.primary,
      fontSize: 18,
      fontWeight: "600",
    },
    headerTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "600",
    },
    headerSpacer: {
      width: 60,
    },
    scrollArea: {
      paddingBottom: 120,
    },
    formContainer: {
      marginBottom: 30,
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
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    saveButtonTextDisabled: {
      color: colors.textSecondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      color: colors.text,
      fontSize: 16,
    },
  });

  if (isLoading) {
    return (
      <LinearGradient colors={[colors.background, colors.surface]} style={mainStyles.bg}>
        <SafeAreaView style={mainStyles.container}>
          <View style={mainStyles.loadingContainer}>
            <Text style={mainStyles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.background, colors.surface]} style={mainStyles.bg}>
      <SafeAreaView style={mainStyles.container}>
        {/* Header */}
        <View style={mainStyles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={mainStyles.backButton}
          >
            <Text style={mainStyles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={mainStyles.headerTitle}>Edit Profile</Text>
          <View style={mainStyles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={mainStyles.scrollArea}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Preview at Top */}
          <ProfilePreview
            formData={formData}
            errors={errors}
            onChangeAvatar={handleChangeAvatar}
            colors={colors}
          />

          {/* Form Fields */}
          <View style={mainStyles.formContainer}>
            <FieldInput
              label="Username *"
              value={formData.username}
              onChangeText={(text) => handleFieldUpdate("username", text)}
              placeholder="Enter your username"
              error={errors.username}
              maxLength={20}
              colors={colors}
            />

            <FieldInput
              label="Display Name"
              value={formData.displayName || ""}
              onChangeText={(text) => handleFieldUpdate("displayName", text)}
              placeholder="How should people see your name?"
              error={errors.displayName}
              maxLength={30}
              colors={colors}
            />

            <FieldInput
              label="Email *"
              value={formData.email}
              onChangeText={(text) => handleFieldUpdate("email", text)}
              placeholder="Enter your email address"
              error={errors.email}
              keyboardType="email-address"
              colors={colors}
            />

            <GenreSelector
              selectedGenre={formData.genre}
              onSelectGenre={(genre) => handleFieldUpdate("genre", genre)}
              error={errors.genre}
              colors={colors}
            />

            <FieldInput
              label="Bio"
              value={formData.bio || ""}
              onChangeText={(text) => handleFieldUpdate("bio", text)}
              placeholder="Tell us a bit about yourself..."
              error={errors.bio}
              multiline={true}
              maxLength={150}
              colors={colors}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            style={[mainStyles.saveButton, (!isFormValid || isSaving) && mainStyles.saveButtonDisabled]}
            disabled={!isFormValid || isSaving}
          >
            <LinearGradient
              colors={
                isFormValid && !isSaving
                  ? [colors.primary, colors.secondary]
                  : [colors.textSecondary, colors.textSecondary]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={mainStyles.saveButtonGradient}
            >
              <Text
                style={[
                  mainStyles.saveButtonText,
                  (!isFormValid || isSaving) && mainStyles.saveButtonTextDisabled,
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
