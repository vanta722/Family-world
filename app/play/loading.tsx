export default function PlayLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* HUD skeleton */}
      <div className="h-20 rounded-2xl bg-violet-900/20" />
      {/* Arena skeleton */}
      <div className="h-72 rounded-3xl bg-violet-900/20" />
      {/* Riddle card */}
      <div className="h-20 rounded-2xl bg-violet-900/20" />
      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-xl bg-violet-900/20" />)}
      </div>
    </div>
  );
}
