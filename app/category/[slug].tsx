import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';

import { fetchCategoryBySlug } from '@/api/apiClient';
import { CategoryDetails } from '@/api/types';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams();
  const [category, setCategory] = useState<CategoryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    fetchCategoryBySlug(slug as string)
      .then(data => {
        setCategory(data.category);
        navigation.setOptions({ title: data.category.name });
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to load recipes');
        setIsLoading(false);
      });
  }, [slug, navigation]);

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
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
