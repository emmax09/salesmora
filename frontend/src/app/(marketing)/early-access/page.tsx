import type { Metadata } from 'next';
import { Card, PageHeader } from '@salesmora/ui';
import { EarlyAccessForm } from '../../../features/marketing/early-access-form';

export const metadata: Metadata = {
  title: 'Request early access',
  description: 'Register interest in trying Salesmora as it develops.',
};

export default function EarlyAccessPage() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <PageHeader
        eyebrow="Early access"
        title="Help shape what comes next"
        description="Salesmora is in development. Share your details and the workflow you care about; we’ll keep your request for early access."
      />
      <Card className="p-5 sm:p-8">
        <EarlyAccessForm />
      </Card>
    </section>
  );
}
