import type { Metadata } from 'next';
import { PageHeader } from '@salesmora/ui';
import {
  LegalDraftNotice,
  legalRobots,
  requireApprovedLegalCopy,
} from '../../../features/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Terms of use',
  robots: legalRobots,
  description: 'Draft terms of use for the Salesmora pre-launch website.',
};

export default function TermsPage() {
  requireApprovedLegalCopy();
  return (
    <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <LegalDraftNotice />
      <PageHeader
        eyebrow="Terms"
        title="Terms of use"
        description="Draft · last reviewed 7 November 2026"
      />
      <div className="mt-10 space-y-8 text-sm leading-7 text-secondary">
        <section>
          <h2 className="text-lg font-semibold text-primary">Pre-launch status</h2>
          <p className="mt-2">
            Salesmora is in development. Public product previews use illustrative content and do not
            represent generally available business modules. Requesting early access does not create
            a paid subscription or guarantee access.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-primary">Website use</h2>
          <p className="mt-2">
            Use the website lawfully and do not attempt to interfere with its operation, submit
            malicious content, or access systems without authorization. Contact and early-access
            forms are for genuine inquiries.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-primary">Preview content</h2>
          <p className="mt-2">
            Interactive examples use fictional sample data. They do not send messages, update real
            business records, or execute external actions.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-primary">Details requiring approval</h2>
          <p className="mt-2">
            A legal entity, applicable law, liability terms, dispute process, and effective date
            have not been provided. Authorized legal review and completion of these terms are
            required before production publication.
          </p>
        </section>
      </div>
    </article>
  );
}
