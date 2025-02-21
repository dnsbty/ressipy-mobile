import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import { Category, Recipe } from "./types";

let db: SQLite.SQLiteDatabase;

// Initialize database tables
export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync("ressipy.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS category_details;
    DROP TABLE IF EXISTS recipes;
    
    CREATE TABLE IF NOT EXISTS categories (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS recipes (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      author TEXT,
      category_slug TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (category_slug) REFERENCES categories (slug)
    );
  `);
}

export async function getCategories(): Promise<Category[]> {
  const results = await db.getAllAsync<Category>(
    "SELECT * FROM categories ORDER BY name",
  );
  return results;
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await db.withTransactionAsync(async () => {
    // Clear existing categories
    await db.runAsync("DELETE FROM categories");

    // Insert new categories
    for (const category of categories) {
      await db.runAsync(
        "INSERT INTO categories (slug, name, updated_at) VALUES (?, ?, ?)",
        [category.slug, category.name, Date.now()],
      );
    }
  });
}

export async function getRecipesByCategory(
  categorySlug: string,
): Promise<Recipe[]> {
  const results = await db.getAllAsync<Recipe>(
    "SELECT * FROM recipes WHERE category_slug = ? ORDER BY name",
    [categorySlug],
  );

  return results.map((recipe) => ({
    ...recipe,
    ingredients: JSON.parse(recipe.ingredients as unknown as string),
    instructions: JSON.parse(recipe.instructions as unknown as string),
  }));
}

export async function getRecipe(slug: string): Promise<Recipe | null> {
  const result = await db.getFirstAsync<Recipe>(
    "SELECT * FROM recipes WHERE slug = ?",
    [slug],
  );

  if (!result) return null;

  return {
    ...result,
    ingredients: JSON.parse(result.ingredients as unknown as string),
    instructions: JSON.parse(result.instructions as unknown as string),
  };
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO recipes (
      slug,
      name,
      author,
      category_slug,
      ingredients,
      instructions,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        recipe.slug,
        recipe.name,
        recipe.author,
        recipe.category_slug,
        JSON.stringify(recipe.ingredients),
        JSON.stringify(recipe.instructions),
        Date.now(),
      ],
    );
  } catch (error) {
    console.error(error);
  }
}
