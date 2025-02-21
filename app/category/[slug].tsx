import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type Recipe = {
  name: string;
  slug: string;
};

type CategoryDetails = {
  name: string;
  recipes: Recipe[];
  slug: string;
};

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams();
  const [category, setCategory] = useState<CategoryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    fetch(`https://ressipy.com/api/categories/${slug}`)
      .then(response => response.json())
      .then(data => {
        setCategory(data.category);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to load recipes');
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

  if (error || !category) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>{error || 'Category not found'}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>{category.name}</ThemedText>
      {category.recipes.map((recipe) => (
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
});
