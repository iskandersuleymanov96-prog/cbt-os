import { NextRequest, NextResponse } from "next/server"

interface PerformanceMetric {
  name: string
  value: number
  rating: "good" | "needs-improvement" | "poor"
  timestamp: number
  page: string
}

const metricsStore: PerformanceMetric[] = []

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json()

    metricsStore.push({
      ...metric,
      timestamp: Date.now(),
    })

    // Keep only last 1000 metrics
    if (metricsStore.length > 1000) {
      metricsStore.splice(0, metricsStore.length - 1000)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid metric" }, { status: 400 })
  }
}

export async function GET() {
  // Return aggregated metrics
  const aggregated = metricsStore.reduce<Record<string, { count: number; total: number; good: number; needsImprovement: number; poor: number }>>((acc, m) => {
    if (!acc[m.name]) {
      acc[m.name] = { count: 0, total: 0, good: 0, needsImprovement: 0, poor: 0 }
    }
    acc[m.name].count++
    acc[m.name].total += m.value
    if (m.rating === "good") acc[m.name].good++
    else if (m.rating === "needs-improvement") acc[m.name].needsImprovement++
    else acc[m.name].poor++
    return acc
  }, {})

  const result = Object.entries(aggregated).map(([name, data]) => ({
    name,
    average: data.total / data.count,
    count: data.count,
    goodPercent: (data.good / data.count) * 100,
    needsImprovementPercent: (data.needsImprovement / data.count) * 100,
    poorPercent: (data.poor / data.count) * 100,
  }))

  return NextResponse.json({ metrics: result, total: metricsStore.length })
}
