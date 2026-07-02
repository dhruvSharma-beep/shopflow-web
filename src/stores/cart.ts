// Fix: cart total was double-counting items added via "Add to cart" button
// Root cause: CartStore.add() was not checking for existing items correctly
// The item.id comparison was using reference equality instead of value equality

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem { id: string; name: string; price: number; quantity: number; }

// FIXED: use strict string comparison for IDs (was failing with numeric IDs from DB)
export const useCartFixed = create(
  persist<{ items: CartItem[]; add: (item: Omit<CartItem,'quantity'>) => void; total: () => number }>(
    (set, get) => ({
      items: [],
      add: item => set(s => {
        // FIX: String(i.id) === String(item.id) instead of i.id === item.id
        const idx = s.items.findIndex(i => String(i.id) === String(item.id));
        if (idx >= 0) {
          const next = [...s.items];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
          return { items: next };
        }
        return { items: [...s.items, { ...item, quantity: 1 }] };
      }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'shopflow-cart-v2' }
  )
);