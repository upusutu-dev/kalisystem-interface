import { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { parseQuickOrder } from '@/lib/dataParser';
import { useLocation } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { PAYMENT_TAGS, ORDER_TYPE_TAGS, UNIT_TAGS } from '@/constants/tags';
import { CATEGORY_GROUPS, GROUP_HIERARCHY } from '@/utils/categoryGroups';
import { SupplierForm } from '@/components/forms/SupplierForm';
import { ItemForm } from '@/components/forms/ItemForm';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { GroupCard } from '@/components/cards/GroupCard';
import { SupplierCard } from '@/components/cards/SupplierCard';
import { ItemCard } from '@/components/cards/ItemCard';
import type { SupplierFormData, ItemFormData, CategoryFormData } from '@/types/forms';
import { STORE_TAGS, StoreTag } from '@/types';

import { useNavigate } from 'react-router-dom';

export default function Items() {
  const navigate = useNavigate();
  const { items, categories, suppliers, addToOrder, updateItem, settings, updateSettings, addCategory, addItem } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<'category' | 'supplier'>('category');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [enabledGroups, setEnabledGroups] = useState<Set<string>>(new Set(['Food', 'Beverages', 'Households']));
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({
    name: '',
    contact: '',
    defaultPaymentMethod: 'COD',
    defaultOrderType: 'Delivery',
  });
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    parentCategory: '',
    emoji: '📁',
  });
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [pendingOrderItem, setPendingOrderItem] = useState<{ item: typeof items[0], quantity: number } | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreTag>(STORE_TAGS[0]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastNonNumericFilteredItems = useRef<typeof items>([]);
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const groupBy = urlParams.get('groupBy') as 'category' | 'supplier' | null;

  const getVisibleCategories = useMemo(() => {
    const visible = new Set<string>(['New Item', 'Wishlist']);
    
    enabledGroups.forEach(mainGroup => {
      const subGroups = GROUP_HIERARCHY[mainGroup as keyof typeof GROUP_HIERARCHY] || [];
      subGroups.forEach(subGroup => {
        const cats = CATEGORY_GROUPS[subGroup as keyof typeof CATEGORY_GROUPS] || [];
        cats.forEach(cat => visible.add(cat));
      });
    });
    
    return visible;
  }, [enabledGroups]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      
      if (groupBy === 'category' && enabledGroups.size < 3) {
        const isCategoryVisible = getVisibleCategories.has(item.category);
        if (!isCategoryVisible) return false;
      }
      
      if (filterMode === 'category') {
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
        return matchesSearch && matchesCategory;
      } else {
        const matchesSupplier = selectedSuppliers.length === 0 || selectedSuppliers.includes(item.supplier);
        return matchesSearch && matchesSupplier;
      }
    });
  }, [items, search, selectedCategories, selectedSuppliers, filterMode, groupBy, enabledGroups, getVisibleCategories]);

  // Add groupedItems useMemo for groupBy
  const groupedItems = useMemo(() => {
    if (!groupBy) return null;
    const groups: Record<string, typeof items> = {};
    filteredItems.forEach(item => {
      const key = groupBy === 'category' ? item.category : item.supplier;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [filteredItems, groupBy]);

  useEffect(() => {
    const isNumericOnly = /^\d+$/.test(search);
    if (!isNumericOnly) {
      lastNonNumericFilteredItems.current = filteredItems;
    }
  }, [filteredItems, search]);

  const handleQuickAdd = (item: typeof items[0]) => {
    if (settings.posMode) {
      setPendingOrderItem({ item, quantity: 1 });
      setStoreDialogOpen(true);
    } else {
      if (item.category !== 'Wishlist') {
        updateItem(item.id, { category: 'Wishlist' });
        toast.success(`Added ${item.name} to wishlist`);
      } else {
        toast.info(`${item.name} is already in wishlist`);
      }
    }
  };

  const confirmAddToOrder = () => {
    if (pendingOrderItem) {
      addToOrder(pendingOrderItem.item, pendingOrderItem.quantity, selectedStore);
      toast.success(`Added ${pendingOrderItem.item.name} to ${selectedStore.toUpperCase()} order`);
      setStoreDialogOpen(false);
      setPendingOrderItem(null);
    }
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleSupplierToggle = (supplierName: string) => {
    setSelectedSuppliers(prev =>
      prev.includes(supplierName)
        ? prev.filter(s => s !== supplierName)
        : [...prev, supplierName]
    );
  };

  const toggleMainGroup = (group: string) => {
    setEnabledGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  };

  const handleAddCategory = () => {
    if (!newCategoryData.name.trim()) {
      toast.error('Please enter category name');
      return;
    }
    addCategory({
      name: newCategoryData.name,
      emoji: newCategoryData.emoji,
    });
    toast.success('Category added successfully');
    setIsNewCategoryOpen(false);
    setNewCategoryData({
      name: '',
      parentCategory: '',
      emoji: '📁',
    });
  };

  const parentCategories = Object.keys(CATEGORY_GROUPS);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      const justNumberMatch = search.match(/^\d+$/);
      if (justNumberMatch) {
        const qty = parseInt(justNumberMatch[0], 10);
        const itemsToUse = lastNonNumericFilteredItems.current;
        
        if (itemsToUse.length > 0) {
          const item = itemsToUse[0];
          setPendingOrderItem({ item, quantity: qty });
          setStoreDialogOpen(true);
          setSearch('');
          setTimeout(() => searchInputRef.current?.select(), 0);
        }
        return;
      }

      const parsed = parseQuickOrder(search, items);
      if (parsed) {
        setPendingOrderItem({ item: parsed.item, quantity: parsed.quantity });
        setStoreDialogOpen(true);
        setSearch('');
        setTimeout(() => searchInputRef.current?.select(), 0);
        return;
      }

      if (filteredItems.length > 0) {
        setPendingOrderItem({ item: filteredItems[0], quantity: 1 });
        setStoreDialogOpen(true);
        setSearch('');
        setTimeout(() => searchInputRef.current?.select(), 0);
      }
    }
  };

  const getFilterLabel = () => {
    if (filterMode === 'category') {
      if (selectedCategories.length === 0) return 'All Categories';
      if (selectedCategories.length === 1) return selectedCategories[0];
      return `${selectedCategories.length} categories`;
    } else {
      if (selectedSuppliers.length === 0) return 'All Suppliers';
      if (selectedSuppliers.length === 1) return selectedSuppliers[0];
      return `${selectedSuppliers.length} suppliers`;
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full p-2 bg-accent hover:bg-accent/80 active:bg-accent/60 text-accent-foreground transition-colors"
            onClick={() => navigate(-1)}
            aria-label="Back"
            data-testid="button-back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </Button>
          <h1 className="text-3xl font-bold">Items</h1>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={search}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            data-testid="input-search-items"
          />
        </div>
        {/* Category Group Filters */}
        {groupBy === 'category' && (
          <div className="flex items-center gap-2 flex-wrap">
            {Object.keys(GROUP_HIERARCHY).map(group => (
              <Button
                key={group}
                variant={enabledGroups.has(group) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMainGroup(group)}
                data-testid={`button-filter-${group.toLowerCase()}`}
                className="h-8 text-xs"
              >
                <Checkbox
                  checked={enabledGroups.has(group)}
                  className="mr-2 h-3 w-3"
                  onClick={(e) => e.stopPropagation()}
                />
                {group}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewCategoryOpen(true)}
              data-testid="button-add-category"
              className="h-8 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              New Category
            </Button>
          </div>
        )}
        {/* Filter Controls */}
        {!groupBy && (
          <div className="flex items-center gap-2 text-xs">
            <span className={filterMode === 'category' ? 'font-medium' : 'text-muted-foreground'}>Items</span>
            <Switch
              checked={filterMode === 'supplier'}
              onCheckedChange={(checked) => setFilterMode(checked ? 'supplier' : 'category')}
              data-testid="switch-filter-mode"
            />
            <span className={filterMode === 'supplier' ? 'font-medium' : 'text-muted-foreground'}>Supplier</span>
          </div>
        )}
        {/* Items Display */}
        {groupBy && groupedItems && Object.keys(groupedItems).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(groupedItems).map(([groupName, groupItemsArr]) => (
              <GroupCard
                key={groupName}
                groupName={groupName}
                groupBy={groupBy}
                items={groupItemsArr}
                categories={categories}
                posMode={settings.posMode ?? true}
                onQuickAdd={handleQuickAdd}
                allSuppliers={suppliers}
                addItem={() => {}}
              />
            ))}
            {Object.keys(groupedItems).length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No items found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Only show suppliers if filterMode is 'supplier' */}
            {filterMode === 'supplier' && suppliers.map(supplier => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
            {/* Always show items */}
            {Array.isArray(filteredItems) && filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                posMode={settings.posMode ?? true}
                onQuickAdd={handleQuickAdd}
              />
            ))}
            {Array.isArray(filteredItems) && filteredItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground space-y-4">
                <p>No items found{search && ` matching "${search}"`}</p>
                {search && (
                  <Button
                    onClick={() => {
                      const notSetSupplier = suppliers.find(s => s.name.toLowerCase() === 'not set');
                      addItem({
                        name: search,
                        category: 'New Item',
                        supplier: notSetSupplier?.name || 'not set',
                        tags: [],
                      });
                      toast.success(`Created new item: ${search}`);
                      setSearch('');
                    }}
                    className="gap-2"
                    data-testid="button-create-new-item"
                  >
                    <Plus className="w-4 h-4" />
                    Create "{search}"
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {/* New Category Dialog */}
      <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            data={newCategoryData}
            setData={setNewCategoryData}
            onSave={handleAddCategory}
            onCancel={() => setIsNewCategoryOpen(false)}
            parentCategories={parentCategories}
          />
        </DialogContent>
      </Dialog>

      {/* Store Selection Dialog */}
      <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Store</DialogTitle>
            <DialogDescription>
              Choose which store this item should be added to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedStore} onValueChange={(value) => setSelectedStore(value as StoreTag)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STORE_TAGS.map((store) => (
                  <SelectItem key={store} value={store}>
                    📌 {store.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStoreDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddToOrder}>
              Add to Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



