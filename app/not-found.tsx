import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-violet-700/40 text-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg,#0f0a1e,#0d1f3c)' }}
      >
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,transparent,#A78BFA,#06B6D4,transparent)' }} />
        <div className="px-8 py-12 space-y-5">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-violet-600/40 text-5xl"
            style={{ background: 'linear-gradient(135deg,#1e1040,#0d1f3c)' }}
          >
            🗺️
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-violet-500/60">404 — Zone Not Found</p>
            <h1 className="mt-1 text-3xl font-black text-white">Lost in the Kingdom</h1>
            <p className="mt-2 text-sm text-violet-300/50">
              This part of the Crystal Kingdom doesn&apos;t exist yet. The map ends here.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/world"
              className="w-full rounded-xl py-3 text-sm font-black text-white transition hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(90deg,#7C3AED,#06B6D4)' }}
            >
              🗺️ Return to World Map
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-violet-700/40 bg-violet-900/20 py-3 text-sm font-bold text-violet-300 transition hover:bg-violet-800/30"
            >
              ← Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
