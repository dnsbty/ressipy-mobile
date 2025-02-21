import { Category, Recipe } from "./types";
import {
  initDatabase,
  getCategories,
  saveCategories,
  getRecipesByCategory,
  getRecipe,
  saveRecipe,
} from "./database";

const BASE_URL = "https://ressipy.com/api";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Initialize the database when the app starts
initDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
});

async function isStale(timestamp: number): Promise<boolean> {
  return Date.now() - timestamp > CACHE_EXPIRY;
}

export async function fetchCategories(): Promise<{ categories: Category[] }> {
  try {
    const cached = await getCategories();
    console.log({ cached })

    if (cached.length > 0 && !(await isStale(cached[0].updated_at))) {
      return { categories: cached };
    }

    console.info("Fetching categories from API");
    const response = await fetch(`${BASE_URL}/categories`);
    const data = await response.json();
    await saveCategories(data.categories);
    return data;
  } catch (error) {
    const cached = await getCategories();
    if (cached.length > 0) {
      return { categories: cached };
    }
    throw new Error("Failed to fetch categories");
  }
}

export async function fetchCategoryBySlug(
  slug: string,
): Promise<{ category: { name: string; recipes: Recipe[] } }> {
  try {
    const recipes = await getRecipesByCategory(slug);
    const categories = await getCategories();
    const category = categories.find((c) => c.slug === slug);

    if (recipes.length > 0 && !(await isStale(recipes[0].updated_at))) {
      return {
        category: {
          name: category?.name || slug,
          recipes,
        },
      };
    }

    console.info(`Fetching category from API: ${slug}`);
    const response = await fetch(`${BASE_URL}/categories/${slug}`);
    const data = await response.json();

    // Save each recipe from the category
    for (const recipe of data.category.recipes) {
      try {
        console.info(`Fetching recipe from API: ${recipe.slug}`);
        const recipeDetailResponse = await fetch(`${BASE_URL}/recipes/${recipe.slug}`);
        const { recipe: recipeData } = await recipeDetailResponse.json();

        await saveRecipe({
          ...recipeData,
          category_slug: slug,
          updated_at: Date.now(),
        });
      } catch (err) {
        console.error(`Failed to fetch recipe: ${recipe.slug}`, err);
      }
    }

    return data;
  } catch (error) {
    const recipes = await getRecipesByCategory(slug);
    const categories = await getCategories();
    const category = categories.find((c) => c.slug === slug);

    if (recipes.length > 0) {
      return {
        category: {
          name: category?.name || slug,
          recipes,
        },
      };
    }
    throw new Error(`Failed to fetch category: ${slug}`);
  }
}

export async function fetchRecipeBySlug(
  slug: string,
): Promise<{ recipe: Recipe }> {
  try {
    const cached = await getRecipe(slug);

    if (cached && !(await isStale(cached.updated_at))) {
      return { recipe: cached };
    }

    console.info(`Fetching recipe from API: ${slug}`);
    const response = await fetch(`${BASE_URL}/recipes/${slug}`);
    const data = await response.json();

    const recipe = {
      ...data.recipe,
      category_slug: data.recipe.category.slug,
      updated_at: Date.now(),
    };

    await saveRecipe(recipe);
    return { recipe };
  } catch (error) {
    const cached = await getRecipe(slug);
    if (cached) {
      return { recipe: cached };
    }
    throw new Error(`Failed to fetch recipe: ${slug}`);
  }
}
