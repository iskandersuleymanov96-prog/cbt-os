export default function AILoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-pulse">
      <div className="mb-4 space-y-2">
        <div className="h-8 w-40 rounded-lg bg-secondary" />
        <div className="h-4 w-56 rounded bg-secondary" />
      </div>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-48 rounded-lg bg-secondary" />
        ))}
      </div>
      <div className="flex-1 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-end" : ""}`}>
            <div className="h-20 w-64 rounded-2xl bg-secondary/50" />
          </div>
        ))}
      </div>
    </div>
  )
}
