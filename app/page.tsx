import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-4 rounded-xl bg-white p-6 shadow">
      <h1 className="text-3xl font-bold text-brand-navy">Family Learning World MVP</h1>
      <p>Private family app with kid play routes and parent approvals.</p>
      <div className="flex gap-3">
        <Link href="/family" className="rounded bg-brand-mint px-4 py-2 font-semibold text-slate-900">
          Go to Family Picker
        </Link>
        <Link href="/parent" className="rounded bg-brand-lilac px-4 py-2 font-semibold text-slate-900">
          Open Parent Dashboard
        </Link>
      </div>
    </section>
  );
}
