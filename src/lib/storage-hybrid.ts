import { Item, Category, Supplier, Store, Tag, AppSettings, CompletedOrder, PendingOrder, ManagerTag, OrderItem, CurrentOrderMetadata } from '@/types';
import { storage as localStorageManager } from './storage';
import { apiStorage } from './api-storage';

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

class HybridStorageManager {
  private useApi: boolean = false;
  private healthCheckDone: boolean = false;

  // Check if API is available
  private async ensureApiAvailable(): Promise<boolean> {
    if (this.healthCheckDone) {
      return this.useApi;
    }

    this.healthCheckDone = true;
    this.useApi = await apiStorage.checkHealth();
    console.log(`Storage mode: ${this.useApi ? 'API' : 'localStorage'}`);
    return this.useApi;
  }

  // Items
  getItems(): Item[] {
    this.ensureApiAvailable().then(useApi => {
      if (useApi) {
        apiStorage.getItems().then(items => {
          // Update cache
        });
      }
    });
    return localStorageManager.getItems();
  }

  setItems(items: Item[]): void {
    localStorageManager.setItems(items);
    this.ensureApiAvailable().then(useApi => {
      if (useApi) apiStorage.setItems(items);
    });
  }

  // Categories
  getCategories(): Category[] {
    this.ensureApiAvailable().then(useApi => {
      if (useApi) {
        apiStorage.getCategories().then(categories => {
          // Update cache
        });
      }
    });
    return localStorageManager.getCategories();
  }

  setCategories(categories: Category[]): void {
    localStorageManager.setCategories(categories);
    this.ensureApiAvailable().then(useApi => {
      if (useApi) apiStorage.setCategories(categories);
    });
  }

  // Suppliers
  getSuppliers(): Supplier[] {
    this.ensureApiAvailable().then(useApi => {
      if (useApi) {
        apiStorage.getSuppliers().then(suppliers => {
          // Update cache
        });
      }
    });
    return localStorageManager.getSuppliers();
  }

  setSuppliers(suppliers: Supplier[]): void {
    localStorageManager.setSuppliers(suppliers);
    this.ensureApiAvailable().then(useApi => {
      if (useApi) apiStorage.setSuppliers(suppliers);
    });
  }

  // Tags
  getTags(): Tag[] {
    this.ensureApiAvailable().then(useApi => {
      if (useApi) {
        apiStorage.getTags().then(tags => {
          // Update cache
        });
      }
    });
    return localStorageManager.getTags();
  }

  setTags(tags: Tag[]): void {
    localStorageManager.setTags(tags);
    this.ensureApiAvailable().then(useApi => {
      if (useApi) apiStorage.setTags(tags);
    });
  }

  // Settings
  getSettings(): AppSettings {
    return localStorageManager.getSettings();
  }

  setSettings(settings: AppSettings): void {
    localStorageManager.setSettings(settings);
    this.ensureApiAvailable().then(useApi => {
      if (useApi) apiStorage.setSettings(settings);
    });
  }

  // Completed Orders
  getCompletedOrders(): CompletedOrder[] {
    return localStorageManager.getCompletedOrders();
  }

  setCompletedOrders(orders: CompletedOrder[]): void {
    localStorageManager.setCompletedOrders(orders);
    this.ensureApiAvailable().then(useApi => {
      if (useApi) apiStorage.setCompletedOrders(orders);
    });
  }

  // Pending Orders
  getPendingOrders(): PendingOrder[] {
    return localStorageManager.getPendingOrders();
  }

  setPendingOrders(orders: PendingOrder[]): void {
    localStorageManager.setPendingOrders(orders);
    this.ensureApiAvailable().then(useApi => {
      if (useApi) apiStorage.setPendingOrders(orders);
    });
  }

  // Manager Tags
  getManagerTags(): ManagerTag[] {
    return localStorageManager.getManagerTags();
  }

  setManagerTags(managerTags: ManagerTag[]): void {
    localStorageManager.setManagerTags(managerTags);
    this.ensureApiAvailable().then(useApi => {
      if (useApi) apiStorage.setManagerTags(managerTags);
    });
  }

  // Current Order
  getCurrentOrder(): OrderItem[] {
    return localStorageManager.getCurrentOrder();
  }

  setCurrentOrder(order: OrderItem[]): void {
    localStorageManager.setCurrentOrder(order);
    this.ensureApiAvailable().then(useApi => {
      if (useApi) apiStorage.setCurrentOrder(order);
    });
  }

  // Current Order Metadata
  getCurrentOrderMetadata(): CurrentOrderMetadata {
    return localStorageManager.getCurrentOrderMetadata();
  }

  setCurrentOrderMetadata(metadata: CurrentOrderMetadata): void {
    localStorageManager.setCurrentOrderMetadata(metadata);
    this.ensureApiAvailable().then(useApi => {
      if (useApi) apiStorage.setCurrentOrderMetadata(metadata);
    });
  }

  // Export
  exportData() {
    return localStorageManager.exportData();
  }

  // Import
  importData(data: StorageData): void {
    localStorageManager.importData(data);
    this.ensureApiAvailable().then(useApi => {
      if (useApi) apiStorage.importData(data);
    });
  }

  // Clear all
  clearAll(): void {
    localStorageManager.clearAll();
    this.ensureApiAvailable().then(useApi => {
      if (useApi) apiStorage.clearAll();
    });
  }
}

export const storage = new HybridStorageManager();
