import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, Category, Supplier, Tag, AppSettings, OrderItem, CompletedOrder, PendingOrder, PendingOrderItem, ManagerTag, CurrentOrderMetadata } from '@/types';
import { storage } from '@/lib/storage';
import type { StorageData } from '@/lib/storage';
import { parseDefaultData } from '@/lib/dataParser';
import { nanoid } from 'nanoid';

interface AppContextType {
  items: Item[];
  categories: Category[];
  suppliers: Supplier[];
  tags: Tag[];
  managerTags: ManagerTag[];
  settings: AppSettings;
  currentOrder: OrderItem[];
  currentOrderMetadata: CurrentOrderMetadata;
  completedOrders: CompletedOrder[];
  pendingOrders: PendingOrder[];
  
  addItem: (item: Omit<Item, 'id'>, customId?: string) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, tag: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  
  addManagerTag: (managerTag: Omit<ManagerTag, 'id'>) => void;
  updateManagerTag: (id: string, managerTag: Partial<ManagerTag>) => void;
  deleteManagerTag: (id: string) => void;
  
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  addToOrder: (item: Item, quantity: number, storeTag?: string) => void;
  updateOrderItem: (itemId: string, quantity: number, storeTag?: string) => void;
  removeFromOrder: (itemId: string, storeTag?: string) => void;
  updateOrderMetadata: (metadata: Partial<CurrentOrderMetadata>) => void;
  clearOrder: () => void;
  completeOrder: () => void;
  
  addPendingOrder: (order: Omit<PendingOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePendingOrder: (id: string, order: Partial<PendingOrder>) => void;
  deletePendingOrder: (id: string) => void;
  
  exportData: () => any;
  importData: (data: any) => void;
  loadDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [managerTags, setManagerTags] = useState<ManagerTag[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ posMode: true, autosave: true });
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [currentOrderMetadata, setCurrentOrderMetadata] = useState<CurrentOrderMetadata>({
    orderType: 'Delivery',
  });
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load data on mount
  useEffect(() => {
    const storedItems = storage.getItems();
    const storedCategories = storage.getCategories();
    const storedSuppliers = storage.getSuppliers();
    const storedTags = storage.getTags();
    const storedManagerTags = storage.getManagerTags();
    const storedSettings = storage.getSettings();
    const storedCompletedOrders = storage.getCompletedOrders();
    const storedPendingOrders = storage.getPendingOrders();
    const storedCurrentOrder = storage.getCurrentOrder();
    const storedCurrentOrderMetadata = storage.getCurrentOrderMetadata();

    if (storedItems.length > 0) {
      // Ensure Wishlist and New Item categories exist even for existing data
      const categories = [...storedCategories];
      const hasWishlist = categories.some(c => c.name === 'Wishlist');
      const hasNewItem = categories.some(c => c.name === 'New Item');
      
      if (!hasWishlist) {
        categories.push({
          id: nanoid(),
          name: 'Wishlist',
          emoji: '⭐'
        });
      }
      if (!hasNewItem) {
        categories.push({
          id: nanoid(),
          name: 'New Item',
          emoji: '🆕'
        });
      }
      
      setItems(storedItems);
      setCategories(categories);
      setSuppliers(storedSuppliers);
      setTags(storedTags);
      setManagerTags(storedManagerTags);
      setSettings(storedSettings);
      setCompletedOrders(storedCompletedOrders);
      setPendingOrders(storedPendingOrders);
      setCurrentOrder(storedCurrentOrder);
      setCurrentOrderMetadata(storedCurrentOrderMetadata);
    } else {
      // Load default data on first launch
      loadDefaultData();
    }
    setInitialized(true);
  }, []);

  // Check if autosave is enabled from settings
  const isAutosaveEnabled = () => {
    return settings.autosave !== false; // Default to true if not explicitly set to false
  };

  // Save to storage when data changes
  useEffect(() => {
    if (initialized && isAutosaveEnabled()) {
      storage.setItems(items);
    }
  }, [items, initialized]);

  useEffect(() => {
    if (initialized && isAutosaveEnabled()) {
      storage.setCategories(categories);
    }
  }, [categories, initialized]);

  useEffect(() => {
    if (initialized && isAutosaveEnabled()) {
      storage.setSuppliers(suppliers);
    }
  }, [suppliers, initialized]);

  useEffect(() => {
    if (initialized && isAutosaveEnabled()) {
      storage.setTags(tags);
    }
  }, [tags, initialized]);

  useEffect(() => {
    if (initialized) {
      // Always save settings regardless of autosave
      storage.setSettings(settings);
    }
  }, [settings, initialized]);

  useEffect(() => {
    if (initialized) {
      storage.setCompletedOrders(completedOrders);
    }
  }, [completedOrders, initialized]);

  useEffect(() => {
    if (initialized) {
      storage.setPendingOrders(pendingOrders);
    }
  }, [pendingOrders, initialized]);

  useEffect(() => {
    if (initialized) {
      storage.setManagerTags(managerTags);
    }
  }, [managerTags, initialized]);

  // Persist current order and metadata
  useEffect(() => {
    if (initialized && isAutosaveEnabled()) {
      storage.setCurrentOrder(currentOrder);
    }
  }, [currentOrder, initialized]);

  useEffect(() => {
    if (initialized && isAutosaveEnabled()) {
      storage.setCurrentOrderMetadata(currentOrderMetadata);
    }
  }, [currentOrderMetadata, initialized]);

