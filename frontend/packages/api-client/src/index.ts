export { ApiClientError, SalesmoraApiClient, type ApiClientOptions } from './client.js';
export type { ApiErrorResponse } from './client.js';
export type { components, paths } from './generated/v1.js';

import type { components } from './generated/v1.js';

export type AcceptInvitationResponse = components['schemas']['AcceptInvitationResponse'];
export type AssignableOrganizationRole = components['schemas']['AssignableOrganizationRole'];
export type AuditEventListResponse = components['schemas']['AuditEventListResponse'];
export type ContactRequest = components['schemas']['ContactRequest'];
export type CreateOrganizationRequest = components['schemas']['CreateOrganizationRequest'];
export type CurrentIdentityResponse = components['schemas']['CurrentIdentityResponse'];
export type EarlyAccessRequest = components['schemas']['EarlyAccessRequest'];
export type HealthResponse = components['schemas']['HealthResponse'];
export type InvitationListResponse = components['schemas']['InvitationListResponse'];
export type InvitationSummary = components['schemas']['InvitationSummary'];
export type InviteMemberRequest = components['schemas']['InviteMemberRequest'];
export type MemberListResponse = components['schemas']['MemberListResponse'];
export type MemberSummary = components['schemas']['MemberSummary'];
export type OrganizationListResponse = components['schemas']['OrganizationListResponse'];
export type OrganizationPermission = components['schemas']['OrganizationPermission'];
export type OrganizationRole = components['schemas']['OrganizationRole'];
export type OrganizationSummary = components['schemas']['OrganizationSummary'];
export type PublicSubmissionResponse = components['schemas']['PublicSubmissionResponse'];
export type UpdateOrganizationRequest = components['schemas']['UpdateOrganizationRequest'];
