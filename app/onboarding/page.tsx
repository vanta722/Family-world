import { createHouseholdAction } from '@/app/family/actions';

export default function OnboardingPage() {
  return (
    <section className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold">Set up your household</h1>
      <form action={createHouseholdAction} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Household Name</span>
          <input name="householdName" required className="w-full rounded border px-3 py-2" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">4-digit Parent PIN</span>
          <input name="pin" required pattern="[0-9]{4}" maxLength={4} className="w-full rounded border px-3 py-2" />
        </label>
        <button className="w-full rounded bg-brand-navy px-4 py-2 font-semibold text-white">Create Household</button>
      </form>
    </section>
  );
}
