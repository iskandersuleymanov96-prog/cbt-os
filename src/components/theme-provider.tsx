"use client"

import { createContext, useContext, useCallback, useEffect, useRef, useSyncExternalStore } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
})

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light"
  return (localStorage.getItem("cbt-os-theme") as Theme) || "light"
}

let themeSnapshot = "light" as Theme
let resolvedSnapshot = "light" as "light" | "dark"
const listeners = new Set<() => void>()

function notify() {
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme)
  document.documentElement.classList.remove("light", "dark")
  document.documentElement.classList.add(resolved)
  themeSnapshot = theme
  resolvedSnapshot = resolved
  localStorage.setItem("cbt-os-theme", theme)
  notify()
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mountedRef = useRef(false)

  const theme = useSyncExternalStore(
    subscribe,
    () => themeSnapshot,
    () => "light" as Theme
  )

  const resolvedTheme = useSyncExternalStore(
    subscribe,
    () => resolvedSnapshot,
    () => "light" as "light" | "dark"
  )

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    const stored = getStoredTheme()
    applyTheme(stored)

    if (stored === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = () => applyTheme("system")
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    applyTheme(newTheme)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
