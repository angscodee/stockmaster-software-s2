import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUsuario } from '@/types';

interface AuthState {
  user: IUsuario | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (data: { user: IUsuario; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  setUser: (userData: Partial<AuthState>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('auth-storage');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
      setUser: (userData) => set((state) => ({ ...state, ...userData })),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // Normalizar: si el usuario guardado tiene 'role' en vez de 'rol', corregirlo
        if (state?.user && !(state.user as any).rol && (state.user as any).role) {
          state.user = { ...state.user, rol: (state.user as any).role };
        }
      },
    }
  )
);
