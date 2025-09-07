'use client';

import { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useData } from '@/hooks/use-data';
import { useToast } from '@/hooks/use-toast';

type PurchaseListItem = {
  ingredientId: string;
  ingredientName: string;
  quantityToBuy: number;
  reason: string;
  unit: string;
};

interface PurchaseListContextProps {
  purchaseList: PurchaseListItem[];
  loading: boolean;
  generatedAt: string | null;
  addStock: (ingredientId: string, quantity: number) => void;
}

export const PurchaseListContext = createContext<PurchaseListContextProps | undefined>(undefined);

export function PurchaseListProvider({ children }: { children: ReactNode }) {
  const { ingredients, updateIngredient, isInitialized } = useData();
  const { toast } = useToast();
  
  const [purchaseList, setPurchaseList] = useState<PurchaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const calculatePurchaseList = useCallback(() => {
    if (!isInitialized) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    const lowStockIngredients = ingredients.filter(i => i.stock <= i.reorderPoint);

    const newList = lowStockIngredients.map(ingredient => {
      const quantityToBuy = Math.max(0, (ingredient.reorderPoint * 2) - ingredient.stock);
      return {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        quantityToBuy: Math.round(quantityToBuy),
        reason: `Stock actual (${ingredient.stock}) por debajo del punto de pedido (${ingredient.reorderPoint}).`,
        unit: ingredient.unit,
      };
    });

    setPurchaseList(newList);
    setGeneratedAt(new Date().toISOString());
    setLoading(false);
  }, [isInitialized, ingredients]);


  useEffect(() => {
    calculatePurchaseList();
  }, [calculatePurchaseList]);

  const addStock = useCallback((ingredientId: string, quantity: number) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (ingredient) {
      updateIngredient({ ...ingredient, stock: ingredient.stock + quantity });
      // The list will regenerate automatically via useEffect listening to `ingredients` changes
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
      generatedAt,
      addStock 
    }}>
      {children}
    </PurchaseListContext.Provider>
  );
}
