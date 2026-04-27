import { signInAction, signUpAction } from './actions';

interface Props {
  searchParams: Promise<{ error?: string; message?: string; tab?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const tab = params.tab === 'signup' ? 'signup' : 'login';

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo / Title */}
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">🏰</div>
          <h1 className="text-2xl font-bold text-brand-navy">Family Learning World</h1>
          <p className="mt-1 text-sm text-slate-500">Parent portal</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
          <a
            href="/auth/login"
            className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition ${
              tab === 'login' ? 'bg-white shadow text-brand-navy' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </a>
          <a
            href="/auth/login?tab=signup"
            className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition ${
              tab === 'signup' ? 'bg-white shadow text-brand-navy' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create Account
          </a>
        </div>

        {/* Error / Success Messages */}
        {params.error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            {params.error}
          </div>
        )}
        {params.message && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
            {params.message}
          </div>
        )}

        {/* Sign In Form */}
        {tab === 'login' && (
          <form action={signInAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="parent@example.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-navy py-2.5 font-semibold text-white hover:bg-blue-900 transition"
            >
              Sign In
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {tab === 'signup' && (
          <form action={signUpAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="parent@example.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                placeholder="8+ characters"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-mint py-2.5 font-semibold text-slate-900 hover:opacity-90 transition"
            >
              Create Account
            </button>
            <p className="text-center text-xs text-slate-500">
              You&apos;ll receive a confirmation email to verify your address.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
