import { create } from 'zustand';

interface SearchState {
  searchQuery1: string;
  searchQuery2: string;
  budget: number | null;
  amenities: string[];
  category: string;
  setSearch: (q1: string, q2: string) => void;
  setFilters: (budget: number | null, amenities: string[], category: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery1: '',
  searchQuery2: '',
  budget: null,
  amenities: [],
  category: '',
  setSearch: (q1, q2) => set({ searchQuery1: q1, searchQuery2: q2 }),
  setFilters: (budget, amenities, category) => set({ budget, amenities, category }),
}));
