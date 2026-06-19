"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getDistortions } from "@/lib/db/distortions"
import type { Distortion } from "@/types"

export default function DistortionsPage() {
  const [search, setSearch] = useState("")
  const [distortions, setDistortions] = useState<Distortion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDistortions().then((data) => {
      setDistortions(data)
      setLoading(false)
    })
  }, [])

  const filtered = distortions.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-deep-charcoal">Когнитивные искажения</h1>
        <p className="text-muted-foreground">
          Библиотека из {distortions.length} искажений
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск искажений..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          aria-label="Поиск искажений"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((d) => (
          <Link key={d.slug} href={`/distortions/${d.slug}`}>
            <Card className="glass-card transition-all hover:-translate-y-0.5 hover:card-shadow-hover cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{d.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-deep-charcoal">{d.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{d.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
