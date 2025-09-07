'use client';

import { createContext, useState, ReactNode, useCallback } from 'react';
import { generatePurchaseList, GeneratePurchaseListOutput } from '@/ai/flows/generate-purchase-list';
import { useData } from '@/hooks/use-data';
import { useToast } from '@/hooks/use-toast';

type PurchaseListItem = GeneratePurchaseListOutput['purchaseList'][0] & {
  ingredientId: string;
  unit: string;
};

interface PurchaseListContextProps {
  purchaseList: PurchaseListItem[];
  loading: boolean;
  error: string | null;
  generatedAt: string | null;
  generateList: () => Promise<void>;
  addStock: (ingredientId: string, quantity: number) => void;
}

export const PurchaseListContext = createContext<PurchaseListContextProps | undefined>(undefined);

export function PurchaseListProvider({ children }: { children: ReactNode }) {
  const { ingredients, sales, recipes, updateIngredient } = useData();
  const { toast } = useToast();
  
  const [purchaseList, setPurchaseList] = useState<PurchaseListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const generateList = useCallback(async () => {
    setLoading(true);
    setError(null);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSales = sales.filter(s => new Date(s.date) > thirtyDaysAgo);
    
    // Create a simplified sales data string for the prompt
    const salesSummary = recentSales.reduce((acc, sale) => {
        const recipeName = recipes.find(r => r.id === sale.recipeId)?.name || 'Desconocido';
        acc[recipeName] = (acc[recipeName] || 0) + sale.quantity;
        return acc;
    }, {} as Record<string, number>);


    try {
      const result = await generatePurchaseList({
        ingredients: ingredients.map(i => ({
            name: i.name,
            stock: i.stock,
            unit: i.unit,
            reorderPoint: i.reorderPoint,
        })),
        salesData: JSON.stringify(salesSummary, null, 2),
      });

      const listWithIds = result.purchaseList.map(item => {
        const ingredient = ingredients.find(i => i.name === item.ingredientName);
        return {
          ...item,
          ingredientId: ingredient?.id || '',
          unit: ingredient?.unit || ''
        }
      }).filter(item => !!item.ingredientId); // Filter out items where ingredient wasn't found

      setPurchaseList(listWithIds);
      setGeneratedAt(new Date().toISOString());

    } catch (e) {
      console.error(e);
      setError('Ocurrió un error al generar la lista de compras. Inténtalo de nuevo.');
      toast({ title: 'Error', description: 'No se pudo generar la lista.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [ingredients, sales, recipes, toast]);

  const addStock = useCallback((ingredientId: string, quantity: number) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (ingredient) {
      updateIngredient({ ...ingredient, stock: ingredient.stock + quantity });
      // Remove from purchase list after adding stock
      setPurchaseList(prev => prev.filter(item => item.ingredientId !== ingredientId));
      toast({
        title: 'Stock Actualizado',
        description: `Se agregaron ${quantity} ${ingredient.unit} de ${ingredient.name}.`
      });
    }
  }, [ingredients, updateIngredient, toast]);

  return (
    <PurchaseListContext.Provider value={{ 
      purchaseList, 
      loading, 
      error,
      generatedAt,
      generateList, 
      addStock 
    }}>
      {children}
    </PurchaseListContext.Provider>
  );
}
