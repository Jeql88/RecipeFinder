// components/Settings.tsx
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Settings() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Settings
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 30, textAlign: "center" }}>
        Here you can adjust your preferences.
      </Text>

      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
}
