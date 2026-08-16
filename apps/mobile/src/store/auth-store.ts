import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserSummary } from '@/api/types';
import secureStorage from '@/store/storage';

type AuthState = {
  token: string | null;
  user: UserSummary | null;
  hasHydrated: boolean;
  setSession: (token: string, user: UserSummary) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'edmara-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
