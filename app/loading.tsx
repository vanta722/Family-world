export default function RootLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 rounded-3xl bg-violet-900/20" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl bg-violet-900/20" />)}
      </div>
    </div>
  );
}
