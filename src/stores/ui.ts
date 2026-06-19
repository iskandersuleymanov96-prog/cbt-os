import { create } from "zustand"

interface UIState {
  sidebarOpen: boolean
  currentStep: number
  setSidebarOpen: (open: boolean) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  currentStep: 0,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
}))
