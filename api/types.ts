export type Category = {
  name: string;
  slug: string;
  updated_at: number;
};

export type Ingredient = {
  amount: string;
  name: string;
};

export type Instruction = {
  text: string;
};

export type Recipe = {
  author: string;
  category_slug: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  name: string;
  slug: string;
  updated_at: number;
};
