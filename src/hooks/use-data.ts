'use client';
import { useContext } from 'react';
import { DataContext } from '@/contexts/data-provider';

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
