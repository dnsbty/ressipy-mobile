import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

type Category = {
  name: string;
  slug: string;
};

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";

  useEffect(() => {
    fetch("https://ressipy.com/api/categories")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data.categories);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load categories");
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText>{error}</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Categories
      </ThemedText>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.slug}
          style={styles.row}
          onPress={() => router.push(`/category/${category.slug}`)}
        >
          <ThemedText type="defaultSemiBold">{category.name}</ThemedText>
          <IconSymbol
            name="chevron.right"
            size={20}
            color={Colors[colorScheme].icon}
          />
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  title: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
});
