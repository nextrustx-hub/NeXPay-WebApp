import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/lib/api-types';

// Auth Store Types
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

// Initial state
const initialAuthState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

// Auth Store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialAuthState,
      
      setAuth: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        }),
      
      setUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : user,
        })),
      
      setToken: (token) =>
        set({ token }),
      
      logout: () =>
        set({
          ...initialAuthState,
          isLoading: false,
        }),
      
      setLoading: (loading) =>
        set({ isLoading: loading }),
    }),
    {
      name: 'nexpay-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Theme Store Types
type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
}

type ThemeStore = ThemeState & ThemeActions;

// Theme Store
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      resolvedTheme: 'light',
      
      setTheme: (theme) => {
        const resolvedTheme = theme === 'system' 
          ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : theme;
        
        set({ theme, resolvedTheme });
        
        // Apply theme to document
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(resolvedTheme);
        }
      },
    }),
    {
      name: 'nexpay-theme',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selectors for performance optimization
export const selectToken = (state: AuthStore) => state.token;
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
