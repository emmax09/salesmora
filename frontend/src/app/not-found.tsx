import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-screen max-w-3xl content-center gap-4 px-5 py-16 sm:px-8">
      <p className="text-sm font-semibold tracking-[0.18em] text-blue-700 uppercase">404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Page not found</h1>
      <p className="max-w-xl leading-7 text-slate-600">
        This address does not match a page in the Salesmora workspace.
      </p>
      <Link
        className="mt-2 w-fit rounded-lg text-sm font-medium text-blue-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
        href="/"
      >
        Return to Salesmora
      </Link>
    </main>
  );
}
