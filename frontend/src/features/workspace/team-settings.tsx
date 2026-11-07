'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiClientError } from '@salesmora/api-client';
import type {
  AssignableOrganizationRole,
  InvitationSummary,
  MemberSummary,
} from '@salesmora/api-client';
import { canAssignOrganizationRole, roleHasPermission } from './role-access';
import { Button, Card, PageHeader } from '@salesmora/ui';
import { salesmoraApi } from '../../lib/api';
import { InvitationRow } from './invitation-row';
import { MemberRow } from './member-row';
import { useWorkspace } from './workspace-context';

const ROLE_OPTIONS: AssignableOrganizationRole[] = ['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'];

export function TeamSettings() {
  const { activeOrganization, identity, refresh } = useWorkspace();
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AssignableOrganizationRole>('MEMBER');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const canInvite = roleHasPermission(activeOrganization.role, 'members:invite');
  const canViewInvitations = roleHasPermission(activeOrganization.role, 'invitations:read');
  const assignableRoles = useMemo(
    () => ROLE_OPTIONS.filter((value) => canAssignOrganizationRole(activeOrganization.role, value)),
    [activeOrganization.role],
  );
  const owners = members.filter((member) => member.role === 'OWNER').length;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const memberResponse = await salesmoraApi.listMembers(activeOrganization.id);
      setMembers(memberResponse.members);
      if (roleHasPermission(activeOrganization.role, 'invitations:read')) {
        const invitationResponse = await salesmoraApi.listInvitations(activeOrganization.id);
        setInvitations(invitationResponse.invitations);
      } else setInvitations([]);
    } catch (caught) {
      setError(
        caught instanceof ApiClientError ? caught.message : 'We could not load team settings.',
      );
    } finally {
      setLoading(false);
    }
  }, [activeOrganization.id, activeOrganization.role]);

  useEffect(() => {
    void load();
  }, [load]);

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const invitation = await salesmoraApi.inviteMember(activeOrganization.id, { email, role });
      setNotice(
        invitation.deliveryStatus === 'ACCEPTED_BY_SMTP'
          ? 'The SMTP server accepted the invitation email. Delivery is not confirmed.'
          : 'The invitation is saved, but the email provider did not accept it. Use Retry email below.',
      );
      setEmail('');
      await load();
    } catch (caught) {
      setError(
        caught instanceof ApiClientError ? caught.message : 'We could not create this invitation.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(member: MemberSummary, nextRole: AssignableOrganizationRole) {
    setError('');
    setNotice('');
    try {
      await salesmoraApi.changeMemberRole(activeOrganization.id, member.id, nextRole);
      setNotice(`${member.name}'s role was changed to ${nextRole}.`);
      await load();
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiClientError ? caught.message : 'We could not update this role.',
      );
    }
  }

  async function removeMember(member: MemberSummary) {
    if (member.role === 'OWNER' && owners <= 1) return;
    if (
      !window.confirm(
        `Remove ${member.name} from ${activeOrganization.name}? Their active workspace sessions will be cleared.`,
      )
    )
      return;
    setError('');
    try {
      await salesmoraApi.removeMember(activeOrganization.id, member.id);
      setNotice(`${member.name} was removed from this organization.`);
      await load();
    } catch (caught) {
      setError(
        caught instanceof ApiClientError ? caught.message : 'We could not remove this member.',
      );
    }
  }

  async function revoke(invitation: InvitationSummary) {
    if (!window.confirm(`Revoke the invitation for ${invitation.email}?`)) return;
    setError('');
    try {
      await salesmoraApi.revokeInvitation(activeOrganization.id, invitation.id);
      setNotice(`Invitation for ${invitation.email} was revoked.`);
      await load();
    } catch (caught) {
      setError(
        caught instanceof ApiClientError ? caught.message : 'We could not revoke this invitation.',
      );
    }
  }

  async function resend(invitation: InvitationSummary) {
    setError('');
    try {
      const result = await salesmoraApi.resendInvitation(activeOrganization.id, invitation.id);
      setNotice(
        result.deliveryStatus === 'ACCEPTED_BY_SMTP'
          ? 'The SMTP server accepted the email. Delivery is not confirmed.'
          : 'The email provider did not accept the message. You can retry again later.',
      );
      await load();
    } catch (caught) {
      setError(
        caught instanceof ApiClientError ? caught.message : 'We could not resend this invitation.',
      );
    }
  }

  if (loading)
    return (
      <p className="text-sm text-slate-600" aria-live="polite">
        Loading team…
      </p>
    );

  return (
    <section className="mx-auto max-w-5xl space-y-7">
      <PageHeader
        eyebrow="Settings"
        title="Team"
        description="Manage organization members and invitations. Each permission is checked by the API."
      />
      {error && (
        <p
          aria-live="polite"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          aria-live="polite"
          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          {notice}
        </p>
      )}
      {canInvite && (
        <Card>
          <h2 className="text-base font-semibold">Invite a teammate</h2>
          <p className="mt-1 text-sm text-slate-600">
            Invitation links expire after seven days and can only be used once.
          </p>
          <form
            className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]"
            onSubmit={invite}
          >
            <label className="sr-only" htmlFor="invite-email">
              Email address
            </label>
            <input
              autoComplete="email"
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              id="invite-email"
              maxLength={254}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              required
              type="email"
              value={email}
            />
            <label className="sr-only" htmlFor="invite-role">
              Role
            </label>
            <select
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm"
              id="invite-role"
              onChange={(event) => setRole(event.target.value as AssignableOrganizationRole)}
              value={role}
            >
              {assignableRoles.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0) + option.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <Button disabled={busy || assignableRoles.length === 0} type="submit">
              {busy ? 'Sending…' : 'Send invite'}
            </Button>
          </form>
        </Card>
      )}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Members</h2>
            <p className="mt-1 text-sm text-slate-600">
              {members.length} active {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {activeOrganization.role}
          </span>
        </div>
        {members.length === 0 ? (
          <p className="mt-6 text-sm text-slate-600">No members found.</p>
        ) : (
          <ul className="mt-3">
            {members.map((member) => (
              <MemberRow
                actorId={identity.user.id}
                actorRole={activeOrganization.role}
                key={member.id}
                member={member}
                onChangeRole={(target, nextRole) => void changeRole(target, nextRole)}
                onRemove={(target) => void removeMember(target)}
                ownerCount={owners}
                roleOptions={assignableRoles}
              />
            ))}
          </ul>
        )}
      </Card>
      {canViewInvitations && (
        <Card>
          <h2 className="text-base font-semibold">Pending invitations</h2>
          {invitations.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              There are no pending or expired invitations.
            </p>
          ) : (
            <ul className="mt-2">
              {invitations.map((invitation) => (
                <InvitationRow
                  canManage={
                    canInvite || roleHasPermission(activeOrganization.role, 'invitations:revoke')
                  }
                  invitation={invitation}
                  key={invitation.id}
                  onResend={(item) => void resend(item)}
                  onRevoke={(item) => void revoke(item)}
                />
              ))}
            </ul>
          )}
        </Card>
      )}
      {activeOrganization.role === 'OWNER' && (
        <OwnershipTransfer
          members={members}
          organizationId={activeOrganization.id}
          afterTransfer={async () => {
            await load();
            await refresh();
          }}
        />
      )}
    </section>
  );
}

