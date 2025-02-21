import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type Category = {
  name: string;
  slug: string;
};

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    fetch('https://ressipy.com/api/categories')
      .then(response => response.json())
      .then(data => {
        setCategories(data.categories);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to load categories');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Categories</ThemedText>
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
