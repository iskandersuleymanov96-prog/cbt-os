export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 rounded-lg bg-secondary" />
          <div className="h-4 w-32 rounded bg-secondary" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-20 rounded-lg bg-secondary" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-secondary/50 border border-white/40" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-secondary/50 border border-white/40" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-72 rounded-2xl bg-secondary/50 border border-white/40" />
        <div className="h-72 rounded-2xl bg-secondary/50 border border-white/40" />
      </div>
    </div>
  )
}
