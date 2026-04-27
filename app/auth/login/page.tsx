import { signInAction, signUpAction } from './actions';

interface Props {
  searchParams: Promise<{ error?: string; message?: string; tab?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const tab = params.tab === 'signup' ? 'signup' : 'login';

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0"
           style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.08) 0%, transparent 60%)' }} />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-violet-700/40 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg,#0f0a1e 0%,#0d1f3c 60%,#1a0a2e 100%)',
          boxShadow: '0 0 80px rgba(124,58,237,0.12), 0 25px 50px rgba(0,0,0,0.6)',
        }}
      >
        {/* Rainbow top line */}
        <div className="h-1 w-full"
             style={{ background: 'linear-gradient(90deg,transparent,#7C3AED 25%,#06B6D4 50%,#FBBF24 75%,transparent)' }} />

        <div className="px-8 py-10 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-violet-600/40 text-4xl shadow-xl"
                 style={{ background: 'linear-gradient(135deg,#1e1040,#0d1f3c)' }}>
              🏰
            </div>
            <h1 className="text-2xl font-black text-white">Family Learning World</h1>
            <p className="text-sm text-violet-400/60">Parent portal — sign in to manage your kingdom</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl border border-violet-800/40 bg-violet-900/20 p-1">
            <a
              href="/auth/login"
              className={`flex-1 rounded-lg py-2.5 text-center text-sm font-black transition-all ${
                tab === 'login'
                  ? 'bg-violet-700/70 text-white shadow'
                  : 'text-violet-400/60 hover:text-violet-300'
              }`}
            >
              Sign In
            </a>
            <a
              href="/auth/login?tab=signup"
              className={`flex-1 rounded-lg py-2.5 text-center text-sm font-black transition-all ${
                tab === 'signup'
                  ? 'bg-violet-700/70 text-white shadow'
                  : 'text-violet-400/60 hover:text-violet-300'
              }`}
            >
              Create Account
            </a>
          </div>

          {/* Alerts */}
          {params.error && (
            <div className="rounded-xl border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">
              ⚠️ {params.error}
            </div>
          )}
          {params.message && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-300">
              ✅ {params.message}
            </div>
          )}

          {/* Sign In */}
          {tab === 'login' && (
            <form action={signInAction} className="space-y-4">
              <Field label="Email" name="email" type="email" placeholder="parent@example.com" autoComplete="email" />
              <Field label="Password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />
              <button
                type="submit"
                className="w-full rounded-xl py-3.5 text-base font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)' }}
              >
                ⚡ Enter the Kingdom
              </button>
            </form>
          )}

          {/* Sign Up */}
          {tab === 'signup' && (
            <form action={signUpAction} className="space-y-4">
              <Field label="Email" name="email" type="email" placeholder="parent@example.com" autoComplete="email" />
              <Field label="Password" name="password" type="password" placeholder="8+ characters" autoComplete="new-password" minLength={8} />
              <button
                type="submit"
                className="w-full rounded-xl py-3.5 text-base font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#059669,#06B6D4)' }}
              >
                🏰 Found Your Kingdom
              </button>
              <p className="text-center text-xs text-violet-500/50">
                A confirmation email will be sent to verify your address.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label, name, type, placeholder, autoComplete, minLength,
}: {
  label: string; name: string; type: string; placeholder: string; autoComplete?: string; minLength?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-violet-400/70">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={minLength}
        className="w-full rounded-xl border border-violet-700/40 bg-violet-900/20 px-4 py-3 text-sm text-white placeholder-violet-600/40 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
      />
    </div>
  );
}
