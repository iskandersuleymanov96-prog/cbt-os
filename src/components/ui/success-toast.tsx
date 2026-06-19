"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Flame, Trophy, X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "saved" | "streak" | "achievement" | "info"

interface SuccessToastProps {
  show: boolean
  type?: ToastType
  title: string
  message?: string
  onClose: () => void
  autoHide?: number
}

const icons = {
  saved: CheckCircle2,
  streak: Flame,
  achievement: Trophy,
  info: CheckCircle2,
}

const colors = {
  saved: "from-emerald-500/10 to-emerald-500/5 border-emerald-200",
  streak: "from-orange-500/10 to-amber-500/5 border-orange-200",
  achievement: "from-violet-500/10 to-purple-500/5 border-violet-200",
  info: "from-primary/10 to-primary/5 border-primary/20",
}

const iconColors = {
  saved: "text-emerald-500",
  streak: "text-orange-500",
  achievement: "text-violet-500",
  info: "text-primary",
}

export function SuccessToast({
  show,
  type = "saved",
  title,
  message,
  onClose,
  autoHide = 3500,
}: SuccessToastProps) {
  const [phase, setPhase] = useState<"hidden" | "entering" | "visible" | "exiting">("hidden")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const Icon = icons[type]
  const prevShowRef = useRef(show)

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current)
      exitTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (show && !prevShowRef.current) {
      setPhase("entering")
      cleanup()

      timerRef.current = setTimeout(() => {
        setPhase("exiting")
        exitTimerRef.current = setTimeout(() => {
          setPhase("hidden")
          onClose()
        }, 300)
      }, autoHide)
    } else if (!show && prevShowRef.current) {
      setPhase("exiting")
      exitTimerRef.current = setTimeout(() => setPhase("hidden"), 300)
    }

    prevShowRef.current = show
    return cleanup
  }, [show, autoHide, onClose, cleanup])

  const handleClose = useCallback(() => {
    cleanup()
    setPhase("exiting")
    exitTimerRef.current = setTimeout(() => {
      setPhase("hidden")
      onClose()
    }, 300)
  }, [cleanup, onClose])

  const shouldRender = phase !== "hidden"

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
      <AnimatePresence>
        {shouldRender && (
          <motion.div
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-elevated backdrop-blur-xl bg-gradient-to-r",
              colors[type],
              phase === "exiting" ? "animate-toast-out" : "animate-toast-in"
            )}
            layout
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80">
              <Icon className={cn("h-5 w-5", iconColors[type])} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-deep-charcoal">{title}</p>
              {message && (
                <p className="text-xs text-muted-foreground">{message}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="ml-2 rounded-lg p-1 text-muted-foreground hover:bg-white/50 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface AchievementBadgeProps {
  icon: string
  title: string
  description: string
  show: boolean
  onClose?: () => void
}

export function AchievementBadge({ icon, title, description, show }: AchievementBadgeProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="flex items-center gap-4 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-500/10 to-purple-500/5 p-4 shadow-elevated"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        >
          <div className="relative">
            <motion.div
              className="text-4xl"
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
            >
              {icon}
            </motion.div>
            <div className="absolute -inset-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="confetti-piece absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"][i],
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">
              Достижение открыто
            </p>
            <p className="font-semibold text-deep-charcoal">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
