import { create } from 'zustand';

interface UiState {
    isCartOpen: boolean;
    isMobileMenuOpen: boolean;
    isLoading: boolean;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleMobileMenu: () => void;
    setLoading: (value: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
    isCartOpen: false,
    isMobileMenuOpen: false,
    isLoading: false,
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    setLoading: (value) => set({ isLoading: value }),
}));
