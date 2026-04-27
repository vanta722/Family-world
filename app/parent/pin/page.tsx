import { verifyParentPinAction } from './actions';

export default function ParentPinPage() {
  return (
    <section className="mx-auto max-w-sm rounded-xl bg-white p-6 shadow">
      <h1 className="text-xl font-bold">Parent PIN Check</h1>
      <form action={verifyParentPinAction} className="mt-4 space-y-3">
        <input name="pin" type="password" pattern="[0-9]{4}" maxLength={4} className="w-full rounded border px-3 py-2" />
        <button className="w-full rounded bg-brand-navy px-4 py-2 font-semibold text-white">Enter Dashboard</button>
      </form>
    </section>
  );
}
