import { create } from 'zustand';
import { Class, ClassStore } from '@/types/class';
import { getClassById } from '@/actions/classActions';

export const useClassStore = create<ClassStore>((set) => ({
  classes: [],
  setClasses: (classes) => set({ classes }),

  class: <Class>{},
  getClassById: async (id: number) => {
    try {
      const response = await getClassById(id);

      set((state) => ({
        classes: [...state.classes.filter((c) => c.id !== id), response.data],
      }));
    } catch (error) {
      console.error("Failed to fetch class by ID:", error);
    }
  },
}));