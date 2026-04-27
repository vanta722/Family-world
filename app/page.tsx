import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-[80vh] space-y-0">
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl px-8 py-20 text-center shadow-2xl"
        style={{
          background: 'linear-gradient(135deg,#0f0a1e 0%,#1a0a2e 40%,#0d1f3c 70%,#051020 100%)',
          boxShadow: '0 0 80px rgba(124,58,237,0.3), 0 0 40px rgba(6,182,212,0.1)',
        }}
      >
        {/* Stars */}
        {[
          [8,12,2.5,0.7], [18,35,1.5,0.4], [30,8,2,0.9], [45,55,1,0.5],
          [60,20,2.5,0.8], [72,45,1.5,0.6], [85,15,2,0.7], [92,60,1,0.3],
          [15,70,1.5,0.5], [55,80,2,0.6], [78,75,1,0.4], [38,42,2.5,0.8],
        ].map(([l, t, s, o], i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${l}%`, top: `${t}%`,
              width: s, height: s, opacity: o,
              animation: `star-twinkle ${2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}

        {/* Glow orbs */}
        <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle,#7C3AED,transparent)' }} />
        <div className="pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle,#06B6D4,transparent)' }} />

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-brand-neon/80">
              ✦ An Epic Adventure Awaits ✦
            </p>
            <h1 className="text-5xl font-black text-white drop-shadow-lg sm:text-6xl"
                style={{ textShadow: '0 0 40px rgba(167,139,250,0.6)' }}>
              Family
            </h1>
            <h1
              className="text-5xl font-black sm:text-6xl"
              style={{
                background: 'linear-gradient(90deg,#A78BFA,#06B6D4,#FBBF24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
              }}
            >
              Learning World
            </h1>
          </div>

          <p className="mx-auto max-w-md text-base text-violet-200/70">
            Enter the Crystal Kingdom — where every answer breaks a spell, every streak earns glory,
            and every child becomes a legend.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-violet-500/60" />
            <span className="text-violet-400/60 text-sm">⚔️</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-violet-500/60" />
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/family"
              className="relative overflow-hidden rounded-2xl px-8 py-4 text-base font-black text-white shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95"
              style={{
                background: 'linear-gradient(135deg,#7C3AED,#06B6D4)',
                boxShadow: '0 0 20px rgba(124,58,237,0.5)',
              }}
            >
              <span className="relative z-10">⚔️ Enter the Kingdom</span>
              <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors" />
            </Link>
            <Link
              href="/parent"
              className="rounded-2xl border border-violet-700/50 bg-violet-900/30 px-8 py-4 text-base font-bold text-violet-300 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-violet-500/70 hover:bg-violet-800/40 active:scale-95"
            >
              👑 Parent Council
            </Link>
          </div>
        </div>
      </div>

      {/* ── Feature pillars ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 pt-6 sm:grid-cols-3">
        {[
          {
            icon:  '🧙‍♂️',
            title: 'Battle Wizards',
            desc:  'Solve math riddles to shatter Crystal Gates and defeat Shadow Wizards guarding your kingdom.',
            glow:  '#7C3AED',
          },
          {
            icon:  '✨',
            title: 'Earn Tokens',
            desc:  'Every correct answer earns Royal Tokens — redeem them for real-world rewards your parents create.',
            glow:  '#F59E0B',
          },
          {
            icon:  '🔥',
            title: 'Build Combos',
            desc:  'Chain correct answers into legendary COMBO streaks. Three in a row unleashes a power strike!',
            glow:  '#EF4444',
          },
        ].map(({ icon, title, desc, glow }) => (
          <div
            key={title}
            className="group relative overflow-hidden rounded-2xl border border-violet-800/30 p-6 transition-all duration-300 hover:border-violet-600/50 hover:shadow-xl hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg,#0d0820,#0a1830)' }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
              style={{ background: `radial-gradient(circle at 50% 0%,${glow},transparent)` }}
            />
            <div className="text-4xl mb-3">{icon}</div>
            <h3
              className="mb-2 text-lg font-black"
              style={{
                background: `linear-gradient(90deg,${glow},#a78bfa)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {title}
            </h3>
            <p className="text-sm text-violet-300/60 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
