export default function SettingsLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-32 rounded-lg bg-secondary" />
        <div className="h-4 w-48 rounded bg-secondary" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-9 w-24 rounded-lg bg-secondary" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-secondary/50 border border-white/40" />
      <div className="h-48 rounded-2xl bg-secondary/50 border border-white/40" />
    </div>
  )
}
