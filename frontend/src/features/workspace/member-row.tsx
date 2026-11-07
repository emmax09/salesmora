'use client';

import type {
  AssignableOrganizationRole,
  MemberSummary,
  OrganizationRole,
} from '@salesmora/api-client';
import { canAssignOrganizationRole, canManageOrganizationMember } from './role-access';

export function MemberRow({
  actorId,
  actorRole,
  member,
  roleOptions,
  ownerCount,
  onChangeRole,
  onRemove,
}: {
  actorId: string;
  actorRole: OrganizationRole;
  member: MemberSummary;
  roleOptions: AssignableOrganizationRole[];
  ownerCount: number;
  onChangeRole: (member: MemberSummary, role: AssignableOrganizationRole) => void;
  onRemove: (member: MemberSummary) => void;
}) {
  const isSelf = member.userId === actorId;
  const canManage = !isSelf && canManageOrganizationMember(actorRole, member.role);
  const roleLocked = member.role === 'OWNER' && ownerCount < 2;
  const options = member.role === 'OWNER' ? [member.role, ...roleOptions] : roleOptions;

  return (
    <li className="grid gap-3 border-b border-slate-100 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">
          {member.name}
          {isSelf && <span className="ml-2 text-xs font-normal text-slate-500">You</span>}
        </p>
        <p className="truncate text-sm text-slate-500">{member.email}</p>
      </div>
      {canManage ? (
        <label className="text-xs text-slate-500">
          Role
          <select
            aria-label={`Role for ${member.name}`}
            className="mt-1 block min-h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-800 sm:w-36"
            disabled={roleLocked}
            onChange={(event) => {
              const role = event.target.value as AssignableOrganizationRole;
              if (canAssignOrganizationRole(actorRole, role)) onChangeRole(member, role);
            }}
            value={member.role}
          >
            {options.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {member.role}
        </span>
      )}
      {canManage && (
        <button
          className="min-h-10 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={roleLocked}
          onClick={() => onRemove(member)}
          type="button"
        >
          Remove
        </button>
      )}
      <p className="text-xs text-slate-400 sm:col-span-3">
        Joined {new Date(member.createdAt).toLocaleDateString()}
      </p>
    </li>
  );
}
