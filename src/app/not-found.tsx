"use client"

import Link from "next/link"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <p className="text-7xl font-bold text-muted-foreground/30 mb-4">404</p>
      <h2 className="text-xl font-bold text-deep-charcoal mb-2">
        Страница не найдена
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Запрашиваемая страница не существует или была перемещена.
      </p>
      <Link href="/dashboard">
        <Button className="gap-2">
          <Home className="h-4 w-4" />
          На главную
        </Button>
      </Link>
    </div>
  )
}
