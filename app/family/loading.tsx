export default function FamilyLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-36 rounded-3xl bg-violet-900/20" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-56 rounded-2xl bg-violet-900/20" />)}
      </div>
    </div>
  );
}
