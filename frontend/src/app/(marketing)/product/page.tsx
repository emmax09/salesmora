import type { Metadata } from 'next';
import { PageHeader } from '@salesmora/ui';
import { ProductPreview } from '../../../features/marketing/product-preview';
import { CapabilityList } from '../../../features/marketing/capability-list';
import { MarketingCta } from '../../../features/marketing/marketing-cta';

export const metadata: Metadata = {
  title: 'Product',
  description:
    'Explore the planned Salesmora workspace. Capabilities shown are illustrative and in development.',
};

export default function ProductPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <PageHeader
          eyebrow="Product direction"
          title="A connected workspace for customer work"
          description="Salesmora is in development. Explore an illustrative view of how customer context, sales follow-up, and carefully governed assistance may fit together."
        />
        <ProductPreview />
        <div className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold">Planned capability areas</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              These areas describe the product direction and are not available as working modules
              today.
            </p>
          </div>
          <CapabilityList />
        </div>
      </section>
      <MarketingCta />
    </>
  );
}
