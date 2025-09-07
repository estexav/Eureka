'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Ingredient, Recipe, Sale } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  runTransaction,
  where,
  getDocs
} from 'firebase/firestore';

interface DataContextProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  sales: Sale[];
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  getIngredientName: (id: string) => string;
  getRecipeName: (id: string) => string;
  isInitialized: boolean;
}

export const DataContext = createContext<DataContextProps | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const { toast } = useToast();
  
  const ingredientsCol = collection(db, 'ingredients');
  const recipesCol = collection(db, 'recipes');
  const salesCol = collection(db, 'sales');

  useEffect(() => {
    let ingredientCount = 0;
    let recipeCount = 0;
    let salesCount = 0;
    let initTimeout: NodeJS.Timeout;

    const checkInitialized = () => {
        // This function ensures that we consider the app "initialized"
        // only after the initial data from all collections has been loaded.
        if (ingredientCount > 0 && recipeCount > 0 && salesCount >= 0) {
            setIsInitialized(true);
            clearTimeout(initTimeout);
        }
    };
    
    // Set a timeout to prevent getting stuck in a loading state
    // if a collection is empty and never fires.
    initTimeout = setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }, 5000);


    const unsubscribes = [
      onSnapshot(query(ingredientsCol, orderBy('name')), snapshot => {
        setIngredients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Ingredient)));
        ingredientCount = snapshot.size;
        checkInitialized();
      }),
      onSnapshot(query(recipesCol, orderBy('name')), snapshot => {
        setRecipes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Recipe)));
        recipeCount = snapshot.size;
        checkInitialized();
      }),
      onSnapshot(query(salesCol, orderBy('date', 'desc')), snapshot => {
        setSales(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Sale)));
        salesCount = snapshot.size;
        checkInitialized();
      }),
    ];

    return () => {
        unsubscribes.forEach(unsub => unsub());
        clearTimeout(initTimeout);
    }
  }, []);


  const addIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
    try {
      await addDoc(ingredientsCol, ingredient);
      toast({ title: 'Éxito', description: 'Ingrediente agregado.' });
    } catch (error) {
      console.error("Error adding ingredient: ", error);
      toast({ title: 'Error', description: 'No se pudo agregar el ingrediente.', variant: 'destructive' });
    }
  };

  const updateIngredient = async (updatedIngredient: Ingredient) => {
    try {
      const { id, ...data } = updatedIngredient;
      await updateDoc(doc(db, 'ingredients', id), data);
      // toast({ title: 'Éxito', description: 'Ingrediente actualizado.' });
    } catch (error) {
       console.error("Error updating ingredient: ", error);
       toast({ title: 'Error', description: 'No se pudo actualizar el ingrediente.', variant: 'destructive' });
    }
  };

  const deleteIngredient = async (id: string) => {
    const isUsedInRecipes = recipes.some(recipe => 
      recipe.ingredients.some(ing => ing.ingredientId === id)
    );

    if (isUsedInRecipes) {
      toast({
        title: 'Error',
        description: 'No se puede eliminar un ingrediente que se está usando en una receta.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'ingredients', id));
      toast({ title: 'Éxito', description: 'Ingrediente eliminado.' });
    } catch (error) {
      console.error("Error deleting ingredient: ", error);
      toast({ title: 'Error', description: 'No se pudo eliminar el ingrediente.', variant: 'destructive' });
    }
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
     try {
      await addDoc(recipesCol, recipe);
      toast({ title: 'Éxito', description: 'Receta agregada.' });
    } catch (error) {
      console.error("Error adding recipe: ", error);
      toast({ title: 'Error', description: 'No se pudo agregar la receta.', variant: 'destructive' });
    }
  };

  const updateRecipe = async (updatedRecipe: Recipe) => {
    try {
      const { id, ...data } = updatedRecipe;
      await updateDoc(doc(db, 'recipes', id), data);
      toast({ title: 'Éxito', description: 'Receta actualizada.' });
    } catch (error) {
      console.error("Error updating recipe: ", error);
      toast({ title: 'Error', description: 'No se pudo actualizar la receta.', variant: 'destructive' });
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'recipes', id));
      toast({ title: 'Éxito', description: 'Receta eliminada.' });
    } catch(error) {
       console.error("Error deleting recipe: ", error);
       toast({ title: 'Error', description: 'No se pudo eliminar la receta.', variant: 'destructive' });
    }
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'date'>) => {
    const recipe = recipes.find(r => r.id === sale.recipeId);
    if (!recipe) {
      toast({ title: 'Error', description: 'Receta no encontrada.', variant: 'destructive' });
      return;
    }
  
    try {
      await runTransaction(db, async (transaction) => {
        const ingredientUpdates: {docRef: any, newStock: number}[] = [];
        
        for (const recipeIngredient of recipe.ingredients) {
          const ingredientDocRef = doc(db, 'ingredients', recipeIngredient.ingredientId);
          const ingredientDoc = await transaction.get(ingredientDocRef);
          
          if (!ingredientDoc.exists()) {
            throw new Error(`Ingrediente con ID ${recipeIngredient.ingredientId} no encontrado.`);
          }
          
          const currentStock = ingredientDoc.data().stock;
          const requiredStock = recipeIngredient.quantity * sale.quantity;
          
          if (currentStock < requiredStock) {
            throw new Error(`Stock insuficiente para ${ingredientDoc.data().name}.`);
          }
          
          ingredientUpdates.push({
            docRef: ingredientDocRef,
            newStock: currentStock - requiredStock
          });
        }
  
        ingredientUpdates.forEach(update => {
          transaction.update(update.docRef, { stock: update.newStock });
        });
  
        const saleWithDate = {
          ...sale,
          date: new Date().toISOString(),
        };
        transaction.set(doc(salesCol), saleWithDate);
      });
  
      toast({
        title: 'Venta registrada',
        description: `Se vendieron ${sale.quantity} de ${recipe.name}. Stock actualizado.`,
      });
    } catch (e: any) {
      console.error('Error en la transacción de venta: ', e);
      toast({
        title: 'Error en la Venta',
        description: e.message || 'No se pudo completar la transacción.',
        variant: 'destructive',
      });
    }
  };
  
  const getIngredientName = useCallback((id: string) => ingredients.find(i => i.id === id)?.name || 'Desconocido', [ingredients]);
  const getRecipeName = useCallback((id: string) => recipes.find(r => r.id === id)?.name || 'Desconocido', [recipes]);

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
      isInitialized
    }}>
      {children}
    </DataContext.Provider>
  );
}
