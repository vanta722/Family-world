export default function ParentLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-36 rounded-3xl bg-violet-900/20" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-2xl bg-violet-900/20" />)}
      </div>
      {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl bg-violet-900/20" />)}
    </div>
  );
}
