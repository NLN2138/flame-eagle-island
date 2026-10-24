import { create } from 'zustand';

export const useIslandStore = create((set) => ({
  activeModule: null,
  setActiveModule: (moduleKey) => set({ activeModule: moduleKey }),
  persona: 'all',
  setPersona: (persona) => set({ persona }),
  isModalOpen: false,
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
}));
