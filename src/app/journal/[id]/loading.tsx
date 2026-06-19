export default function JournalEntryLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-20 rounded-lg bg-secondary" />
        <div className="flex gap-2">
          <div className="h-8 w-24 rounded-lg bg-secondary" />
          <div className="h-8 w-24 rounded-lg bg-secondary" />
        </div>
      </div>
      <div className="h-4 w-48 rounded bg-secondary" />
      <div className="h-16 w-full rounded-2xl bg-secondary/50 border border-white/40" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-secondary/50 border border-white/40" />
        ))}
      </div>
    </div>
  )
}
