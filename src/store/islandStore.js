import { create } from 'zustand';

export const useIslandStore = create((set) => ({
  activeModule: 'systems',
  setActiveModule: (moduleKey) => set({ activeModule: moduleKey }),
  persona: 'all',
  setPersona: (persona) => set({ persona }),
  isModalOpen: true,
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  // 頂部工具列互動開關（參考 HEART 政策島）
  showLabels: true,
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  showSynergyLines: true,
  toggleSynergyLines: () => set((state) => ({ showSynergyLines: !state.showSynergyLines })),
  isPaused: false,
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  cameraTarget: [0, 0, 0],
  setCameraTarget: (target) => set({ cameraTarget: target }),
}));
