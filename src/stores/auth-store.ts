import { create } from 'zustand';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false, initialized: true });
    });
    return unsubscribe;
  },
}));