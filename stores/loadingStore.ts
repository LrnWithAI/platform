import { create } from 'zustand';
import { LoadingState } from '@/types/loading';

export const useLoadingStore = create<LoadingState>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
