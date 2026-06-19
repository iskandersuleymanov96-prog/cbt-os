"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-6">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold text-deep-charcoal mb-2">
        Что-то пошло не так
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Попробовать снова
        </Button>
        <Link href="/dashboard">
          <Button>На главную</Button>
        </Link>
      </div>
    </div>
  )
}
