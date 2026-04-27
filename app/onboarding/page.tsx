import { createHouseholdAction } from '@/app/family/actions';

export default function OnboardingPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0"
           style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(6,182,212,0.07) 0%, transparent 60%)' }} />

      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-violet-700/40 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg,#0f0a1e 0%,#0d1f3c 60%,#1a0a2e 100%)',
          boxShadow: '0 0 80px rgba(6,182,212,0.1), 0 25px 50px rgba(0,0,0,0.6)',
        }}
      >
        {/* Accent line */}
        <div className="h-1 w-full"
             style={{ background: 'linear-gradient(90deg,transparent,#06B6D4 30%,#A78BFA 70%,transparent)' }} />

        <div className="px-8 py-10 space-y-7">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-600/40 text-4xl shadow-xl"
                 style={{ background: 'linear-gradient(135deg,#052e3e,#0d1f3c)' }}>
              🏰
            </div>
            <div>
              <h1
                className="text-3xl font-black"
                style={{
                  background: 'linear-gradient(90deg,#06B6D4,#A78BFA)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Found Your Kingdom
              </h1>
              <p className="mt-1.5 text-sm text-violet-400/60">
                Give your household a name and set a 4-digit PIN. This becomes your private family world.
              </p>
            </div>
          </div>

          {/* Form */}
          <form action={createHouseholdAction} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-cyan-400/70">
                Kingdom Name
              </label>
              <input
                name="householdName"
                required
                placeholder="e.g. The Smith Family Kingdom"
                className="w-full rounded-xl border border-violet-700/40 bg-violet-900/20 px-4 py-3.5 text-sm text-white placeholder-violet-600/40 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
              />
              <p className="mt-1 text-xs text-violet-500/40">This name appears throughout the game world</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-cyan-400/70">
                Parent PIN (4 digits)
              </label>
              <input
                name="pin"
                required
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                placeholder="• • • •"
                className="w-full rounded-xl border border-violet-700/40 bg-violet-900/20 px-4 py-3.5 text-center text-xl font-black tracking-[0.5em] text-white placeholder-violet-600/40 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
              />
              <p className="mt-1 text-xs text-violet-500/40">Used to access the Parent Council dashboard</p>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl py-4 text-base font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#0891b2,#7C3AED)' }}
            >
              ⚡ Create My Kingdom
            </button>
          </form>

          {/* Reassurance footer */}
          <div className="rounded-xl border border-violet-800/20 bg-violet-900/10 px-4 py-3 text-xs text-violet-500/50 space-y-1">
            <p>🔒 Your PIN is stored as a secure hash — never plain text</p>
            <p>🏠 Your data is private to your household only</p>
            <p>👧 Add child profiles after setup from the Heroes screen</p>
          </div>
        </div>
      </div>
    </div>
  );
}
