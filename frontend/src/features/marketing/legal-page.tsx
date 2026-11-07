import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Badge } from '@salesmora/ui';

export const legalApproved = process.env.NEXT_PUBLIC_LEGAL_PAGES_APPROVED === 'true';
export const legalRobots: Metadata['robots'] = legalApproved
  ? { index: true, follow: true }
  : { index: false, follow: false };

export function requireApprovedLegalCopy() {
  if (process.env.NODE_ENV === 'production' && !legalApproved) notFound();
}

export function LegalDraftNotice() {
  return legalApproved ? null : (
    <div className="mb-8 rounded-card border border-warning/30 bg-warning-bg p-4">
      <Badge tone="warning">Draft for review</Badge>
      <p className="mt-2 text-sm leading-6 text-secondary">
        This page is a product draft and has not been approved as a legal policy. It is not
        published in production until an authorized reviewer approves the copy.
      </p>
    </div>
  );
}
