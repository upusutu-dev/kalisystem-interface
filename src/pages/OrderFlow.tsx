import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseDefaultData } from '@/lib/dataParser';
import defaultData from '@/default-data.json';
import { Item, OrderItem, STORE_TAGS } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';

// This is the dedicated order flow interface for real ordering
// Details like manager, payment, etc. will be set later or by admin
// This page is meant for actual order placement by suppliers/stores

export default function OrderFlow() {
  const { supplierId, storeId } = useParams();
  const { 
    items: allItems, 
    currentOrder: order,
    addToOrder,
    removeFromOrder,
    updateOrderItem,
    settings,
  } = useApp();
  
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    // Parse items for the supplier
    const parsed = parseDefaultData(defaultData);
    const filtered = parsed.items.filter(
      (item) => item.supplier === supplierId
    );
    setItems(filtered);
  }, [supplierId]);

  const handleAddToOrder = (item: Item) => {
    addToOrder(item, 1, storeId || 'default');
  };

  const handleRemoveFromOrder = (itemId: string) => {
    removeFromOrder(itemId, storeId);
  };

  const handleUpdateQuantity = (itemId: string, qty: number) => {
    updateOrderItem(itemId, qty, storeId);
  };

  const handleSendOrder = () => {
    // For now, just show preview
    alert('Order sent!');
  };

  const handleHoldOrder = () => {
    alert('Order held!');
  };

  const orderPreview = useMemo(() => {
    if (!order || order.length === 0) return 'Order is empty.';
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
                                    <Button size="sm" onClick={() => handleAddToOrder(item)}>
                    Add to order
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

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
                  onChange={(e) => handleUpdateQuantity(oi.item.id, Number(e.target.value))}
                  className="w-16 px-2 py-1 border rounded"
                />
                <Button size="sm" variant="ghost" onClick={() => handleRemoveFromOrder(oi.item.id)}>
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