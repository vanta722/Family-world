export default function WorldLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-28 rounded-2xl bg-violet-900/20" />
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="h-[520px] rounded-2xl bg-violet-900/20" />
        <div className="space-y-4">
          <div className="h-52 rounded-2xl bg-violet-900/20" />
          <div className="h-48 rounded-2xl bg-violet-900/20" />
        </div>
      </div>
    </div>
  );
}
