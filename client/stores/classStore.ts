import { create } from 'zustand';
import { ClassStore } from '@/types/class';

export const useClassStore = create<ClassStore>((set) => ({
  classes: [],
  setClasses: (classes) => set({ classes }),
}));