import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem { id: string; name: string; price: number; quantity: number; image: string; }
interface CartStore {
  items: CartItem[];
  add: (item: Omit<CartItem, 'quantity'>) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: item => set(s => {
        const ex = s.items.find(i => i.id === item.id);
        return ex
          ? { items: s.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) }
          : { items: [...s.items, { ...item, quantity: 1 }] };
      }),
      remove: id => set(s => ({ items: s.items.filter(i => i.id !== id) })),
      update: (id, qty) => set(s => ({
        items: qty < 1 ? s.items.filter(i => i.id !== id) : s.items.map(i => i.id === id ? { ...i, quantity: qty } : i),
      })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'shopflow-cart' }
  )
);