  const loadDefaultData = async () => {
    try {
  const response = await fetch('/src/default-data-new.json');
      const data = await response.json();
      const parsed = parseDefaultData(data);
      
      // Ensure Wishlist and New Item categories exist
      const wishlistCategory: Category = {
        id: nanoid(),
        name: 'Wishlist',
        emoji: '⭐'
      };
      const newItemCategory: Category = {
        id: nanoid(),
        name: 'New Item',
        emoji: '🆕'
      };
      
      const hasWishlist = parsed.categories.some(c => c.name === 'Wishlist');
      const hasNewItem = parsed.categories.some(c => c.name === 'New Item');
      
      const categories = [...parsed.categories];
      if (!hasWishlist) categories.push(wishlistCategory);
      if (!hasNewItem) categories.push(newItemCategory);
      
      setItems(parsed.items);
      setCategories(categories);
      setSuppliers(parsed.suppliers);
    } catch (error) {
      console.error('Failed to load default data:', error);
    }
  };

  // Items
  const addItem = (item: Omit<Item, 'id'>, customId?: string) => {
    setItems(prev => [...prev, { ...item, id: customId || nanoid() }]);
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Categories
  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: nanoid() }]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  // Suppliers
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: nanoid(),
      defaultOrderType: supplier.defaultOrderType || 'Delivery',
      defaultPaymentMethod: supplier.defaultPaymentMethod || 'COD',
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(sup => sup.id === id ? { ...sup, ...updates } : sup));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(sup => sup.id !== id));
  };

  // Tags
  const addTag = (tag: Omit<Tag, 'id'>) => {
    setTags(prev => [...prev, { ...tag, id: nanoid() }]);
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags(prev => prev.map(tag => tag.id === id ? { ...tag, ...updates } : tag));
  };

  const deleteTag = (id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  };

  // Manager Tags
  const addManagerTag = (managerTag: Omit<ManagerTag, 'id'>) => {
    setManagerTags(prev => [...prev, { ...managerTag, id: nanoid() }]);
  };

  const updateManagerTag = (id: string, updates: Partial<ManagerTag>) => {
    setManagerTags(prev => prev.map(tag => tag.id === id ? { ...tag, ...updates } : tag));
  };

  const deleteManagerTag = (id: string) => {
    setManagerTags(prev => prev.filter(tag => tag.id !== id));
  };

  // Settings
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Order
  const addToOrder = (item: Item, quantity: number, storeTag?: string) => {
    setCurrentOrder(prev => {
      const existing = prev.find(oi => oi.item.id === item.id && oi.storeTag === storeTag);
      if (existing) {
        return prev.map(oi => 
          oi.item.id === item.id && oi.storeTag === storeTag
            ? { ...oi, quantity: oi.quantity + quantity }
            : oi
        );
      }
      return [...prev, { item, quantity, storeTag }];
    });
  };

  const updateOrderItem = (itemId: string, quantity: number, storeTag?: string) => {
    setCurrentOrder(prev => 
      prev.map(oi => oi.item.id === itemId && oi.storeTag === storeTag ? { ...oi, quantity } : oi)
    );
  };

  const removeFromOrder = (itemId: string, storeTag?: string) => {
    setCurrentOrder(prev => prev.filter(oi => !(oi.item.id === itemId && oi.storeTag === storeTag)));
  };

  const updateOrderMetadata = (metadata: Partial<CurrentOrderMetadata>) => {
    setCurrentOrderMetadata(prev => ({ ...prev, ...metadata }));
  };

  const clearOrder = () => {
    setCurrentOrder([]);
    setCurrentOrderMetadata({ orderType: 'Delivery' });
  };

  const completeOrder = () => {
    if (currentOrder.length === 0) return;
    
    const storeTags = Array.from(new Set(currentOrder.map(oi => oi.storeTag).filter(Boolean))) as string[];
    
    const completedOrder: CompletedOrder = {
      id: nanoid(),
      items: currentOrder,
      completedAt: new Date(),
      storeTags,
    };
    
    setCompletedOrders(prev => [...prev, completedOrder]);
    setCurrentOrder([]);
    setCurrentOrderMetadata({ orderType: 'Delivery' });
  };

  // Pending Orders
  const addPendingOrder = (order: Omit<PendingOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: PendingOrder = {
      ...order,
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPendingOrders(prev => [...prev, newOrder]);
  };

  const updatePendingOrder = (id: string, orderUpdate: Partial<PendingOrder>) => {
    setPendingOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, ...orderUpdate, updatedAt: new Date() } : order
      )
    );
  };

  const deletePendingOrder = (id: string) => {
    setPendingOrders(prev => prev.filter(order => order.id !== id));
  };

  // Import/Export
  const exportData = () => {
    return storage.exportData();
  };

  const importData = (data: StorageData) => {
    storage.importData(data);
    setItems(storage.getItems());
    setCategories(storage.getCategories());
    setSuppliers(storage.getSuppliers());
    setTags(storage.getTags());
    setManagerTags(storage.getManagerTags());
    setSettings(storage.getSettings());
    setCompletedOrders(storage.getCompletedOrders());
    setPendingOrders(storage.getPendingOrders());
  };

  return (
    <AppContext.Provider
      value={{
        items,
        categories,
        suppliers,
        tags,
        managerTags,
        settings,
        currentOrder,
        currentOrderMetadata,
        completedOrders,
        pendingOrders,
        addItem,
        updateItem,
        deleteItem,
        addCategory,
        updateCategory,
        deleteCategory,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addTag,
        updateTag,
        deleteTag,
        addManagerTag,
        updateManagerTag,
        deleteManagerTag,
        updateSettings,
        addToOrder,
        updateOrderItem,
        removeFromOrder,
        updateOrderMetadata,
        clearOrder,
        completeOrder,
        addPendingOrder,
        updatePendingOrder,
        deletePendingOrder,
        exportData,
        importData,
        loadDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
