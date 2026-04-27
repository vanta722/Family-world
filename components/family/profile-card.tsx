import Image from 'next/image';

export function ProfileCard({
  id,
  displayName,
  age,
  avatarSeed,
  avatarStyle,
  action,
}: {
  id: string;
  displayName: string;
  age: number;
  avatarSeed: string;
  avatarStyle: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const avatarUrl = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;

  return (
    <form action={action}>
      <input type="hidden" name="profileId" value={id} />
      <button
        type="submit"
        className="group relative w-full overflow-hidden rounded-2xl border border-violet-700/30 p-6 text-center transition-all duration-300 hover:scale-[1.03] hover:border-violet-500/60 hover:shadow-2xl active:scale-[0.97]"
        style={{
          background: 'linear-gradient(135deg,#1e1040 0%,#0d1f3c 50%,#1a0a2e 100%)',
          boxShadow: '0 4px 24px rgba(124,58,237,0.15)',
        }}
      >
        {/* Hover glow sweep */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'radial-gradient(circle at 50% 0%,rgba(124,58,237,0.2),transparent 60%)' }}
        />

        {/* Top accent line */}
        <div
          className="absolute inset-x-0 top-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg,transparent,#A78BFA,#06B6D4,transparent)' }}
        />

        <div className="relative z-10 space-y-4">
          {/* Avatar ring */}
          <div className="relative mx-auto w-fit">
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: '0 0 0 3px rgba(167,139,250,0.5), 0 0 20px rgba(167,139,250,0.4)' }}
            />
            <Image
              src={avatarUrl}
              alt={displayName}
              width={120}
              height={120}
              className="rounded-full bg-violet-900/40 ring-2 ring-violet-700/40 group-hover:ring-brand-plasma/60 transition-all duration-300"
            />
          </div>

          {/* Name & age */}
          <div>
            <h3
              className="text-xl font-black text-white group-hover:text-brand-plasma transition-colors duration-200"
            >
              {displayName}
            </h3>
            <p className="text-sm text-violet-400/60">Age {age}</p>
          </div>

          {/* CTA */}
          <div
            className="mx-auto w-full rounded-xl px-5 py-2.5 text-sm font-black text-white transition-all duration-200 group-hover:shadow-lg"
            style={{
              background: 'linear-gradient(90deg,#7C3AED,#06B6D4)',
              boxShadow: '0 0 0 rgba(124,58,237,0)',
            }}
          >
            ⚔️ Enter Quest
          </div>
        </div>
      </button>
    </form>
  );
}
