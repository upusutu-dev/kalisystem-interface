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
};

const STORAGE_KEYS = {
  ITEMS: 'tagcreator_items',
  CATEGORIES: 'tagcreator_categories',
  SUPPLIERS: 'tagcreator_suppliers',
  STORES: 'tagcreator_stores',
  TAGS: 'tagcreator_tags',
  SETTINGS: 'tagcreator_settings',
  COMPLETED_ORDERS: 'tagcreator_completed_orders',
  PENDING_ORDERS: 'tagcreator_pending_orders',
  MANAGER_TAGS: 'tagcreator_manager_tags',
  CURRENT_ORDER: 'tagcreator_current_order',
  CURRENT_ORDER_METADATA: 'tagcreator_current_order_metadata',
};

class StorageManager {
  private cache: Map<string, any> = new Map();

  // Generic get/set with cache
  private get<T>(key: string, defaultValue: T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    try {
      const data = localStorage.getItem(key);
      const parsed = data ? JSON.parse(data) : defaultValue;
      this.cache.set(key, parsed);
      return parsed;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    this.cache.set(key, value);
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Items
  getItems(): Item[] {
    return this.get<Item[]>(STORAGE_KEYS.ITEMS, []);
  }

  setItems(items: Item[]): void {
    this.set(STORAGE_KEYS.ITEMS, items);
  }

  // Categories
  getCategories(): Category[] {
    return this.get<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  }

  setCategories(categories: Category[]): void {
    this.set(STORAGE_KEYS.CATEGORIES, categories);
  }

  // Suppliers
  getSuppliers(): Supplier[] {
    return this.get<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
  }

  setSuppliers(suppliers: Supplier[]): void {
    this.set(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  // Stores
  getStores(): Store[] {
    return this.get<Store[]>(STORAGE_KEYS.STORES, []);
  }

  setStores(stores: Store[]): void {
    this.set(STORAGE_KEYS.STORES, stores);
  }

  // Tags
  getTags(): Tag[] {
    return this.get<Tag[]>(STORAGE_KEYS.TAGS, []);
  }

  setTags(tags: Tag[]): void {
    this.set(STORAGE_KEYS.TAGS, tags);
  }

  // Settings
  getSettings(): AppSettings {
    return this.get<AppSettings>(STORAGE_KEYS.SETTINGS, { posMode: true });
  }

  setSettings(settings: AppSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  // Completed Orders
  getCompletedOrders(): CompletedOrder[] {
    return this.get<CompletedOrder[]>(STORAGE_KEYS.COMPLETED_ORDERS, []);
  }

  setCompletedOrders(orders: CompletedOrder[]): void {
    this.set(STORAGE_KEYS.COMPLETED_ORDERS, orders);
  }

  // Pending Orders
  getPendingOrders(): PendingOrder[] {
    return this.get<PendingOrder[]>(STORAGE_KEYS.PENDING_ORDERS, []);
  }

  setPendingOrders(orders: PendingOrder[]): void {
    this.set(STORAGE_KEYS.PENDING_ORDERS, orders);
  }

  // Manager Tags
  getManagerTags(): ManagerTag[] {
    return this.get<ManagerTag[]>(STORAGE_KEYS.MANAGER_TAGS, []);
  }

  setManagerTags(managerTags: ManagerTag[]): void {
    this.set(STORAGE_KEYS.MANAGER_TAGS, managerTags);
  }

  // Current Order
  getCurrentOrder(): OrderItem[] {
    return this.get<OrderItem[]>(STORAGE_KEYS.CURRENT_ORDER, []);
  }

  setCurrentOrder(order: OrderItem[]): void {
    this.set(STORAGE_KEYS.CURRENT_ORDER, order);
  }

  // Current Order Metadata
  getCurrentOrderMetadata(): CurrentOrderMetadata {
    return this.get<CurrentOrderMetadata>(STORAGE_KEYS.CURRENT_ORDER_METADATA, { orderType: 'Delivery' });
  }

  setCurrentOrderMetadata(metadata: CurrentOrderMetadata): void {
    this.set(STORAGE_KEYS.CURRENT_ORDER_METADATA, metadata);
  }

  public exportData() {
    return {
      items: this.getItems(),
      categories: this.getCategories(),
      suppliers: this.getSuppliers(),
      stores: this.getStores(),
      tags: this.getTags(),
      settings: this.getSettings(),
    };
  }

  // Import all data
  importData(data: StorageData): void {
    if (data.items) this.setItems(data.items);
    if (data.categories) this.setCategories(data.categories);
    if (data.suppliers) this.setSuppliers(data.suppliers);
    if (data.stores) this.setStores(data.stores);
    if (data.tags) this.setTags(data.tags);
    if (data.settings) this.setSettings(data.settings);
    if (data.completedOrders) this.setCompletedOrders(data.completedOrders);
    if (data.pendingOrders) this.setPendingOrders(data.pendingOrders);
    if (data.managerTags) this.setManagerTags(data.managerTags);
    this.cache.clear(); // Clear cache to force refresh
  }

  // Clear all data
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    this.cache.clear();
  }
}

export const storage = new StorageManager();
