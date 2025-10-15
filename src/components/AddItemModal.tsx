import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus } from 'lucide-react';
import { Item } from '@/types';

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: string;
  items: Item[];
  onAddItem: (item: Item) => void;
  onCreateNewItem?: (name: string) => void;
}

export function AddItemModal({ open, onOpenChange, supplier, items, onAddItem, onCreateNewItem }: AddItemModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    // First filter by supplier
    const supplierFilteredItems = supplier 
      ? items.filter(item => item.supplier === supplier)
      : items;

    // Then filter by search query
    if (!searchQuery.trim()) {
      return supplierFilteredItems;
    }

    const query = searchQuery.toLowerCase();
    return supplierFilteredItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [items, searchQuery, supplier]);

  const handleAddItem = (item: Item) => {
    onAddItem(item);
    setSearchQuery('');
  };

  const handleClose = () => {
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-items"
              autoFocus
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">No items found{searchQuery && ` matching "${searchQuery}"`}</p>
                {searchQuery && onCreateNewItem && (
                  <Button
                    onClick={() => {
                      onCreateNewItem(searchQuery);
                      handleClose();
                    }}
                    className="gap-2"
                    data-testid="button-create-new-item"
                  >
                    <Plus className="w-4 h-4" />
                    Create "{searchQuery}"
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map(item => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3 px-3"
                    onClick={() => handleAddItem(item)}
                    data-testid={`button-add-item-${item.id}`}
                  >
                    <div className="flex flex-col items-start gap-1 flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="flex gap-1 flex-wrap">
                        {item.unitTag && (
                          <Badge variant="secondary" className="text-xs">
                            {item.unitTag}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Plus className="w-4 h-4 ml-2 shrink-0" />
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
