import type { Metadata } from 'next';
import { PageHeader } from '@salesmora/ui';
import {
  LegalDraftNotice,
  legalRobots,
  requireApprovedLegalCopy,
} from '../../../features/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Privacy notice',
  robots: legalRobots,
  description: 'Draft privacy notice for Salesmora pre-launch forms.',
};

export default function PrivacyPage() {
  requireApprovedLegalCopy();
  return (
    <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <LegalDraftNotice />
      <PageHeader
        eyebrow="Privacy"
        title="Privacy notice"
        description="Draft · last reviewed 7 November 2026"
      />
      <div className="mt-10 space-y-8 text-sm leading-7 text-secondary">
        <section>
          <h2 className="text-lg font-semibold text-primary">
            Information collected through this site
          </h2>
          <p className="mt-2">
            If you request early access, we collect the name, email address, optional organization
            and interest area you submit, plus the consent timestamp and version. If you send a
            contact message, we store your name, email, subject, and message.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-primary">Why it is used</h2>
          <p className="mt-2">
            These details are stored so the Salesmora team can review requests and, where
            appropriate, contact people about early access or their message. Confirmation emails, a
            staffed support inbox, and automated marketing delivery are not configured.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-primary">Storage and retention</h2>
          <p className="mt-2">
            Submissions are stored in the Salesmora application database. A retention schedule and
            automated deletion process have not been configured. Access, deletion, and privacy
            request handling need operational review before launch.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-primary">Contact and changes</h2>
          <p className="mt-2">
            This draft does not specify a legal entity, privacy contact, or jurisdiction. Those
            details must be supplied and reviewed before production publication. The page should be
            updated when collection, delivery, or retention practices change.
          </p>
        </section>
      </div>
    </article>
  );
}
