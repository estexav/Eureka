export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  unit: string;
  reorderPoint: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
}

export interface Sale {
  id: string;
  recipeId: string;
  quantity: number;
  date: string;
}

export interface AppData {
  ingredients: Ingredient[];
  recipes: Recipe[];
  sales: Sale[];
}
