import type { Ingredient, Recipe, Sale } from './types';

// Data is now fetched from Firestore, these initial constants are no longer primary.
// They can be used for first-time seeding if necessary, but the app relies on the database.

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Harina', stock: 5000, unit: 'g', reorderPoint: 1000 },
  { id: '2', name: 'Azúcar', stock: 3000, unit: 'g', reorderPoint: 500 },
  { id: '3', name: 'Huevos', stock: 60, unit: 'unidades', reorderPoint: 12 },
  { id: '4', name: 'Leche', stock: 4000, unit: 'ml', reorderPoint: 1000 },
  { id: '5', name: 'Mantequilla', stock: 1000, unit: 'g', reorderPoint: 250 },
  { id: '6', name: 'Chocolate', stock: 800, unit: 'g', reorderPoint: 200 },
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Pastel de Chocolate',
    ingredients: [
      { ingredientId: '1', quantity: 300 },
      { ingredientId: '2', quantity: 200 },
      { ingredientId: '3', quantity: 4 },
      { ingredientId: '4', quantity: 200 },
      { ingredientId: '5', quantity: 150 },
      { ingredientId: '6', quantity: 100 },
    ],
  },
  {
    id: '2',
    name: 'Galletas de Mantequilla',
    ingredients: [
      { ingredientId: '1', quantity: 250 },
      { ingredientId: '2', quantity: 100 },
      { ingredientId: '3', quantity: 1 },
      { ingredientId: '5', quantity: 150 },
    ],
  },
];

export const INITIAL_SALES: Sale[] = [];
