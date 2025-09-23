// app/(tabs)/playlists.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import NavBar from "../components/BottomNav";
import ProfileAvatar from "@/components/ProfileAvatar";
import CustomDrawer from "@/components/CustomDrawer";
import { useTheme } from "../app/context/ThemeContext";

type Playlist = {
  id: string;
  title: string;
  image: string;
};

const PLAYLISTS: Playlist[] = [
  { id: "top-hits", title: "Today's Top Hits", image: "https://picsum.photos/seed/tophits/300" },
  { id: "chill", title: "Chill Hits", image: "https://picsum.photos/seed/chill/300" },
  { id: "workout", title: "Beast Mode", image: "https://picsum.photos/seed/workout/300" },
  { id: "focus", title: "Deep Focus", image: "https://picsum.photos/seed/focus/300" },
  { id: "throwback", title: "All Out 00s", image: "https://picsum.photos/seed/throwback/300" },
  { id: "mood", title: "Mood Booster", image: "https://picsum.photos/seed/mood/300" },
];

export default function PlaylistsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { colors } = useTheme(); // ✅ use global colors

  const openPlaylist = (p: Playlist) => {
    router.push("/playlist"); // placeholder
  };

  return (
    <>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header with Profile + Search */}
        <View style={styles.topBar}>
          <ProfileAvatar onPress={() => setDrawerOpen(true)} />
          <Text style={[styles.searchTitle, { color: colors.text }]}>Search</Text>
        </View>

        {/* Search Bar */}
        <TextInput
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          placeholder="What do you want to listen to?"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick grid */}
          <View style={styles.grid}>
            {PLAYLISTS.slice(0, 6).map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => openPlaylist(p)}
              >
                <Image source={{ uri: p.image }} style={styles.tileCover} />
                <Text numberOfLines={2} style={[styles.tileTitle, { color: colors.text }]}>
                  {p.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Section: Made for You */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Made for you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PLAYLISTS.map((p) => (
              <TouchableOpacity
                key={`mf-${p.id}`}
                style={styles.card}
                onPress={() => openPlaylist(p)}
              >
                <Image
                  source={{ uri: p.image }}
                  style={[styles.cardCover, { backgroundColor: colors.surface }]}
                />
                <Text numberOfLines={1} style={[styles.cardTitle, { color: colors.text }]}>
                  {p.title}
                </Text>
                <Text numberOfLines={2} style={[styles.cardSub, { color: colors.textSecondary }]}>
                  Handpicked tracks based on your taste.
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
        <NavBar />
      </LinearGradient>

      {/* Drawer with backdrop */}
      {drawerOpen && (
        <>
          <Pressable style={styles.backdrop} onPress={() => setDrawerOpen(false)} />
          <CustomDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55, paddingHorizontal: 16 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: "700",
  },

  searchBar: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  tile: {
    width: "48%",
    height: 64,
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
  },
  tileCover: {
    width: 64,
    height: 64,
  },
  tileTitle: {
    flex: 1,
    fontWeight: "600",
    marginLeft: 10,
    marginRight: 6,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    width: 150,
    marginRight: 14,
  },
  cardCover: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: "700",
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
