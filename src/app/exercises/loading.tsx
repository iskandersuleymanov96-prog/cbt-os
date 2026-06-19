export default function ExercisesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-32 rounded-lg bg-secondary" />
        <div className="h-4 w-48 rounded bg-secondary" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 rounded-lg bg-secondary" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-secondary/50 border border-white/40" />
        ))}
      </div>
    </div>
  )
}
