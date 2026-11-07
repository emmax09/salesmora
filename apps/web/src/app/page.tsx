import { Card, PageHeader } from '@salesmora/ui';

export default function Home() {
  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
      <a
        className="sr-only rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-950 focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-10 focus:outline-2 focus:outline-blue-700"
        href="#main-content"
      >
        Skip to content
      </a>
      <div className="flex h-20 items-center justify-between border-b border-slate-200">
        <a aria-label="Salesmora home" className="flex items-center gap-3" href="#main-content">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-xl bg-slate-950 text-sm font-semibold text-white"
          >
            S
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-950">Salesmora</span>
        </a>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
          Project foundation
        </span>
      </div>

      <section className="flex flex-1 flex-col justify-center py-16 sm:py-24">
        <PageHeader
          eyebrow="Salesmora workspace"
          title="A stronger foundation for connected work."
          description="The application shell is ready for the first product workflows. This page is a starting point, not an active sales dashboard."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Card>
            <p className="text-sm font-medium text-blue-700">Phase 1</p>
            <h2 className="mt-3 text-lg font-semibold text-slate-950">Project foundation</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Shared packages, API boundaries, local database tooling, and quality checks are being
              put in place.
            </p>
          </Card>
          <Card className="flex flex-col justify-center border-dashed bg-slate-50/70 shadow-none">
            <h2 className="text-lg font-semibold text-slate-950">Ready for the first workflow</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              No customer or pipeline data is shown here. Product features will arrive in a reviewed
              sequence.
            </p>
          </Card>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-5 text-xs text-slate-500">
        Salesmora · Built for connected business work
      </footer>
    </main>
  );
}
