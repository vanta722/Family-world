import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Family Learning World',
  description: 'Private family learning game MVP'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-bold text-brand-navy">
              Family Learning World
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/family">Family</Link>
              <Link href="/play">Play</Link>
              <Link href="/parent">Parent</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
