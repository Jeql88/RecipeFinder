import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";

type Props = {
  onPress: () => void;
  size?: number;
  source?: string;
};

export default function ProfileAvatar({
  onPress,
  size = 40,
  source = "https://cdn-icons-png.flaticon.com/512/149/149071.png",
}: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginRight: 12 }}>
      <Image
        source={{ uri: source }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 2,
    borderColor: "#fff",
  },
});
