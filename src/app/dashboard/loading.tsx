export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-secondary" />
          <div className="h-4 w-32 rounded bg-secondary" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-secondary" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-secondary/50 border border-white/40" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-64 rounded-2xl bg-secondary/50 border border-white/40" />
        <div className="h-64 rounded-2xl bg-secondary/50 border border-white/40" />
      </div>
      <div className="h-48 rounded-2xl bg-secondary/50 border border-white/40" />
    </div>
  )
}
