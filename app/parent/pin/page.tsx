import { verifyParentPinAction } from './actions';

export default function ParentPinPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0"
           style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(183,148,244,0.07) 0%, transparent 65%)' }} />

      <div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-violet-700/40 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg,#1e1040 0%,#0d1f3c 60%,#1a0a2e 100%)',
          boxShadow: '0 0 60px rgba(183,148,244,0.12), 0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Top accent */}
        <div className="h-1 w-full"
             style={{ background: 'linear-gradient(90deg,transparent,#B794F4 30%,#06B6D4 70%,transparent)' }} />

        <div className="px-8 py-10 text-center space-y-6">
          {/* Icon */}
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 -m-3 rounded-full animate-pulse-ring border-2 border-brand-lilac/30" />
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-violet-600/50 text-4xl shadow-xl"
              style={{ background: 'linear-gradient(135deg,#2e1065,#0d1f3c)' }}
            >
              👑
            </div>
          </div>

          {/* Title */}
          <div>
            <h1
              className="text-2xl font-black"
              style={{
                background: 'linear-gradient(90deg,#B794F4,#06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Royal Council
            </h1>
            <p className="mt-1 text-sm text-violet-400/60">Enter your 4-digit Parent PIN to continue</p>
          </div>

          {/* PIN form */}
          <form action={verifyParentPinAction} className="space-y-4">
            <input
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              placeholder="• • • •"
              required
              className="w-full rounded-2xl border border-violet-700/40 bg-violet-900/20 px-5 py-4 text-center text-2xl font-black tracking-[0.5em] text-white placeholder-violet-600/40 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              type="submit"
              className="w-full rounded-2xl py-3.5 text-base font-black text-white shadow-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-brand-lilac/20 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#B794F4)' }}
            >
              ⚡ Enter the Council Chambers
            </button>
          </form>

          <p className="text-xs text-violet-600/40">
            Set your PIN during household setup · 4 digits only
          </p>
        </div>
      </div>
    </div>
  );
}
