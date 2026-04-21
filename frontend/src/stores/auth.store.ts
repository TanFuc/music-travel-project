import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';
interface User {
  id: number;
  phoneNumber: string;
  fullName: string;
  email: string | null;
  role: string;
  isCollaborator?: boolean;
  referralCode?: string | null;
}
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),
      login: (user, accessToken, refreshToken) => {
        const currentUser = useAuthStore.getState().user;
        if (typeof window !== 'undefined' && currentUser && currentUser.id !== user.id) {
          localStorage.removeItem('cart-storage');
          window.dispatchEvent(new Event('cart-clear'));
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart-set-user', { detail: { userId: user.id } }));
        }
      },
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cart-storage');
          window.dispatchEvent(new Event('cart-clear'));
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof window !== 'undefined') {
          if ('requestIdleCallback' in window) {
            (window as Window).requestIdleCallback(() => {
              state?.setHasHydrated(true);
              if (state?.user) {
                window.dispatchEvent(
                  new CustomEvent('cart-set-user', { detail: { userId: state.user.id } })
                );
              }
            });
          } else {
            setTimeout(() => {
              state?.setHasHydrated(true);
              if (state?.user) {
                window.dispatchEvent(
                  new CustomEvent('cart-set-user', { detail: { userId: state.user.id } })
                );
              }
            }, 0);
          }
        } else {
          state?.setHasHydrated(true);
        }
      },
    }
  )
);
export function useAuthHydrated() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted && hasHydrated;
}
