import * as SQLite from "expo-sqlite";
import { Category, Recipe } from "./types";

let db: SQLite.SQLiteDatabase;

// Initialize database tables
export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync("ressipy.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
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

  // Check if we need to populate the database
  const categoriesCount = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM categories",
  );

  if (categoriesCount?.count === 0) {
    console.info("Fetching initial data from API");
    try {
      const response = await fetch("https://ressipy.com/api/data");
      const data = await response.json();

      await db.withTransactionAsync(async () => {
        // Save categories
        for (const category of data.categories) {
          await db.runAsync(
            `INSERT INTO categories (slug, name, updated_at)
              VALUES (?, ?, ?)
              ON CONFLICT(slug) DO UPDATE SET
                name = excluded.name,
                updated_at = excluded.updated_at
            `,
            [category.slug, category.name, Date.now()],
          );
        }

        // Save recipes
        const recipeCount = data.recipes.length;
        const placeholders = Array(recipeCount).fill("(?, ?, ?, ?, ?, ?, ?)").join(",");
        const values = [];
        for (const recipe of data.recipes) {
          values.push([
            recipe.slug,
            recipe.name,
            recipe.author,
            recipe.category.slug,
            JSON.stringify(recipe.ingredients),
            JSON.stringify(recipe.instructions),
            Date.now(),
          ]);
        }
        await db.runAsync(
          `INSERT INTO recipes (
              slug,
              name,
              author,
              category_slug,
              ingredients,
              instructions,
              updated_at
            ) VALUES ${placeholders}
            ON CONFLICT(slug) DO UPDATE SET
              name = excluded.name,
              author = excluded.author,
              category_slug = excluded.category_slug,
              ingredients = excluded.ingredients,
              instructions = excluded.instructions,
              updated_at = excluded.updated_at
            `,
          values.flat(),
        );
      });
      console.info("Initial data loaded successfully");
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  }
}

export async function resetDatabase(): Promise<void> {
  try {
    await db.execAsync(`
    DELETE FROM categories;
    DELETE FROM recipes;
  `);
    console.info('Database reset successfully');
  } catch (error) {
    console.error('Failed to reset database:', error);
  }
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
        `INSERT INTO categories (slug, name, updated_at) VALUES (?, ?, ?)
          ON CONFLICT(slug) DO UPDATE SET
            name = excluded.name,
            updated_at = excluded.updated_at
        `,
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
      `INSERT INTO recipes (
        slug,
        name,
        author,
        category_slug,
        ingredients,
        instructions,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        name = excluded.name,
        author = excluded.author,
        category_slug = excluded.category_slug,
        ingredients = excluded.ingredients,
        instructions = excluded.instructions,
        updated_at = excluded.updated_at
      `,
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

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const results = await db.getAllAsync<Recipe>(
    `SELECT * FROM recipes 
     WHERE name LIKE ? 
     OR author LIKE ? 
     OR ingredients LIKE ? 
     ORDER BY name`,
    [`%${query}%`, `%${query}%`, `%${query}%`]
  );

  return results.map((recipe) => ({
    ...recipe,
    ingredients: JSON.parse(recipe.ingredients as unknown as string),
    instructions: JSON.parse(recipe.instructions as unknown as string),
  }));
}
