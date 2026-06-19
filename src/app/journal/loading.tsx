export default function JournalLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-24 rounded-lg bg-secondary" />
          <div className="h-4 w-20 rounded bg-secondary" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-secondary" />
      </div>
      <div className="h-10 w-full rounded-lg bg-secondary" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-secondary/50 border border-white/40" />
        ))}
      </div>
    </div>
  )
}
