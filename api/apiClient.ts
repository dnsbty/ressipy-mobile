import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, CategoryDetails, RecipeDetails, CachedData } from './types';

const BASE_URL = 'https://ressipy.com/api';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function isStale(timestamp: number): Promise<boolean> {
  return Date.now() - timestamp > CACHE_EXPIRY;
}

async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp }: CachedData<T> = JSON.parse(cached);
    if (await isStale(timestamp)) return null;

    return data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

export async function fetchCategories(): Promise<{ categories: Category[] }> {
  const cacheKey = 'categories';
  const cached = await getCachedData<{ categories: Category[] }>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${BASE_URL}/categories`);
    const data = await response.json();
    await setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    if (cached) {
      return cached;
    }
    throw new Error('Failed to fetch categories');
  }
}

export async function fetchCategoryBySlug(slug: string): Promise<{ category: CategoryDetails }> {
  const cacheKey = `category:${slug}`;
  const cached = await getCachedData<{ category: CategoryDetails }>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${BASE_URL}/categories/${slug}`);
    const data = await response.json();
    await setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    if (cached) {
      return cached;
    }
    throw new Error(`Failed to fetch category: ${slug}`);
  }
}

export async function fetchRecipeBySlug(slug: string): Promise<{ recipe: RecipeDetails }> {
  const cacheKey = `recipe:${slug}`;
  const cached = await getCachedData<{ recipe: RecipeDetails }>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${BASE_URL}/recipes/${slug}`);
    const data = await response.json();
    await setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    if (cached) {
      return cached;
    }
    throw new Error(`Failed to fetch recipe: ${slug}`);
  }
}
