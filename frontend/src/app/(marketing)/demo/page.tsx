import type { Metadata } from 'next';
import { PageHeader } from '@salesmora/ui';
import { DemoInteraction } from '../../../features/marketing/demo-interaction';
import { ProductPreview } from '../../../features/marketing/product-preview';

export const metadata: Metadata = {
  title: 'Illustrative demo',
  description: 'Explore local, fictional examples of the Salesmora product direction.',
};

export default function DemoPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <PageHeader
        eyebrow="Interactive preview"
        title="Explore the product direction"
        description="These interactions run locally in your browser with fictional sample content. They do not send messages, change business records, or perform external actions."
      />
      <DemoInteraction />
      <ProductPreview compact />
    </section>
  );
}
