import type { components, paths } from './generated/v1.js';

type Schema = components['schemas'];
type JsonResponse<Operation, Status extends PropertyKey> = Operation extends {
  responses: infer Responses;
}
  ? Status extends keyof Responses
    ? Responses[Status] extends { content: { 'application/json': infer Body } }
      ? Body
      : never
    : never
  : never;

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly responseBody: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  fetchImplementation?: typeof fetch;
}

export class SalesmoraApiClient {
  private readonly fetcher: typeof fetch;

  constructor(private readonly options: ApiClientOptions) {
    this.fetcher = options.fetchImplementation ?? fetch;
  }

  getHealth(): Promise<JsonResponse<paths['/api/v1/health']['get'], 200>> {
    return this.request('/health');
  }

  submitEarlyAccess(
    input: Schema['EarlyAccessRequest'],
  ): Promise<Schema['PublicSubmissionResponse']> {
    return this.request('/public/early-access', { method: 'POST', body: JSON.stringify(input) });
  }

  submitContact(input: Schema['ContactRequest']): Promise<Schema['PublicSubmissionResponse']> {
    return this.request('/public/contact', { method: 'POST', body: JSON.stringify(input) });
  }

  getIdentity(): Promise<JsonResponse<paths['/api/v1/identity/me']['get'], 200>> {
    return this.request('/identity/me');
  }

  listOrganizations(): Promise<JsonResponse<paths['/api/v1/organizations']['get'], 200>> {
    return this.request('/organizations');
  }

  getCurrentOrganization(): Promise<
    JsonResponse<paths['/api/v1/organizations/current']['get'], 200>
  > {
    return this.request('/organizations/current');
  }

  createOrganization(
    input: Schema['CreateOrganizationRequest'],
  ): Promise<Schema['OrganizationSummary']> {
    return this.request('/organizations', {
      method: 'POST',
      headers: { 'Idempotency-Key': globalThis.crypto.randomUUID() },
      body: JSON.stringify(input),
    });
  }

  updateOrganization(
    organizationId: string,
    input: Schema['UpdateOrganizationRequest'],
  ): Promise<Schema['OrganizationSummary']> {
    return this.request(`/organizations/${encodeURIComponent(organizationId)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  activateOrganization(organizationId: string): Promise<{ activeOrganizationId: string }> {
    return this.request(`/organizations/${encodeURIComponent(organizationId)}/activate`, {
      method: 'POST',
    });
  }

  listMembers(organizationId: string): Promise<Schema['MemberListResponse']> {
    return this.request(`/organizations/${encodeURIComponent(organizationId)}/members`);
  }

  changeMemberRole(
    organizationId: string,
    memberId: string,
    role: Schema['AssignableOrganizationRole'],
  ): Promise<Schema['MemberSummary']> {
    return this.request(
      `/organizations/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(memberId)}/role`,
      { method: 'PATCH', body: JSON.stringify({ role }) },
    );
  }

  removeMember(organizationId: string, memberId: string): Promise<{ success: true }> {
    return this.request(
      `/organizations/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(memberId)}`,
      { method: 'DELETE' },
    );
  }

  transferOwnership(organizationId: string, userId: string): Promise<{ ownerUserId: string }> {
    return this.request(
      `/organizations/${encodeURIComponent(organizationId)}/members/ownership-transfer`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      },
    );
  }

  listInvitations(organizationId: string): Promise<Schema['InvitationListResponse']> {
    return this.request(`/organizations/${encodeURIComponent(organizationId)}/invitations`);
  }

  inviteMember(
    organizationId: string,
    input: Schema['InviteMemberRequest'],
  ): Promise<Schema['InvitationSummary']> {
    return this.request(`/organizations/${encodeURIComponent(organizationId)}/invitations`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  revokeInvitation(organizationId: string, invitationId: string): Promise<{ success: true }> {
    return this.request(
      `/organizations/${encodeURIComponent(organizationId)}/invitations/${encodeURIComponent(invitationId)}`,
      { method: 'DELETE' },
    );
  }

  resendInvitation(
    organizationId: string,
    invitationId: string,
  ): Promise<Schema['InvitationSummary']> {
    return this.request(
      `/organizations/${encodeURIComponent(organizationId)}/invitations/${encodeURIComponent(invitationId)}/resend`,
      { method: 'POST' },
    );
  }

  acceptInvitation(token: string): Promise<Schema['AcceptInvitationResponse']> {
    return this.request('/invitations/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  getAuditEvents(organizationId: string): Promise<Schema['AuditEventListResponse']> {
    return this.request(`/organizations/${encodeURIComponent(organizationId)}/audit-events`);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const endpoint = new URL(`/api/v1${path}`, this.options.baseUrl);
    let response: Response;
    try {
      response = await this.fetcher(endpoint, {
        ...init,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...Object.fromEntries(new Headers(init.headers)),
        },
      });
    } catch (error) {
      throw new ApiClientError(
        'Could not reach the Salesmora API.',
        0,
        error instanceof Error ? error.message : null,
      );
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new ApiClientError('The API returned an invalid JSON response.', response.status, null);
    }
    if (!response.ok) {
      throw new ApiClientError(errorMessage(body, response.status), response.status, body);
    }
    return body as T;
  }
}

function errorMessage(body: unknown, status: number): string {
  if (typeof body !== 'object' || body === null || !('message' in body)) {
    return `The API request failed with status ${status}.`;
  }
  const message = body.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join('; ');
  }
  return `The API request failed with status ${status}.`;
}

export type ApiErrorResponse = Schema['ApiErrorResponse'];
