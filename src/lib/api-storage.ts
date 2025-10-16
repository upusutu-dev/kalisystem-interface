import { Item, Category, Supplier, Store, Tag, AppSettings, CompletedOrder, PendingOrder, ManagerTag, OrderItem, CurrentOrderMetadata } from '@/types';

export type StorageData = {
  items?: Item[];
  categories?: Category[];
  suppliers?: Supplier[];
  stores?: Store[];
  tags?: Tag[];
  settings?: AppSettings;
  completedOrders?: CompletedOrder[];
  pendingOrders?: PendingOrder[];
  managerTags?: ManagerTag[];
  currentOrder?: OrderItem[];
  currentOrderMetadata?: CurrentOrderMetadata;
};

// API endpoint - use same host in production, localhost:3001 in development
const API_URL = import.meta.env.PROD 
  ? `${window.location.protocol}//${window.location.host}`
  : 'http://localhost:3001';

class ApiStorageManager {
  private cache: Map<string, any> = new Map();
  private pendingSaves: Map<string, NodeJS.Timeout> = new Map();

  // Generic fetch from API
  private async fetch<T>(type: string, defaultValue: T): Promise<T> {
    if (this.cache.has(type)) {
      return this.cache.get(type);
    }

    try {
      const response = await fetch(`${API_URL}/api/data/${type}`);
      if (!response.ok) {
        console.error(`Failed to fetch ${type}:`, response.statusText);
        return defaultValue;
      }
      const data = await response.json();
      this.cache.set(type, data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      return defaultValue;
    }
  }

  // Generic save to API with debouncing
  private async save<T>(type: string, value: T): Promise<void> {
    this.cache.set(type, value);

    // Clear existing pending save
    const existing = this.pendingSaves.get(type);
    if (existing) {
      clearTimeout(existing);
    }

    // Debounce saves (wait 500ms after last change)
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/api/data/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });
        
        if (!response.ok) {
          console.error(`Failed to save ${type}:`, response.statusText);
        }
        
        this.pendingSaves.delete(type);
      } catch (error) {
        console.error(`Error saving ${type}:`, error);
      }
    }, 500);

    this.pendingSaves.set(type, timeout);
  }

  // Items
  async getItems(): Promise<Item[]> {
    return this.fetch<Item[]>('items', []);
  }

  async setItems(items: Item[]): Promise<void> {
    await this.save('items', items);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.fetch<Category[]>('categories', []);
  }

  async setCategories(categories: Category[]): Promise<void> {
    await this.save('categories', categories);
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return this.fetch<Supplier[]>('suppliers', []);
  }

  async setSuppliers(suppliers: Supplier[]): Promise<void> {
    await this.save('suppliers', suppliers);
  }

  // Stores
  async getStores(): Promise<Store[]> {
    return this.fetch<Store[]>('stores', []);
  }

  async setStores(stores: Store[]): Promise<void> {
    await this.save('stores', stores);
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return this.fetch<Tag[]>('tags', []);
  }

  async setTags(tags: Tag[]): Promise<void> {
    await this.save('tags', tags);
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    return this.fetch<AppSettings>('settings', { posMode: true });
  }

  async setSettings(settings: AppSettings): Promise<void> {
    await this.save('settings', settings);
  }

  // Completed Orders
  async getCompletedOrders(): Promise<CompletedOrder[]> {
    return this.fetch<CompletedOrder[]>('completedOrders', []);
  }

  async setCompletedOrders(orders: CompletedOrder[]): Promise<void> {
    await this.save('completedOrders', orders);
  }

  // Pending Orders
  async getPendingOrders(): Promise<PendingOrder[]> {
    return this.fetch<PendingOrder[]>('pendingOrders', []);
  }

  async setPendingOrders(orders: PendingOrder[]): Promise<void> {
    await this.save('pendingOrders', orders);
  }

  // Manager Tags
  async getManagerTags(): Promise<ManagerTag[]> {
    return this.fetch<ManagerTag[]>('managerTags', []);
  }

  async setManagerTags(managerTags: ManagerTag[]): Promise<void> {
    await this.save('managerTags', managerTags);
  }

  // Current Order
  async getCurrentOrder(): Promise<OrderItem[]> {
    return this.fetch<OrderItem[]>('currentOrder', []);
  }

  async setCurrentOrder(order: OrderItem[]): Promise<void> {
    await this.save('currentOrder', order);
  }

  // Current Order Metadata
  async getCurrentOrderMetadata(): Promise<CurrentOrderMetadata> {
    return this.fetch<CurrentOrderMetadata>('currentOrderMetadata', { orderType: 'Delivery' });
  }

  async setCurrentOrderMetadata(metadata: CurrentOrderMetadata): Promise<void> {
    await this.save('currentOrderMetadata', metadata);
  }

  // Export all data
  async exportData(): Promise<StorageData> {
    try {
      const response = await fetch(`${API_URL}/api/export`);
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Import all data
  async importData(data: StorageData): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to import data');
      }
      
      this.cache.clear();
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    this.cache.clear();
    this.pendingSaves.clear();
  }

  // Check if API is available
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiStorage = new ApiStorageManager();
