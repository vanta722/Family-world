import Image from 'next/image';

export function ProfileCard({
  id,
  displayName,
  age,
  avatarSeed,
  avatarStyle,
  action
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
    <form action={action} className="rounded-2xl bg-white p-5 shadow transition hover:shadow-lg">
      <input type="hidden" name="profileId" value={id} />
      <div className="space-y-4 text-center">
        <Image src={avatarUrl} alt={displayName} width={120} height={120} className="mx-auto rounded-full bg-slate-100" />
        <div>
          <h3 className="text-xl font-bold">{displayName}</h3>
          <p className="text-sm text-slate-600">Age {age}</p>
        </div>
        <button className="w-full rounded-lg bg-brand-mint px-4 py-2 font-semibold">Play</button>
      </div>
    </form>
  );
}
