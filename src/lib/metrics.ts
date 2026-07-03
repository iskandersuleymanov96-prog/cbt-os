"use client"

import { useEffect, useCallback } from "react"

interface MetricEvent {
  name: string
  value: number
  rating: "good" | "needs-improvement" | "poor"
  timestamp: number
}

interface CustomEvent {
  name: string
  properties?: Record<string, unknown>
  timestamp: number
}

class PerformanceMonitor {
  private metrics: MetricEvent[] = []
  private events: CustomEvent[] = []
  private enabled: boolean

  constructor() {
    this.enabled = typeof window !== "undefined"
    if (this.enabled) {
      this.initWebVitals()
    }
  }

  private initWebVitals() {
    if (typeof window === "undefined") return

    // Observe LCP
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.trackMetric("LCP", lastEntry.startTime, this.getRating("lcp", lastEntry.startTime))
      })
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })
    } catch {}

    // Observe FID
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries() as PerformanceEventTiming[]
        entries.forEach((entry) => {
          this.trackMetric("FID", entry.processingStart - entry.startTime, this.getRating("fid", entry.processingStart - entry.startTime))
        })
      })
      fidObserver.observe({ type: "first-input", buffered: true })
    } catch {}

    // Observe CLS
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => {
          if (!entry.hadRecentInput && entry.value) {
            clsValue += entry.value
          }
        })
        this.trackMetric("CLS", clsValue, this.getRating("cls", clsValue))
      })
      clsObserver.observe({ type: "layout-shift", buffered: true })
    } catch {}

    // TTFB
    try {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart
        this.trackMetric("TTFB", ttfb, this.getRating("ttfb", ttfb))
      }
    } catch {}
  }

  private getRating(metric: string, value: number): "good" | "needs-improvement" | "poor" {
    const thresholds: Record<string, [number, number]> = {
      lcp: [2500, 4000],
      fid: [100, 300],
      cls: [0.1, 0.25],
      ttfb: [800, 1800],
    }

    const [good, poor] = thresholds[metric] || [0, 0]
    if (value <= good) return "good"
    if (value <= poor) return "needs-improvement"
    return "poor"
  }

  private trackMetric(name: string, value: number, rating: "good" | "needs-improvement" | "poor") {
    const metric: MetricEvent = { name, value, rating, timestamp: Date.now() }
    this.metrics.push(metric)

    // Send to Vercel Analytics if available
    if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "web_vitals", {
        event_category: "Web Vitals",
        event_label: name,
        value: Math.round(name === "CLS" ? value * 1000 : value),
        non_interaction: true,
      })
    }
  }

  trackEvent(name: string, properties?: Record<string, unknown>) {
    const event: CustomEvent = { name, properties, timestamp: Date.now() }
    this.events.push(event)

    // Send to Vercel Analytics
    if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", name, properties)
    }
  }

  trackPageView(page: string) {
    this.trackEvent("page_view", { page })
  }

  trackJournalEntry(entry: { has_alternative_thought: boolean; distortion_count: number }) {
    this.trackEvent("journal_entry_created", entry)
  }

  trackAIChat(messageLength: number) {
    this.trackEvent("ai_chat_message", { message_length: messageLength })
  }

  trackExercise(exerciseId: string, completed: boolean) {
    this.trackEvent("exercise", { exercise_id: exerciseId, completed })
  }

  getMetrics(): MetricEvent[] {
    return this.metrics
  }

  getEvents(): CustomEvent[] {
    return this.events
  }
}

export const monitor = new PerformanceMonitor()

export function usePageTracking(page: string) {
  useEffect(() => {
    monitor.trackPageView(page)
  }, [page])
}

export function useTrackEvent() {
  return useCallback((name: string, properties?: Record<string, unknown>) => {
    monitor.trackEvent(name, properties)
  }, [])
}
