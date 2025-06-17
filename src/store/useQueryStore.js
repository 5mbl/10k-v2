import { create } from 'zustand';

const useQueryStore = create((set) => ({
  // State
  userQuery: '',
  
  // Actions
  setUserQuery: (query) => set({ userQuery: query }),
  clearUserQuery: () => set({ userQuery: '' }),
}));

export default useQueryStore;
