from app.db.models import OrganizationRole
from app.permissions import can_assign_role, can_manage_member, has_permission


def test_role_permissions_keep_manager_scope():
    assert has_permission(OrganizationRole.MANAGER, "members:manage")
    assert has_permission(OrganizationRole.MANAGER, "invitations:revoke")
    assert not has_permission(OrganizationRole.MANAGER, "audit:read")


def test_role_assignment_rules_preserve_hierarchy():
    assert can_assign_role(OrganizationRole.OWNER, OrganizationRole.ADMIN)
    assert can_assign_role(OrganizationRole.ADMIN, OrganizationRole.MANAGER)
    assert can_assign_role(OrganizationRole.MANAGER, OrganizationRole.VIEWER)
    assert not can_assign_role(OrganizationRole.MANAGER, OrganizationRole.ADMIN)
    assert not can_assign_role(OrganizationRole.MEMBER, OrganizationRole.VIEWER)


def test_admin_cannot_manage_owner_or_peer_admin():
    assert not can_manage_member(OrganizationRole.ADMIN, OrganizationRole.OWNER)
    assert not can_manage_member(OrganizationRole.ADMIN, OrganizationRole.ADMIN)
    assert can_manage_member(OrganizationRole.OWNER, OrganizationRole.OWNER)
