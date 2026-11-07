from app.db.models import OrganizationRole

ROLE_PERMISSIONS: dict[OrganizationRole, frozenset[str]] = {
    OrganizationRole.OWNER: frozenset(
        {
            "organization:read",
            "organization:update",
            "members:read",
            "members:invite",
            "members:manage",
            "invitations:read",
            "invitations:revoke",
            "audit:read",
            "ownership:transfer",
        }
    ),
    OrganizationRole.ADMIN: frozenset(
        {
            "organization:read",
            "organization:update",
            "members:read",
            "members:invite",
            "members:manage",
            "invitations:read",
            "invitations:revoke",
            "audit:read",
        }
    ),
    OrganizationRole.MANAGER: frozenset(
        {
            "organization:read",
            "members:read",
            "members:invite",
            "members:manage",
            "invitations:read",
            "invitations:revoke",
        }
    ),
    OrganizationRole.MEMBER: frozenset({"organization:read", "members:read"}),
    OrganizationRole.VIEWER: frozenset({"organization:read", "members:read"}),
}


def has_permission(role: OrganizationRole, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS[role]


def can_assign_role(actor: OrganizationRole, target: OrganizationRole | str) -> bool:
    if target == OrganizationRole.OWNER:
        return False
    if actor == OrganizationRole.OWNER:
        return True
    if actor == OrganizationRole.ADMIN:
        return target in {
            OrganizationRole.MANAGER,
            OrganizationRole.MEMBER,
            OrganizationRole.VIEWER,
        }
    if actor == OrganizationRole.MANAGER:
        return target in {OrganizationRole.MEMBER, OrganizationRole.VIEWER}
    return False


def can_manage_member(actor: OrganizationRole, target: OrganizationRole) -> bool:
    if actor == OrganizationRole.OWNER:
        return True
    if actor == OrganizationRole.ADMIN:
        return target in {
            OrganizationRole.MANAGER,
            OrganizationRole.MEMBER,
            OrganizationRole.VIEWER,
        }
    if actor == OrganizationRole.MANAGER:
        return target in {OrganizationRole.MEMBER, OrganizationRole.VIEWER}
    return False
