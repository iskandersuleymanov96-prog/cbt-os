"use client"

import { useEffect, useState } from "react"
import { monitor } from "@/lib/metrics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Activity, Clock, Zap, Eye } from "lucide-react"

interface Metric {
  name: string
  value: number
  rating: "good" | "needs-improvement" | "poor"
  unit: string
}

const ratingColors = {
  good: "bg-green-100 text-green-700",
  "needs-improvement": "bg-yellow-100 text-yellow-700",
  poor: "bg-red-100 text-red-700",
}

const ratingLabels = {
  good: "Отлично",
  "needs-improvement": "Нормально",
  poor: "Плохо",
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [events, setEvents] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const rawMetrics = monitor.getMetrics()
      const latest = rawMetrics.reduce<Record<string, Metric>>((acc, m) => {
        acc[m.name] = {
          name: m.name,
          value: m.value,
          rating: m.rating,
          unit: m.name === "CLS" ? "" : "ms",
        }
        return acc
      }, {})

      setMetrics(Object.values(latest))
      setEvents(monitor.getEvents().length)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getIcon = (name: string) => {
    switch (name) {
      case "LCP": return <Eye className="h-4 w-4" />
      case "FID": return <Zap className="h-4 w-4" />
      case "CLS": return <Activity className="h-4 w-4" />
      case "TTFB": return <Clock className="h-4 w-4" />
      default: return <TrendingUp className="h-4 w-4" />
    }
  }

  const getDescription = (name: string) => {
    switch (name) {
      case "LCP": return "Время загрузки контента"
      case "FID": return "Задержка первого ввода"
      case "CLS": return "Смещение макета"
      case "TTFB": return "Время до первого байта"
      default: return name
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Производительность
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Сбор метрик...
          </p>
        ) : (
          metrics.map((metric) => (
            <div key={metric.name} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-3">
                {getIcon(metric.name)}
                <div>
                  <p className="text-sm font-medium">{metric.name}</p>
                  <p className="text-xs text-muted-foreground">{getDescription(metric.name)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">
                  {metric.name === "CLS" ? metric.value.toFixed(3) : `${Math.round(metric.value)}${metric.unit}`}
                </span>
                <Badge className={ratingColors[metric.rating]}>
                  {ratingLabels[metric.rating]}
                </Badge>
              </div>
            </div>
          ))
        )}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Событий отслежено: {events}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
