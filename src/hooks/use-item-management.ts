import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import type { Item, Category, Supplier } from '@/types';

interface NewItemData {
  name: string;
  category: string;
  supplier: string;
  tags?: string[];
}

interface NewCategoryData {
  name: string;
  emoji: string;
  parentCategory?: string;
}

interface NewSupplierData {
  name: string;
}

export function useItemManagement() {
  const { addItem, addCategory, addSupplier } = useApp();
  
  const handleAddItem = (data: NewItemData, onSuccess?: () => void, customId?: string) => {
    if (!data.name.trim()) {
      toast.error('Please enter item name');
      return false;
    }
    addItem({
      name: data.name,
      category: data.category,
      supplier: data.supplier,
      tags: data.tags || []
    }, customId);
    toast.success('Item added successfully');
    onSuccess?.();
    return true;
  };

  const handleAddCategory = (data: NewCategoryData, onSuccess?: () => void) => {
    if (!data.name.trim()) {
      toast.error('Please enter category name');
      return false;
    }
    addCategory({
      name: data.name,
      emoji: data.emoji || '📁'
    });
    toast.success('Category added successfully');
    onSuccess?.();
    return true;
  };

  const handleAddSupplier = (data: NewSupplierData, onSuccess?: () => void) => {
    if (!data.name.trim()) {
      toast.error('Please enter supplier name');
      return false;
    }
    addSupplier({
      name: data.name,
    });
    toast.success('Supplier added successfully');
    onSuccess?.();
    return true;
  };

  return {
    handleAddItem,
    handleAddCategory,
    handleAddSupplier
  };
}