export type Category = {
  name: string;
  slug: string;
};

export type Recipe = {
  name: string;
  slug: string;
};

export type CategoryDetails = {
  name: string;
  recipes: Recipe[];
  slug: string;
};

export type Ingredient = {
  amount: string;
  name: string;
};

export type RecipeDetails = {
  name: string;
  author: string;
  ingredients: Ingredient[];
  instructions: { text: string }[];
  slug: string;
  category: {
    name: string;
    slug: string;
  };
};

export type CachedData<T> = {
  data: T;
  timestamp: number;
};
