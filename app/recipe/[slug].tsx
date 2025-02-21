import { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Share,
  Platform,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import * as Clipboard from "expo-clipboard";

import { fetchRecipeBySlug } from "@/api/apiClient";
import { Ingredient, Instruction, Recipe } from "@/api/types";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RecipeScreen() {
  const { slug } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? "light";
  const navigation = useNavigation();

  const handleShare = async () => {
    const url = `https://ressipy.com/recipes/${slug}`;

    if (Platform.OS === "web") {
      await Clipboard.setStringAsync(url);
      Alert.alert("Link Copied", "Recipe link has been copied to clipboard");
    } else {
      try {
        const result = await Share.share({
          message: recipe?.name
            ? `Check out this recipe for ${recipe.name}: ${url}`
            : url,
          url, // iOS only
        });

        if (result.action === Share.dismissedAction) {
          // User cancelled the share
          return;
        }
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  useEffect(() => {
    fetchRecipeBySlug(slug as string)
      .then((data) => {
        setRecipe(data.recipe);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load recipe");
        setIsLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <IconSymbol
            name="square.and.arrow.up"
            size={22}
            color={Colors[colorScheme].tint}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colorScheme, recipe]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

  if (error || !recipe) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>{error || "Recipe not found"}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <ThemedText type="title">{recipe.name}</ThemedText>
      {recipe.author && (
        <ThemedText style={styles.author}>by {recipe.author}</ThemedText>
      )}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Ingredients
      </ThemedText>
      {recipe.ingredients.map((ingredient: Ingredient, index: number) => (
        <ThemedText key={index} style={styles.ingredient}>
          • {ingredient.amount} {ingredient.name}
        </ThemedText>
      ))}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Instructions
      </ThemedText>
      {recipe.instructions.map((instruction: Instruction, index: number) => (
        <ThemedText key={index} style={styles.instruction}>
          {index + 1}. {instruction.text}
        </ThemedText>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerButton: {
    marginRight: -12,
    padding: 8,
  },
  author: {
    marginBottom: 4,
    color: "#666",
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  ingredient: {
    marginBottom: 4,
  },
  instruction: {
    marginBottom: 12,
    lineHeight: 24,
  },
});
