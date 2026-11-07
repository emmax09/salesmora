'use client';

import type { InvitationSummary } from '@salesmora/api-client';

export function InvitationRow({
  invitation,
  canManage,
  onRevoke,
  onResend,
}: {
  invitation: InvitationSummary;
  canManage: boolean;
  onRevoke: (invitation: InvitationSummary) => void;
  onResend: (invitation: InvitationSummary) => void;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{invitation.email}</p>
        <p className="mt-1 text-xs text-slate-500">
          {invitation.role} · invited by {invitation.invitedByName}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {invitation.deliveryStatus === 'ACCEPTED_BY_SMTP'
            ? 'SMTP accepted the message; delivery is not confirmed.'
            : 'Email was not accepted by SMTP. You can retry.'}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {invitation.status === 'EXPIRED'
            ? 'Expired'
            : `Expires ${new Date(invitation.expiresAt).toLocaleDateString()}`}
        </p>
      </div>
      {canManage && (
        <div className="flex gap-2">
          {invitation.status === 'PENDING' && (
            <button
              className="min-h-9 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50"
              onClick={() => onRevoke(invitation)}
              type="button"
            >
              Revoke
            </button>
          )}
          <button
            className="min-h-9 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => onResend(invitation)}
            type="button"
          >
            {invitation.deliveryStatus === 'FAILED' ? 'Retry email' : 'Resend'}
          </button>
        </div>
      )}
    </li>
  );
}
