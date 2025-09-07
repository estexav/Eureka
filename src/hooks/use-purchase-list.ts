'use client';
import { useContext } from 'react';
import { PurchaseListContext } from '@/contexts/purchase-list-provider';

export const usePurchaseList = () => {
  const context = useContext(PurchaseListContext);
  if (!context) {
    throw new Error('usePurchaseList must be used within a PurchaseListProvider');
  }
  return context;
};
