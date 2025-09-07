'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Ingredient, Recipe, Sale, AppData, RecipeIngredient } from '@/lib/types';
import { INITIAL_INGREDIENTS, INITIAL_RECIPES, INITIAL_SALES, LOCAL_STORAGE_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface DataContextProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  sales: Sale[];
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  getIngredientName: (id: string) => string;
  getRecipeName: (id: string) => string;
  importData: (data: AppData) => void;
  isInitialized: boolean;
}

export const DataContext = createContext<DataContextProps | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData: AppData = JSON.parse(savedData);
        setIngredients(parsedData.ingredients || []);
        setRecipes(parsedData.recipes || []);
        setSales(parsedData.sales || []);
      } else {
        // First time load, set initial data
        setIngredients(INITIAL_INGREDIENTS);
        setRecipes(INITIAL_RECIPES);
        setSales(INITIAL_SALES);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos. Se usará la configuración inicial.',
        variant: 'destructive',
      });
      setIngredients(INITIAL_INGREDIENTS);
      setRecipes(INITIAL_RECIPES);
      setSales(INITIAL_SALES);
    }
    setIsInitialized(true);
  }, [toast]);

  useEffect(() => {
    if (isInitialized) {
      try {
        const dataToSave: AppData = { ingredients, recipes, sales };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Failed to save data to localStorage', error);
         toast({
          title: 'Error',
          description: 'No se pudieron guardar los datos en el navegador.',
          variant: 'destructive',
        });
      }
    }
  }, [ingredients, recipes, sales, isInitialized, toast]);

  const addIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    setIngredients(prev => [...prev, { ...ingredient, id: Date.now().toString() }]);
  };

  const updateIngredient = (updatedIngredient: Ingredient) => {
    setIngredients(prev => prev.map(ing => ing.id === updatedIngredient.id ? updatedIngredient : ing));
  };

  const deleteIngredient = (id: string) => {
    // Check if ingredient is used in any recipe
    const isUsed = recipes.some(recipe => recipe.ingredients.some(ing => ing.ingredientId === id));
    if (isUsed) {
      toast({
        title: 'Error',
        description: 'No se puede eliminar un ingrediente que se está usando en una receta.',
        variant: 'destructive',
      });
      return;
    }
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const addRecipe = (recipe: Omit<Recipe, 'id'>) => {
    setRecipes(prev => [...prev, { ...recipe, id: Date.now().toString() }]);
  };

  const updateRecipe = (updatedRecipe: Recipe) => {
    setRecipes(prev => prev.map(rec => rec.id === updatedRecipe.id ? updatedRecipe : rec));
  };

  const deleteRecipe = (id: string) => {
    // Check if recipe is used in any sale
    const isUsed = sales.some(sale => sale.recipeId === id);
    if(isUsed) {
      toast({
        title: 'Error',
        description: 'No se puede eliminar una receta con ventas registradas.',
        variant: 'destructive'
      });
      return;
    }
    setRecipes(prev => prev.filter(rec => rec.id !== id));
  };

  const addSale = (sale: Omit<Sale, 'id' | 'date'>) => {
    const recipe = recipes.find(r => r.id === sale.recipeId);
    if (!recipe) {
      toast({ title: 'Error', description: 'Receta no encontrada.', variant: 'destructive'});
      return;
    }

    const updatedIngredients = [...ingredients];
    let canFulfill = true;

    recipe.ingredients.forEach((recipeIngredient: RecipeIngredient) => {
      const stockIngredient = updatedIngredients.find(i => i.id === recipeIngredient.ingredientId);
      if (!stockIngredient || stockIngredient.stock < recipeIngredient.quantity * sale.quantity) {
        canFulfill = false;
        toast({
          title: 'Stock insuficiente',
          description: `No hay suficiente ${stockIngredient?.name || 'ingrediente'} para completar la venta.`,
          variant: 'destructive',
        });
      }
    });

    if (canFulfill) {
      recipe.ingredients.forEach((recipeIngredient: RecipeIngredient) => {
        const stockIngredientIndex = updatedIngredients.findIndex(i => i.id === recipeIngredient.ingredientId);
        if (stockIngredientIndex > -1) {
          updatedIngredients[stockIngredientIndex].stock -= recipeIngredient.quantity * sale.quantity;
        }
      });
      setIngredients(updatedIngredients);
      setSales(prev => [...prev, { ...sale, id: Date.now().toString(), date: new Date().toISOString() }]);
      toast({
        title: 'Venta registrada',
        description: `Se vendieron ${sale.quantity} de ${recipe.name}. Stock actualizado.`,
      });
    }
  };
  
  const getIngredientName = useCallback((id: string) => ingredients.find(i => i.id === id)?.name || 'Desconocido', [ingredients]);
  const getRecipeName = useCallback((id: string) => recipes.find(r => r.id === id)?.name || 'Desconocido', [recipes]);

  const importData = (data: AppData) => {
    setIngredients(data.ingredients || []);
    setRecipes(data.recipes || []);
    setSales(data.sales || []);
    toast({ title: 'Éxito', description: 'Datos importados correctamente.' });
  };


  return (
    <DataContext.Provider value={{ 
      ingredients, 
      recipes, 
      sales, 
      addIngredient, 
      updateIngredient,
      deleteIngredient,
      addRecipe,
      updateRecipe,
      deleteRecipe, 
      addSale,
      getIngredientName,
      getRecipeName,
      importData,
      isInitialized
    }}>
      {children}
    </DataContext.Provider>
  );
}
