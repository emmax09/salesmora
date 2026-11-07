export default function Loading() {
  return (
    <main aria-busy="true" className="mx-auto min-h-screen w-full max-w-6xl px-5 py-20 sm:px-8">
      <p className="sr-only" role="status">
        Loading Salesmora
      </p>
      <div aria-hidden="true" className="h-4 w-28 animate-pulse rounded bg-slate-200" />
      <div aria-hidden="true" className="mt-6 h-10 w-3/4 animate-pulse rounded bg-slate-200" />
      <div aria-hidden="true" className="mt-3 h-5 w-2/3 animate-pulse rounded bg-slate-100" />
      <div aria-hidden="true" className="mt-10 h-36 rounded-2xl border border-slate-200 bg-white" />
    </main>
  );
}
