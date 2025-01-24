import { create } from 'zustand';
import { UserState } from '@/types/user';

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));