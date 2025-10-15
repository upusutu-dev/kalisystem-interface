import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, Supplier, StoreTag, STORE_TAGS } from '@/types';
import { storage } from '@/lib/storage';
import { nanoid } from 'nanoid';

interface CoreDataContextType {
  // Core data
  items: Item[];
  suppliers: Supplier[];
  storeTags: StoreTag[];
  
  // Item operations
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  
  // Supplier operations
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // Store tag operations
  isValidStoreTag: (tag: string) => tag is StoreTag;
  getDefaultStoreTag: () => StoreTag;
}

const CoreDataContext = createContext<CoreDataContextType | undefined>(undefined);

export function CoreDataProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  // Load initial data
  useEffect(() => {
    const storedItems = storage.getItems();
    const storedSuppliers = storage.getSuppliers();
    
    if (storedItems) setItems(storedItems);
    if (storedSuppliers) setSuppliers(storedSuppliers);
  }, []);
  
  // Persist changes
  useEffect(() => {
    storage.setItems(items);
  }, [items]);
  
  useEffect(() => {
    storage.setSuppliers(suppliers);
  }, [suppliers]);
  
  const addItem = (item: Omit<Item, 'id'>) => {
    const newItem = { ...item, id: nanoid() };
    setItems(prev => [...prev, newItem]);
  };
  
  const updateItem = (id: string, itemUpdate: Partial<Item>) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...itemUpdate } : item
      )
    );
  };
  
  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = { ...supplier, id: nanoid() };
    setSuppliers(prev => [...prev, newSupplier]);
  };
  
  const updateSupplier = (id: string, supplierUpdate: Partial<Supplier>) => {
    setSuppliers(prev => 
      prev.map(supplier => 
        supplier.id === id ? { ...supplier, ...supplierUpdate } : supplier
      )
    );
  };
  
  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
  };
  
  const isValidStoreTag = (tag: string): tag is StoreTag => {
    return STORE_TAGS.includes(tag as StoreTag);
  };
  
  const getDefaultStoreTag = (): StoreTag => STORE_TAGS[0];
  
  const value = {
    items,
    suppliers,
    storeTags: STORE_TAGS,
    addItem,
    updateItem,
    deleteItem,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    isValidStoreTag,
    getDefaultStoreTag,
  };
  
  return (
    <CoreDataContext.Provider value={value}>
      {children}
    </CoreDataContext.Provider>
  );
}

export function useCoreData() {
  const context = useContext(CoreDataContext);
  if (context === undefined) {
    throw new Error('useCoreData must be used within a CoreDataProvider');
  }
  return context;
}