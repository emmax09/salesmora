from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Any
from uuid import UUID

from sqlalchemy import (
    CHAR,
    JSON,
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OrganizationRole(StrEnum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    MEMBER = "MEMBER"
    VIEWER = "VIEWER"


class InvitationStatus(StrEnum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REVOKED = "REVOKED"
    EXPIRED = "EXPIRED"


class InvitationDeliveryStatus(StrEnum):
    ACCEPTED_BY_SMTP = "ACCEPTED_BY_SMTP"
    FAILED = "FAILED"


class AuditAction(StrEnum):
    USER_REGISTERED = "USER_REGISTERED"
    SESSION_CREATED = "SESSION_CREATED"
    SESSION_REVOKED = "SESSION_REVOKED"
    ORGANIZATION_CREATED = "ORGANIZATION_CREATED"
    ORGANIZATION_UPDATED = "ORGANIZATION_UPDATED"
    MEMBERSHIP_CREATED = "MEMBERSHIP_CREATED"
    MEMBERSHIP_ROLE_CHANGED = "MEMBERSHIP_ROLE_CHANGED"
    MEMBERSHIP_REMOVED = "MEMBERSHIP_REMOVED"
    INVITATION_CREATED = "INVITATION_CREATED"
    INVITATION_ACCEPTED = "INVITATION_ACCEPTED"
    INVITATION_REVOKED = "INVITATION_REVOKED"
    OWNERSHIP_TRANSFERRED = "OWNERSHIP_TRANSFERRED"
    ACTIVE_ORGANIZATION_CHANGED = "ACTIVE_ORGANIZATION_CHANGED"


role_type = Enum(OrganizationRole, name="OrganizationRole", native_enum=True)
invitation_status_type = Enum(InvitationStatus, name="InvitationStatus", native_enum=True)
delivery_status_type = Enum(
    InvitationDeliveryStatus, name="InvitationDeliveryStatus", native_enum=True
)
audit_action_type = Enum(AuditAction, name="AuditAction", native_enum=True)
json_type = JSON().with_variant(JSONB(), "postgresql")


class User(Base):
    __tablename__ = "users"
    __table_args__ = (Index("users_email_key", "email", unique=True),)

    id: Mapped[str] = mapped_column(String(30), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    email_verified: Mapped[bool] = mapped_column(
        "emailVerified", Boolean, default=False, server_default="false"
    )
    image: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt", DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )
    accounts: Mapped[list[Account]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    sessions: Mapped[list[Session]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    memberships: Mapped[list[Membership]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Organization(Base):
    __tablename__ = "organizations"
    __table_args__ = (Index("organizations_slug_key", "slug", unique=True),)

    id: Mapped[str] = mapped_column(String(30), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    industry: Mapped[str | None] = mapped_column(String(100))
    country: Mapped[str | None] = mapped_column(CHAR(2))
    timezone: Mapped[str] = mapped_column(String(64), server_default="UTC")
    default_currency: Mapped[str] = mapped_column("defaultCurrency", CHAR(3), server_default="USD")
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt", DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )
    memberships: Mapped[list[Membership]] = relationship(back_populates="organization")


class Membership(Base):
    __tablename__ = "memberships"
    __table_args__ = (
        Index(
            "memberships_organizationId_userId_key",
            "organizationId",
            "userId",
            unique=True,
        ),
        Index("memberships_userId_idx", "userId"),
    )

    id: Mapped[str] = mapped_column(String(30), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        "userId",
        ForeignKey(
            "users.id", ondelete="CASCADE", onupdate="CASCADE", name="memberships_userId_fkey"
        ),
    )
    organization_id: Mapped[str] = mapped_column(
        "organizationId",
        ForeignKey(
            "organizations.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="memberships_organizationId_fkey",
        ),
    )
    role: Mapped[OrganizationRole] = mapped_column(role_type, default=OrganizationRole.MEMBER)
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), server_default=func.now()
    )
    user: Mapped[User] = relationship(back_populates="memberships")
    organization: Mapped[Organization] = relationship(back_populates="memberships")


class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = (
        Index("sessions_token_key", "token", unique=True),
        Index("sessions_userId_expiresAt_idx", "userId", "expiresAt"),
        Index("sessions_activeOrganizationId_idx", "activeOrganizationId"),
    )

    id: Mapped[str] = mapped_column(String(30), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        "userId",
        ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE", name="sessions_userId_fkey"),
    )
    token: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime] = mapped_column("expiresAt", DateTime(timezone=True))
    active_organization_id: Mapped[str | None] = mapped_column(
        "activeOrganizationId",
        ForeignKey(
            "organizations.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
            name="sessions_activeOrganizationId_fkey",
        ),
    )
    ip_address: Mapped[str | None] = mapped_column("ipAddress", String(255))
    user_agent: Mapped[str | None] = mapped_column("userAgent", Text)
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt", DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )
    user: Mapped[User] = relationship(back_populates="sessions")


class Account(Base):
    __tablename__ = "accounts"
    __table_args__ = (
        Index("accounts_providerId_accountId_key", "providerId", "accountId", unique=True),
        Index("accounts_userId_idx", "userId"),
    )

    id: Mapped[str] = mapped_column(String(30), primary_key=True)
    account_id: Mapped[str] = mapped_column("accountId", String(255))
    provider_id: Mapped[str] = mapped_column("providerId", String(100))
    user_id: Mapped[str] = mapped_column(
        "userId",
        ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE", name="accounts_userId_fkey"),
    )
    access_token: Mapped[str | None] = mapped_column("accessToken", Text)
    refresh_token: Mapped[str | None] = mapped_column("refreshToken", Text)
    id_token: Mapped[str | None] = mapped_column("idToken", Text)
    access_token_expires_at: Mapped[datetime | None] = mapped_column(
        "accessTokenExpiresAt", DateTime(timezone=True)
    )
    refresh_token_expires_at: Mapped[datetime | None] = mapped_column(
        "refreshTokenExpiresAt", DateTime(timezone=True)
    )
    scope: Mapped[str | None] = mapped_column(Text)
    password: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt", DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )
    user: Mapped[User] = relationship(back_populates="accounts")


class Verification(Base):
    __tablename__ = "verifications"
    __table_args__ = (Index("verifications_identifier_idx", "identifier"),)

    id: Mapped[str] = mapped_column(String(30), primary_key=True)
    identifier: Mapped[str] = mapped_column(String(255))
    value: Mapped[str] = mapped_column(Text)
    expires_at: Mapped[datetime] = mapped_column("expiresAt", DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt", DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )


class Invitation(Base):
    __tablename__ = "invitations"
    __table_args__ = (
        Index(
            "invitations_organizationId_status_expiresAt_idx",
            "organizationId",
            "status",
            "expiresAt",
        ),
        Index("invitations_email_status_idx", "email", "status"),
        Index("invitations_tokenHash_key", "tokenHash", unique=True),
    )

    id: Mapped[str] = mapped_column(String(30), primary_key=True)
    organization_id: Mapped[str] = mapped_column(
        "organizationId",
        ForeignKey(
            "organizations.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="invitations_organizationId_fkey",
        ),
    )
    email: Mapped[str] = mapped_column(String(254))
    role: Mapped[OrganizationRole] = mapped_column(role_type)
    status: Mapped[InvitationStatus] = mapped_column(
        invitation_status_type, default=InvitationStatus.PENDING
    )
    delivery_status: Mapped[InvitationDeliveryStatus] = mapped_column(
        "deliveryStatus", delivery_status_type, default=InvitationDeliveryStatus.FAILED
    )
    token_hash: Mapped[str] = mapped_column("tokenHash", CHAR(64))
    expires_at: Mapped[datetime] = mapped_column("expiresAt", DateTime(timezone=True))
    accepted_at: Mapped[datetime | None] = mapped_column("acceptedAt", DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column("revokedAt", DateTime(timezone=True))
    invited_by_id: Mapped[str] = mapped_column(
        "invitedById",
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="invitations_invitedById_fkey",
        ),
    )
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt", DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )


class OrganizationCreationKey(Base):
    __tablename__ = "organization_creation_keys"
    __table_args__ = (Index("organization_creation_keys_createdAt_idx", "createdAt"),)

    key: Mapped[UUID] = mapped_column(Uuid, primary_key=True)
    user_id: Mapped[str] = mapped_column(
        "userId",
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="organization_creation_keys_userId_fkey",
        ),
    )
    organization_id: Mapped[str] = mapped_column(
        "organizationId",
        ForeignKey(
            "organizations.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="organization_creation_keys_organizationId_fkey",
        ),
    )
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), server_default=func.now()
    )


class AuditEvent(Base):
    __tablename__ = "audit_events"
    __table_args__ = (
        Index("audit_events_organizationId_createdAt_idx", "organizationId", "createdAt"),
        Index("audit_events_actorUserId_createdAt_idx", "actorUserId", "createdAt"),
    )

    id: Mapped[str] = mapped_column(String(30), primary_key=True)
    organization_id: Mapped[str | None] = mapped_column(
        "organizationId",
        ForeignKey(
            "organizations.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
            name="audit_events_organizationId_fkey",
        ),
    )
    actor_user_id: Mapped[str | None] = mapped_column(
        "actorUserId",
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
            name="audit_events_actorUserId_fkey",
        ),
    )
    action: Mapped[AuditAction] = mapped_column(audit_action_type)
    target_type: Mapped[str | None] = mapped_column("targetType", String(60))
    target_id: Mapped[str | None] = mapped_column("targetId", String(30))
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column("metadata", json_type)
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), server_default=func.now()
    )


class EarlyAccessLead(Base):
    __tablename__ = "early_access_leads"
    __table_args__ = (
        Index("early_access_leads_createdAt_idx", "createdAt"),
        Index("early_access_leads_email_key", "email", unique=True),
    )

    id: Mapped[str] = mapped_column(String(30), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(254))
    organization: Mapped[str | None] = mapped_column(String(120))
    interest: Mapped[str | None] = mapped_column(String(32))
    consent_at: Mapped[datetime] = mapped_column("consentAt", DateTime(timezone=True))
    consent_version: Mapped[str] = mapped_column("consentVersion", String(40))
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), server_default=func.now()
    )


class ContactMessage(Base):
    __tablename__ = "contact_messages"
    __table_args__ = (Index("contact_messages_createdAt_idx", "createdAt"),)

    id: Mapped[str] = mapped_column(String(30), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(254))
    subject: Mapped[str] = mapped_column(String(160))
    message: Mapped[str] = mapped_column(String(4000))
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), server_default=func.now()
    )
