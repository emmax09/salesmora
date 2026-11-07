import type { Metadata } from 'next';
import { Badge, PageHeader } from '@salesmora/ui';
import { MarketingCta } from '../../../features/marketing/marketing-cta';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'A proposed Salesmora workflow, from shared customer context to reviewed next steps.',
};
const steps = [
  {
    title: 'Bring the context together',
    text: 'A shared workspace is intended to connect customer conversations with relevant records and opportunity context.',
  },
  {
    title: 'Make the next step visible',
    text: 'Teams should be able to see who owns a follow-up, what was promised, and when it is due.',
  },
  {
    title: 'Use assistance with review',
    text: 'AI suggestions should be grounded in approved context and remain drafts until a person approves an action.',
  },
  {
    title: 'Learn from the workflow',
    text: 'Planned analytics will help teams review their work once the underlying business modules are available.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <PageHeader
          eyebrow="Product approach"
          title="A workflow built around context and ownership"
          description="This is the intended product experience. Salesmora is still in development, and these capabilities are not yet generally available."
        />
        <ol className="mt-12 grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <li className="rounded-card border border-border bg-surface p-6" key={step.title}>
              <Badge>Step 0{index + 1}</Badge>
              <h2 className="mt-5 text-xl font-semibold">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-secondary">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <MarketingCta />
    </>
  );
}
