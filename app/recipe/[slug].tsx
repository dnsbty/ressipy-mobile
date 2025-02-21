import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { fetchRecipeBySlug } from '@/api/apiClient';
import { RecipeDetails } from '@/api/types';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RecipeScreen() {
  const { slug } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    fetchRecipeBySlug(slug as string)
      .then(data => {
        setRecipe(data.recipe);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to load recipe');
        setIsLoading(false);
      });
  }, [slug]);

  const handleShare = async () => {
    await Clipboard.setStringAsync(`https://ressipy.com/recipes/${slug}`);
    Alert.alert('Link Copied', 'Recipe link has been copied to clipboard');
  };

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
        <ThemedText>{error || 'Recipe not found'}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ThemedText type="title" style={styles.title}>{recipe.name}</ThemedText>
      <ThemedText style={styles.author}>by {recipe.author}</ThemedText>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <IconSymbol
          name="square.and.arrow.up"
          size={20}
          color={Colors[colorScheme].tint}
        />
        <ThemedText style={styles.shareText}>Share Recipe</ThemedText>
      </TouchableOpacity>

      <ThemedText type="subtitle" style={styles.sectionTitle}>Ingredients</ThemedText>
      {recipe.ingredients.map((ingredient, index) => (
        <ThemedText key={index} style={styles.ingredient}>
          • {ingredient.amount} {ingredient.name}
        </ThemedText>
      ))}

      <ThemedText type="subtitle" style={styles.sectionTitle}>Instructions</ThemedText>
      {recipe.instructions.map((instruction, index) => (
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
  title: {
    marginBottom: 8,
  },
  author: {
    marginBottom: 20,
    fontStyle: 'italic',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 20,
  },
  shareText: {
    color: Colors.light.tint,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  ingredient: {
    marginBottom: 8,
  },
  instruction: {
    marginBottom: 12,
    lineHeight: 24,
  },
});
