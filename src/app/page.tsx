"use client"

import dynamic from "next/dynamic"

const LandingContent = dynamic(
  () => import("@/components/landing-content"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 animate-pulse" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    ),
  }
)

export default function Home() {
  return <LandingContent />
}
