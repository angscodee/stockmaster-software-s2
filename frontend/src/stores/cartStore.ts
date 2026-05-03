import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    imagen?: string;
    variante?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, cantidad: number) => void;
    clearCart: () => void;
    syncWithBackend: (clienteId: number) => Promise<void>;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const { items } = get();
                const existing = items.find((i) => i.id === item.id);
                if (existing) {
                    set({
                        items: items.map((i) =>
                            i.id === item.id ? { ...i, cantidad: i.cantidad + item.cantidad } : i
                        ),
                    });
                } else {
                    set({ items: [...items, item] });
                }
            },
            removeItem: (id) =>
                set({ items: get().items.filter((i) => i.id !== id) }),
            updateQuantity: (id, cantidad) =>
                set({
                    items: get().items.map((i) =>
                        i.id === id ? { ...i, cantidad } : i
                    ),
                }),
            clearCart: () => set({ items: [] }),
            syncWithBackend: async (clienteId) => {
                // Implementation logic for syncing cart with backend
            },
            totalItems: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
            totalPrice: () => get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
        }),
        {
            name: 'cart-storage',
        }
    )
);
