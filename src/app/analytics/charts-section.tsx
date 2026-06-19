"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartsSectionProps {
  moodData: Array<{ day: string; mood: number; stress: number; anxiety: number }>
  emotionDistribution: Array<{ name: string; value: number; color: string }>
  distortionFrequency: Array<{ name: string; count: number }>
}

export default function ChartsSection({
  moodData,
  emotionDistribution,
  distortionFrequency,
}: ChartsSectionProps) {
  return (
    <>
      {/* Mood Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Динамика настроения</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="day" stroke="#737373" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="#737373" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#4a6fa5" strokeWidth={2} dot={{ fill: "#4a6fa5" }} name="Настроение" />
              <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} name="Стресс" />
              <Line type="monotone" dataKey="anxiety" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7" }} name="Тревога" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#4a6fa5]" />
              <span className="text-xs text-muted-foreground">Настроение</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <span className="text-xs text-muted-foreground">Стресс</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#a855f7]" />
              <span className="text-xs text-muted-foreground">Тревога</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Emotion Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Распределение эмоций</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={emotionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {emotionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {emotionDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distortion Frequency */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Частота искажений</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={distortionFrequency} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis type="number" stroke="#737373" fontSize={12} />
                <YAxis dataKey="name" type="category" width={120} stroke="#737373" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#4a6fa5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
