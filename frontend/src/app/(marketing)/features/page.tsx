import type { Metadata } from 'next';
import { PageHeader } from '@salesmora/ui';
import { CapabilityList } from '../../../features/marketing/capability-list';
import { MarketingCta } from '../../../features/marketing/marketing-cta';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Planned Salesmora capabilities for conversations, sales work, commitments, and AI assistance.',
};

export default function FeaturesPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <PageHeader
          eyebrow="Planned capabilities"
          title="The pieces of customer work, connected"
          description="Salesmora is being developed in stages. The following capability areas are a product vision, not a list of currently available features."
        />
        <CapabilityList />
      </section>
      <MarketingCta
        title="Which workflow matters most to you?"
        description="Request early access and tell us what your team needs to keep customer work moving."
      />
    </>
  );
}
