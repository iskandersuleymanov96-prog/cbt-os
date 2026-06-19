export default function DistortionDetailLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="h-10 w-40 rounded-lg bg-secondary" />
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-2xl bg-secondary" />
        <div className="space-y-2 flex-1">
          <div className="h-8 w-48 rounded-lg bg-secondary" />
          <div className="h-4 w-64 rounded bg-secondary" />
        </div>
      </div>
      <div className="h-40 rounded-2xl bg-secondary/50 border border-white/40" />
      <div className="h-32 rounded-2xl bg-secondary/50 border border-white/40" />
      <div className="h-12 w-full rounded-xl bg-secondary" />
    </div>
  )
}
