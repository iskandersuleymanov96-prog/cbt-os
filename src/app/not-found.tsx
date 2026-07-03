"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Brain, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-warm-white p-6">
      {/* Ambient background effects */}
      <div className="ambient-glow" />
      <div className="ambient-glow-2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-cta shadow-premium">
            <Brain className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        {/* 404 Number */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-8xl font-bold text-muted-foreground/20 mb-4"
        >
          404
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-4 text-2xl font-bold text-deep-charcoal"
        >
          Страница не найдена
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8 max-w-md text-muted-foreground"
        >
          Похоже, эта страница была перемещена или не существует. Давайте вернёмся к вашему пути осознанности.
        </motion.p>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              На главную
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-10 opacity-10 hidden lg:block">
        <div className="h-24 w-24 rounded-full border-2 border-primary/30" />
      </div>
      <div className="absolute top-20 right-20 opacity-10 hidden lg:block">
        <div className="h-16 w-16 rounded-xl border-2 border-primary/20 rotate-45" />
      </div>
    </div>
  )
}
