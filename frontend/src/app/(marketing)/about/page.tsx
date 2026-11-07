import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, PageHeader } from '@salesmora/ui';

export const metadata: Metadata = {
  title: 'About Salesmora',
  description: 'Learn about the product principles guiding Salesmora.',
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <PageHeader
        eyebrow="About"
        title="Make customer work easier to follow"
        description="Salesmora is an early-stage product being built to connect the context, commitments, and decisions that move customer relationships forward."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Clarity before complexity</h2>
          <p className="mt-3 text-sm leading-6 text-secondary">
            The product is being built around practical team workflows: shared context, visible
            ownership, and understandable next steps.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">People stay in control</h2>
          <p className="mt-3 text-sm leading-6 text-secondary">
            AI features are planned as assistance. Important external actions should require the
            right permission and human approval.
          </p>
        </Card>
      </div>
      <Card className="bg-surface-muted">
        <h2 className="text-lg font-semibold">Where the product stands</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">
          Account, organization, and workspace foundations are available in the current development
          environment. Business modules are still being built, and there is no public production
          launch to announce.
        </p>
        <Link
          className="mt-4 inline-flex font-semibold text-action underline-offset-4 hover:underline"
          href="/early-access"
        >
          Request early access →
        </Link>
      </Card>
    </section>
  );
}
