from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints

from app.db.models import AuditAction, InvitationDeliveryStatus, InvitationStatus, OrganizationRole


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str


class PublicSubmissionResponse(BaseModel):
    status: Literal["received"]


class CurrentIdentityResponse(BaseModel):
    user: UserSummary
    emailVerified: bool
    sessionExpiresAt: datetime
    activeOrganizationId: str | None


class RequestModel(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)


class AssignableOrganizationRole(StrEnum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    MEMBER = "MEMBER"
    VIEWER = "VIEWER"


class SignUpRequest(RequestModel):
    name: Annotated[str, StringConstraints(min_length=2, max_length=255)]
    email: EmailStr
    password: Annotated[str, StringConstraints(min_length=12, max_length=128)]
    callback_url: str | None = Field(default=None, alias="callbackURL")


class SignInRequest(RequestModel):
    email: EmailStr
    password: Annotated[str, StringConstraints(min_length=1, max_length=128)]
    callback_url: str | None = Field(default=None, alias="callbackURL")


class EmailRequest(RequestModel):
    email: EmailStr
    callback_url: str | None = Field(default=None, alias="callbackURL")


class PasswordResetRequest(RequestModel):
    email: EmailStr
    redirect_to: str | None = Field(default=None, alias="redirectTo")


class ResetPasswordRequest(RequestModel):
    new_password: Annotated[str, StringConstraints(min_length=12, max_length=128)] = Field(
        alias="newPassword"
    )
    token: Annotated[str, StringConstraints(min_length=32, max_length=128)]


class UpdateUserRequest(RequestModel):
    name: Annotated[str, StringConstraints(min_length=2, max_length=255)]


class CreateOrganizationRequest(RequestModel):
    name: Annotated[str, StringConstraints(min_length=2, max_length=120)]
    industry: Annotated[str, StringConstraints(min_length=2, max_length=100)]
    country: Annotated[str, StringConstraints(min_length=2, max_length=2)]
    timezone: Annotated[str, StringConstraints(min_length=1, max_length=64)]
    default_currency: Annotated[str, StringConstraints(min_length=3, max_length=3)] = Field(
        alias="defaultCurrency"
    )


class UpdateOrganizationRequest(RequestModel):
    name: Annotated[str, StringConstraints(min_length=2, max_length=120)] = None
    industry: Annotated[str, StringConstraints(min_length=2, max_length=100)] = None
    country: Annotated[str, StringConstraints(min_length=2, max_length=2)] = None
    timezone: Annotated[str, StringConstraints(min_length=1, max_length=64)] = None
    default_currency: Annotated[str, StringConstraints(min_length=3, max_length=3)] = Field(
        default=None, alias="defaultCurrency"
    )


class InviteMemberRequest(RequestModel):
    email: EmailStr
    role: AssignableOrganizationRole


class UpdateMemberRoleRequest(RequestModel):
    role: AssignableOrganizationRole


class TransferOwnershipRequest(RequestModel):
    user_id: str = Field(alias="userId")


class AcceptInvitationRequest(RequestModel):
    token: Annotated[str, StringConstraints(min_length=32, max_length=128)]


class EarlyAccessRequest(RequestModel):
    name: Annotated[str, StringConstraints(min_length=2, max_length=120)]
    email: EmailStr
    organization: Annotated[str, StringConstraints(max_length=120)] | None = None
    interest: Literal["Inbox", "Sales", "AI assistance", "Operations", "Other"] | None = None
    consent: Literal[True]
    website: Annotated[str, StringConstraints(max_length=0)] = None


class ContactRequest(RequestModel):
    name: Annotated[str, StringConstraints(min_length=2, max_length=120)]
    email: EmailStr
    subject: Annotated[str, StringConstraints(min_length=2, max_length=160)]
    message: Annotated[str, StringConstraints(min_length=10, max_length=4000)]
    website: Annotated[str, StringConstraints(max_length=0)] = None


class UserSummary(BaseModel):
    id: str
    name: str
    email: EmailStr


class OrganizationSummary(BaseModel):
    id: str
    name: str
    slug: str
    industry: str | None
    country: str | None
    timezone: str
    defaultCurrency: str
    role: OrganizationRole


class MemberSummary(BaseModel):
    id: str
    userId: str
    name: str
    email: EmailStr
    role: OrganizationRole
    createdAt: datetime


class InvitationSummary(BaseModel):
    id: str
    email: EmailStr
    role: OrganizationRole
    status: InvitationStatus
    deliveryStatus: InvitationDeliveryStatus
    expiresAt: datetime
    createdAt: datetime
    invitedByName: str


class OrganizationListResponse(BaseModel):
    organizations: list[OrganizationSummary]
    activeOrganizationId: str | None


class MemberListResponse(BaseModel):
    members: list[MemberSummary]


class InvitationListResponse(BaseModel):
    invitations: list[InvitationSummary]


class AcceptInvitationResponse(BaseModel):
    organizationId: str
    organizationName: str


class ActivateOrganizationResponse(BaseModel):
    activeOrganizationId: str


class SuccessResponse(BaseModel):
    success: Literal[True]


class TransferOwnershipResponse(BaseModel):
    ownerUserId: str


class AuditEventSummary(BaseModel):
    id: str
    action: AuditAction
    actorUserId: str | None
    actorName: str | None
    targetType: str | None
    targetId: str | None
    metadata: dict[str, Any] | None
    createdAt: datetime


class AuditEventListResponse(BaseModel):
    auditEvents: list[AuditEventSummary]
