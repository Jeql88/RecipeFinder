import { useRouter } from "expo-router";
import { Button, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ComponentShowcase() {
  const router = useRouter();

  const recipes = [
    {
      name: "Chicken Adobo",
      desc: "A Filipino dish with soy sauce, vinegar, and garlic.",
      image: require("/Users/user/Documents/Lui/lui-app/assets/images/adobo.jpg"),
    },
    {
      name: "Pork Sinigang",
      desc: "A sour tamarind soup with vegetables and pork.",
      image: require("/Users/user/Documents/Lui/lui-app/assets/images/sinigang.jpeg"),
    },
    {
      name: "Kare-Kare",
      desc: "A peanut-based stew with oxtail and vegetables.",
      image: require("/Users/user/Documents/Lui/lui-app/assets/images/karekare.jpeg"),
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View
        style={{
          flex: 0.5,
          backgroundColor: "orange",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>FindRecipes</Text>
        </TouchableOpacity>
        <Button title="Nav" onPress={() => {}} />
      </View>

      {/* Content */}
      <View
        style={{
          flex: 6,
          backgroundColor: "white",
          borderRadius: 8,
          marginVertical: 8,
          elevation: 3,
        }}
      >
        <ScrollView contentContainerStyle={{ alignItems: "center", paddingVertical: 16 }}>
          {recipes.map((item, index) => (
            <View
              key={index}
              style={{
                marginBottom: 24,
                alignItems: "center",
                width: "90%",
              }}
            >
              <Image
                source={item.image}
                style={{ width: "100%", height: 200, borderRadius: 12 }}
                resizeMode="cover"
              />
              <Text style={{ marginTop: 12, fontSize: 18, fontWeight: "bold" }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 14, color: "gray", textAlign: "center", marginTop: 4 }}>
                {item.desc}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Footer */}
      <View
        style={{
          flex: 0.5,
          backgroundColor: "orange",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <Button title="Settings" onPress={() => router.push("/Settings")} />
      </View>
    </View>
  );
}
