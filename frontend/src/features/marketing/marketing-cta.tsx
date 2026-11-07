import Link from 'next/link';

export function MarketingCta({
  title = 'Help shape the first release',
  description = 'Request early access and tell us which parts of your customer workflow matter most.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="bg-brand-deep px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-3 text-base leading-7 text-white/75">{description}</p>
        </div>
        <Link
          className="inline-flex min-h-12 items-center rounded-control bg-action px-5 font-semibold text-action-foreground hover:bg-action-hover"
          href="/early-access"
        >
          Request early access
        </Link>
      </div>
    </section>
  );
}
