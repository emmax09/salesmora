import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@salesmora/ui';
import { ProductPreview } from '../../features/marketing/product-preview';
import { MarketingCta } from '../../features/marketing/marketing-cta';

export const metadata: Metadata = {
  title: 'A clearer view of customer work',
  description:
    'Salesmora brings customer conversations, sales follow-up, and business commitments into one connected workspace vision.',
};

const themes = [
  {
    title: 'Conversations lose their context',
    description: 'Customer details and the next step can live in too many places.',
  },
  {
    title: 'Ownership is easy to miss',
    description: 'Teams need a shared view of who is following up and when.',
  },
  {
    title: 'Automation needs guardrails',
    description: 'Useful AI assistance should keep people in control of important actions.',
  },
];

export default function Home() {
  return (
    <>
      <section className="bg-brand-deep px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge className="border-white/20 bg-white/10 text-white">
              Early product · in development
            </Badge>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              See the whole customer journey.{' '}
              <span className="text-brand">Choose the next step.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Salesmora is being built as a connected workspace for customer conversations, sales
              follow-up, and business execution—with human approval around important actions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center rounded-control bg-action px-5 font-semibold text-action-foreground hover:bg-action-hover"
                href="/early-access"
              >
                Request early access
              </Link>
              <Link
                className="inline-flex min-h-12 items-center rounded-control border border-white/25 px-5 font-semibold text-white hover:bg-white/10"
                href="/demo"
              >
                Explore the preview
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/60">
              The product is not generally available. Preview content is illustrative.
            </p>
          </div>
          <ProductPreview />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-action">
          The problem we’re working on
        </p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
          Customer work is connected. The tools often aren’t.
        </h2>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {themes.map((item, index) => (
            <article className="rounded-card border border-border bg-surface p-5" key={item.title}>
              <span className="text-sm font-semibold text-action">0{index + 1}</span>
              <h3 className="mt-5 text-lg font-semibold text-primary">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-secondary">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="border-y border-border bg-surface px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-9 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-action">
              One connected workspace
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              Keep context close to the work.
            </h2>
            <p className="mt-4 text-base leading-7 text-secondary">
              The product direction connects conversations, customer records, opportunities,
              follow-up, and carefully scoped AI assistance. These capabilities are in development.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center font-semibold text-action underline-offset-4 hover:underline"
              href="/product"
            >
              See the product direction →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Inbox and customer context',
              'Sales opportunities and follow-up',
              'Guardian commitment review',
              'AI suggestions with approval',
            ].map((label) => (
              <div className="rounded-card border border-border bg-canvas p-5" key={label}>
                <Badge tone="warning">Planned</Badge>
                <h3 className="mt-4 font-semibold text-primary">{label}</h3>
                <p className="mt-2 text-sm text-secondary">
                  Designed to keep owners, context, and next steps visible.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-action">
              A considered workflow
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary">
              From context to next step.
            </h2>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3 md:col-span-2">
            {[
              'Bring customer context together',
              'Make ownership and commitments clear',
              'Review suggestions before action',
            ].map((step, i) => (
              <li className="border-t-2 border-action pt-4" key={step}>
                <span className="text-xs font-semibold text-muted">STEP 0{i + 1}</span>
                <p className="mt-3 font-medium leading-6 text-primary">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <MarketingCta />
    </>
  );
}
