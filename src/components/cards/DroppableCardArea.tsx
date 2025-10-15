import { memo, useCallback } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import SortableItem from './SortableItem';
import type { ParsedItem } from '@/pages/BulkOrder';
import { ErrorBoundary } from 'react-error-boundary';
// No types package needed: react-error-boundary includes its own TypeScript types.
interface DroppableCardAreaProps {
  cardId: string;
  items: ParsedItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, qty: number) => void;
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="p-4 border border-red-500 rounded">
      <p className="text-red-500">Something went wrong:</p>
      <pre className="text-sm">{error.message}</pre>
      <button onClick={resetErrorBoundary} className="mt-2 px-2 py-1 bg-red-100 rounded">
        Try again
      </button>
    </div>
  );
}

function DroppableCardArea({ cardId, items: cardItems, onRemoveItem, onUpdateQuantity }: DroppableCardAreaProps) {
  const { setNodeRef, isOver } = useDroppable({ id: cardId });
  
  const handleRemoveItem = useCallback((itemId: string) => {
    onRemoveItem(itemId);
  }, [onRemoveItem]);

  const handleUpdateQuantity = useCallback((itemId: string, qty: number) => {
    onUpdateQuantity(itemId, qty);
  }, [onUpdateQuantity]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SortableContext
        items={cardItems.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`space-y-2 min-h-[100px] p-2 rounded-lg border-2 border-dashed ${
            isOver ? 'border-primary bg-primary/10' : 'border-border/50'
          }`}
          id={cardId}
          aria-label={`Drop area for card ${cardId}`}
        >
          {cardItems.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">
              Drag items here
            </p>
          )}
          {cardItems.map(item => (
            <SortableItem 
              key={item.id} 
              item={item} 
              onRemove={() => handleRemoveItem(item.id)} 
              onQuantityChange={qty => handleUpdateQuantity(item.id, qty)} 
            />
          ))}
        </div>
      </SortableContext>
    </ErrorBoundary>
  );
}

export default memo(DroppableCardArea);