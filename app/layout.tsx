import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase/server';
import { signOutAction } from '@/app/auth/login/actions';

export const metadata: Metadata = {
  title: 'Family Learning World',
  description: 'Private family learning game MVP'
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
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-bold text-brand-navy">
              🏰 Family Learning World
            </Link>
            <div className="flex items-center gap-4 text-sm">
              {user ? (
                <>
                  <Link href="/family" className="text-slate-600 hover:text-brand-navy">Family</Link>
                  <Link href="/play" className="text-slate-600 hover:text-brand-navy">Play</Link>
                  <Link href="/parent" className="text-slate-600 hover:text-brand-navy">Parent</Link>
                  <form action={signOutAction}>
                    <button type="submit" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition">
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/auth/login" className="rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-900 transition">
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