function OwnershipTransfer({
  members,
  organizationId,
  afterTransfer,
}: {
  members: MemberSummary[];
  organizationId: string;
  afterTransfer: () => Promise<void>;
}) {
  const { activeOrganization } = useWorkspace();
  const [targetUserId, setTargetUserId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const options = members.filter((member) => member.role !== 'OWNER');
  if (!roleHasPermission(activeOrganization.role, 'ownership:transfer') || options.length === 0)
    return null;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = options.find((member) => member.userId === targetUserId);
    if (
      !target ||
      !window.confirm(`Transfer ownership to ${target.name}? Your role will become Admin.`)
    )
      return;
    setBusy(true);
    setError('');
    try {
      await salesmoraApi.transferOwnership(organizationId, target.userId);
      await afterTransfer();
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : 'Could not transfer ownership.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card>
      <h2 className="text-base font-semibold">Transfer ownership</h2>
      <p className="mt-1 text-sm text-slate-600">
        The selected member becomes Owner and your role changes to Admin.
      </p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
        <label className="sr-only" htmlFor="ownership-target">
          New owner
        </label>
        <select
          className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          id="ownership-target"
          onChange={(event) => setTargetUserId(event.target.value)}
          required
          value={targetUserId}
        >
          <option value="">Choose a member</option>
          {options.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.name} · {member.email}
            </option>
          ))}
        </select>
        <Button disabled={busy || !targetUserId} type="submit">
          {busy ? 'Transferring…' : 'Transfer ownership'}
        </Button>
      </form>
      {error && (
        <p aria-live="polite" className="mt-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
