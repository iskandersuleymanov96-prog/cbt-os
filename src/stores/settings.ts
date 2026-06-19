import { create } from "zustand"
import type { AppSettings } from "@/types"

const defaultSettings: AppSettings = {
  theme: "light",
  language: "ru",
  font_size: "medium",
  compact_mode: false,
  notifications_enabled: true,
  reminder_time: "09:00",
  email_notifications: false,
  weekly_summary: true,
  ai_coaching_intensity: "moderate",
  ai_response_style: "detailed",
  ai_focus_topics: [],
  data_retention_days: 365,
  encryption_enabled: true,
}

interface SettingsState {
  settings: AppSettings
  updateSettings: (data: Partial<AppSettings>) => void
  resetSettings: () => void
  setTheme: (theme: AppSettings["theme"]) => void
  setLanguage: (lang: AppSettings["language"]) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  updateSettings: (data) =>
    set((state) => ({
      settings: { ...state.settings, ...data },
    })),
  resetSettings: () => set({ settings: defaultSettings }),
  setTheme: (theme) =>
    set((state) => ({
      settings: { ...state.settings, theme },
    })),
  setLanguage: (language) =>
    set((state) => ({
      settings: { ...state.settings, language },
    })),
}))
