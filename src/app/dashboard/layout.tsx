"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  BookOpen,
  BarChart3,
  Dumbbell,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Панель", href: "/dashboard", icon: LayoutDashboard },
  { name: "Дневник", href: "/journal", icon: BookOpen },
  { name: "Паттерны", href: "/patterns", icon: Brain },
  { name: "ИИ-рефлексия", href: "/ai", icon: Sparkles },
  { name: "Аналитика", href: "/analytics", icon: BarChart3 },
  { name: "Упражнения", href: "/exercises", icon: Dumbbell },
  { name: "Настройки", href: "/settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/30 glass-strong transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0 shadow-floating" : "-translate-x-full invisible lg:visible"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border/30 px-6">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-cta shadow-sm">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-deep-charcoal">CBT OS</span>
            </Link>
              <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary lg:hidden"
              aria-label="Закрыть меню"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-premium",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-primary/10"
                      layoutId="sidebar-active"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "relative h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                      isActive && "text-primary"
                    )}
                  />
                  <span className="relative">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-border/30 p-4">
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/40 px-3 py-3 transition-smooth hover:from-secondary hover:to-secondary/60">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold text-primary">
                  АИ
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">Пользователь</div>
                  <div className="text-xs text-muted-foreground">Бесплатный план</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/30 glass-strong px-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
              aria-label="Открыть меню"
            >
              <Menu className="h-5 w-5" />
            </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-cta">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-deep-charcoal">CBT OS</span>
          </div>
        </header>

        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
