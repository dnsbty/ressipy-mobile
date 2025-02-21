import { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  View,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { searchRecipes } from "@/api/database";
import { Recipe } from "@/api/types";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const navigation = useNavigation();

  useEffect(() => {
    console.log("Search screen mounted");
    navigation.setOptions({ title: "Search" });
  }, [navigation]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 0) {
      const results = await searchRecipes(text);
      setRecipes(results);
    } else {
      setRecipes([]);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0",
              color: Colors[colorScheme].text,
            },
          ]}
          placeholder="Search recipes..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <ScrollView style={styles.results}>
        {recipes.map((recipe) => (
          <TouchableOpacity
            key={recipe.slug}
            style={styles.row}
            onPress={() => router.push(`/recipe/${recipe.slug}`)}
          >
            <ThemedText type="defaultSemiBold">{recipe.name}</ThemedText>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors[colorScheme].icon}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  results: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
});
