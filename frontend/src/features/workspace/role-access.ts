import type { OrganizationPermission, OrganizationRole } from '@salesmora/api-client';

const permissionsByRole: Record<OrganizationRole, readonly OrganizationPermission[]> = {
  OWNER: [
    'organization:read',
    'organization:update',
    'members:read',
    'members:invite',
    'members:manage',
    'invitations:read',
    'invitations:revoke',
    'audit:read',
    'ownership:transfer',
  ],
  ADMIN: [
    'organization:read',
    'organization:update',
    'members:read',
    'members:invite',
    'members:manage',
    'invitations:read',
    'invitations:revoke',
    'audit:read',
  ],
  MANAGER: [
    'organization:read',
    'members:read',
    'members:invite',
    'members:manage',
    'invitations:read',
    'invitations:revoke',
  ],
  MEMBER: ['organization:read', 'members:read'],
  VIEWER: ['organization:read', 'members:read'],
};

const roleRank: Record<OrganizationRole, number> = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  MEMBER: 2,
  VIEWER: 1,
};

/** These checks control which controls are shown. The API remains authoritative for access. */
export function roleHasPermission(
  role: OrganizationRole,
  permission: OrganizationPermission,
): boolean {
  return permissionsByRole[role].includes(permission);
}

export function canAssignOrganizationRole(
  actorRole: OrganizationRole,
  targetRole: Exclude<OrganizationRole, 'OWNER'>,
): boolean {
  if (actorRole === 'OWNER') return true;
  if (actorRole === 'ADMIN') return roleRank[targetRole] < roleRank.ADMIN;
  if (actorRole === 'MANAGER') return targetRole === 'MEMBER' || targetRole === 'VIEWER';
  return false;
}

export function canManageOrganizationMember(
  actorRole: OrganizationRole,
  targetRole: OrganizationRole,
): boolean {
  if (actorRole === 'OWNER') return true;
  if (actorRole === 'ADMIN') return roleRank[targetRole] < roleRank.ADMIN;
  if (actorRole === 'MANAGER') return targetRole === 'MEMBER' || targetRole === 'VIEWER';
  return false;
}
