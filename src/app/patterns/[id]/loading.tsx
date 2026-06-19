export default function PatternDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-20 rounded-lg bg-secondary" />
        <div className="h-9 w-40 rounded-lg bg-secondary" />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-secondary" />
        <div className="flex gap-4">
          <div className="h-4 w-24 rounded bg-secondary" />
          <div className="h-4 w-24 rounded bg-secondary" />
        </div>
      </div>
      <div className="h-20 rounded-2xl bg-secondary/50 border border-white/40" />
      <div className="h-64 rounded-2xl bg-secondary/50 border border-white/40" />
    </div>
  )
}
