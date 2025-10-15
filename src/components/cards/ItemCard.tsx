import { useState, useRef, useCallback, useEffect } from 'react';
import { ItemForm } from '@/components/forms/ItemForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, ChevronDown, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { VARIANT_TAG_TYPES, VARIANT_TYPE_COLORS, VariantTagType, VariantTag, Item } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface ItemCardProps {
  item: Item;
  posMode: boolean;
  onQuickAdd: (item: Item) => void;
  compact?: boolean;
}

export function ItemCard({ item, posMode, onQuickAdd, compact = false }: ItemCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { categories, suppliers, updateItem } = useApp();
  const [editData, setEditData] = useState<Item>(item);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleMouseDown = () => {
    timerRef.current = setTimeout(() => setIsEditOpen(true), 600);
  };
  const handleMouseUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditOpen(true);
  };

  return (
    <Card
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      className="relative group"
    >
      <div className="flex items-center justify-between">
        <span>{item.name}</span>
        {posMode && (
          <Button
            size="icon"
            className="transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(item);
            }}
            data-testid={`button-add-to-order-${item.id}`}
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <ItemForm
            data={editData}
            setData={setEditData}
            onSave={() => {
              updateItem(editData.id, editData);
              setIsEditOpen(false);
            }}
            onCancel={() => setIsEditOpen(false)}
            isEdit={true}
            categories={categories}
            suppliers={suppliers}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
