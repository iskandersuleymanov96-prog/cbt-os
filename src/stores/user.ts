import { create } from "zustand"
import type { User, UserSettings } from "@/types"

interface UserState {
  user: User | null
  settings: UserSettings | null
  isOnboarded: boolean
  setUser: (user: User | null) => void
  setSettings: (settings: UserSettings | null) => void
  updateSettings: (data: Partial<UserSettings>) => void
  setOnboarded: (onboarded: boolean) => void
  updateProfile: (data: Partial<User>) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  settings: null,
  isOnboarded: false,
  setUser: (user) => set({ user }),
  setSettings: (settings) => set({ settings }),
  updateSettings: (data) =>
    set((state) => ({
      settings: state.settings ? { ...state.settings, ...data } : null,
    })),
  setOnboarded: (onboarded) => set({ isOnboarded: onboarded }),
  updateProfile: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
}))
