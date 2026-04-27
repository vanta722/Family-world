'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Family Learning World]', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-red-700/40 text-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg,#1a0a0e,#1a0a2e)' }}
      >
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,transparent,#EF4444,transparent)' }} />
        <div className="px-8 py-10 space-y-5">
          <div className="text-5xl">⚔️</div>
          <div>
            <h1 className="text-2xl font-black text-white">Something went wrong</h1>
            <p className="mt-1 text-sm text-red-300/60">
              The Shadow Wizard disrupted the spell.
              {error.digest && <span className="block mt-1 font-mono text-xs text-red-500/40">ref: {error.digest}</span>}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="w-full rounded-xl py-3 text-sm font-black text-white transition hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(90deg,#7C3AED,#06B6D4)' }}
            >
              ⚡ Try Again
            </button>
            <Link
              href="/"
              className="rounded-xl border border-violet-700/40 bg-violet-900/20 py-3 text-sm font-bold text-violet-300 transition hover:bg-violet-800/30"
            >
              ← Return to Kingdom
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
