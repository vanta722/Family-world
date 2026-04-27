import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase/server';
import { signOutAction } from '@/app/auth/login/actions';

export const metadata: Metadata = {
  title: 'Family Learning World',
  description: 'Private family cinematic learning adventure'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // not authenticated — fine
  }

  return (
    <html lang="en">
      <body>
        {/* ── Navigation ── */}
        <header
          className="sticky top-0 z-40 border-b border-violet-800/30 backdrop-blur-md"
          style={{ background: 'rgba(7,4,18,0.85)' }}
        >
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-black tracking-tight text-white transition-opacity hover:opacity-80"
            >
              <span
                className="text-sm font-black uppercase tracking-widest"
                style={{
                  background: 'linear-gradient(90deg,#A78BFA,#06B6D4,#FBBF24)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                🏰 Family Learning World
              </span>
            </Link>

            <div className="flex items-center gap-2 text-sm">
              {user ? (
                <>
                  <Link
                    href="/family"
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-violet-300/80 transition hover:bg-violet-800/30 hover:text-violet-200"
                  >
                    Heroes
                  </Link>
                  <Link
                    href="/play"
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-violet-300/80 transition hover:bg-violet-800/30 hover:text-violet-200"
                  >
                    Play
                  </Link>
                  <Link
                    href="/parent"
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-violet-300/80 transition hover:bg-violet-800/30 hover:text-violet-200"
                  >
                    👑 Council
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="rounded-lg border border-violet-700/40 bg-violet-900/30 px-3 py-1.5 text-xs font-medium text-violet-400 transition hover:border-violet-600/60 hover:bg-violet-800/40 hover:text-violet-200"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="rounded-xl px-4 py-2 text-xs font-black text-white transition hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(90deg,#7C3AED,#06B6D4)' }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>

          {/* Glow underline */}
          <div
            className="absolute bottom-0 inset-x-0 h-px opacity-50"
            style={{ background: 'linear-gradient(90deg,transparent,#7C3AED 30%,#06B6D4 70%,transparent)' }}
          />
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
