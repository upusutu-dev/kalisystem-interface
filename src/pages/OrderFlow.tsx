import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseDefaultData } from '@/lib/dataParser';
import defaultData from '/src/default-data.json' assert { type: 'json' };
import { Item, OrderItem, STORE_TAGS } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// This is the dedicated order flow interface for real ordering
// Details like manager, payment, etc. will be set later or by admin
// This page is meant for actual order placement by suppliers/stores

export default function OrderFlow() {
  const { supplierId, storeId } = useParams();
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<Item | null>(null);
  const [selectedStore, setSelectedStore] = useState(storeId || '');

  useEffect(() => {
    // Parse items for the supplier
    const parsed = parseDefaultData(defaultData);
    const filtered = parsed.items.filter(
      (item) => item.supplier === supplierId
    );
    setItems(filtered);
  }, [supplierId]);

  const addToOrder = (item: Item) => {
    // Prompt for store selection if not set
    setPendingItem(item);
    setStoreDialogOpen(true);
  };

  const confirmAddToOrder = () => {
    if (!pendingItem || !selectedStore) return;
    setOrder((prev) => {
      const exists = prev.find(
        (oi) => oi.item.id === pendingItem.id && oi.storeTag === selectedStore
      );
      if (exists) {
        return prev.map((oi) =>
          oi.item.id === pendingItem.id && oi.storeTag === selectedStore
            ? { ...oi, quantity: oi.quantity + 1 }
            : oi
        );
      }
      return [
        ...prev,
        {
          item: { ...pendingItem, category: pendingItem.category || 'Notset' },
          quantity: 1,
          storeTag: selectedStore,
        },
      ];
    });
    setPendingItem(null);
    setStoreDialogOpen(false);
  };

  const removeFromOrder = (itemId: string) => {
    setOrder((prev) => prev.filter((oi) => oi.item.id !== itemId || oi.storeTag !== storeId));
  };

  const updateQuantity = (itemId: string, qty: number) => {
    setOrder((prev) =>
      prev.map((oi) =>
        oi.item.id === itemId && oi.storeTag === storeId
          ? { ...oi, quantity: qty }
          : oi
      )
    );
  };

  const handleSendOrder = () => {
    // For now, just clear order and show preview
    setOrder([]);
    alert('Order sent!');
  };

  const handleHoldOrder = () => {
    setOrder([]);
    alert('Order held!');
  };

  const orderPreview = useMemo(() => {
    if (order.length === 0) return 'Order is empty.';
    return order
      .map(
        (oi) =>
          `🔹 ${oi.item.name} x${oi.quantity} [${oi.item.category || 'Notset'}]`
      )
      .join('\n');
  }, [order]);

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Place Order</h1>
          <p className="text-muted-foreground">Order items for your store or supplier</p>
          <div className="mt-2 flex gap-4">
            <span className="text-sm bg-primary/10 px-2 py-1 rounded">Supplier: <b>{supplierId}</b></span>
            <span className="text-sm bg-primary/10 px-2 py-1 rounded">Store: <b>{storeId}</b></span>
          </div>
        </div>
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-3 text-sm">Items</h3>
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="text-muted-foreground">No items for this supplier.</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.category || 'Notset'}</span>
                  <Button size="sm" onClick={() => addToOrder(item)}>
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
        <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Store</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <label className="text-sm font-medium">Store</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={selectedStore}
                onChange={e => setSelectedStore(e.target.value)}
              >
                <option value="">Select store</option>
                {STORE_TAGS.map(tag => (
                  <option key={tag} value={tag}>{tag.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button onClick={() => setStoreDialogOpen(false)} variant="outline">Cancel</Button>
              <Button onClick={confirmAddToOrder} disabled={!selectedStore}>Add to order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Card className="p-4 bg-muted border-border">
          <h3 className="font-semibold mb-3 text-sm">Order Preview</h3>
          <pre className="text-xs whitespace-pre-wrap font-mono">{orderPreview}</pre>
          <div className="space-y-2 mt-4">
            {order.map((oi) => (
              <div key={oi.item.id + '-' + oi.storeTag} className="flex items-center gap-2">
                <span>{oi.item.name}</span>
                <span className="text-xs bg-primary/10 px-2 py-0.5 rounded">{oi.storeTag}</span>
                <input
                  type="number"
                  min={1}
                  value={oi.quantity}
                  onChange={(e) => updateQuantity(oi.item.id, Number(e.target.value))}
                  className="w-16 px-2 py-1 border rounded"
                />
                <Button size="sm" variant="ghost" onClick={() => removeFromOrder(oi.item.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </Card>
        <div className="flex justify-center gap-3">
          <Button onClick={handleHoldOrder} variant="outline" disabled={order.length === 0}>
            Hold
          </Button>
          <Button onClick={handleSendOrder} className="bg-blue-600 px-8" disabled={order.length === 0}>
            Mark as sent
          </Button>
        </div>
      </div>
    </div>
  );
}