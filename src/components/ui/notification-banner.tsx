"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X } from "lucide-react"
import { requestPermission } from "@/lib/notifications/service"

const VISIT_KEY = "cbt-os-visit-count"
const DISMISSED_KEY = "cbt-os-notification-banner-dismissed"

function getVisitCount(): number {
  if (typeof window === "undefined") return 0
  const raw = localStorage.getItem(VISIT_KEY)
  if (!raw) {
    localStorage.setItem(VISIT_KEY, "1")
    return 1
  }
  const count = parseInt(raw, 10) + 1
  localStorage.setItem(VISIT_KEY, String(count))
  return count
}

export function NotificationBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed) return
    const count = getVisitCount()
    if (count >= 3) setVisible(true)
  }, [])

  const handleEnable = async () => {
    await requestPermission()
    localStorage.setItem(DISMISSED_KEY, "true")
    setVisible(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true")
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-white/40 bg-white/90 p-4 shadow-lg backdrop-blur-xl dark:bg-zinc-900/90"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-deep-charcoal">
                Включить уведомления?
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Мы напомним записать мысли, когда вы зайдёте в приложение
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleEnable}
              className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Включить уведомления
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
            >
              Позже
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
