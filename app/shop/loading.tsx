export default function ShopLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-44 rounded-3xl bg-amber-900/20" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-36 rounded-2xl bg-violet-900/20" />)}
      </div>
    </div>
  );
}
