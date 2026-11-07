import type { Metadata } from 'next';
import { Card, PageHeader } from '@salesmora/ui';
import { ContactForm } from '../../../features/marketing/contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Send a message to the Salesmora team.',
};

export default function ContactPage() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <PageHeader
        eyebrow="Contact"
        title="Send us a message"
        description="Use this form to share a question or note. Messages are saved for review; a staffed inbox and automatic replies are not configured."
      />
      <Card className="p-5 sm:p-8">
        <ContactForm />
      </Card>
    </section>
  );
}
