import { describe, expect, it } from 'vitest';
import { SalesmoraApiClient } from '../src/client.js';

describe('SalesmoraApiClient', () => {
  it('requests and validates the versioned health endpoint', async () => {
    const fetchImplementation: typeof fetch = async (input) => {
      expect(String(input)).toBe('https://api.example.test/api/v1/health');
      return new Response(JSON.stringify({ status: 'ok', service: 'api' }), { status: 200 });
    };
    const client = new SalesmoraApiClient({
      baseUrl: 'https://api.example.test',
      fetchImplementation,
    });
    await expect(client.getHealth()).resolves.toEqual({ status: 'ok', service: 'api' });
  });

  it('creates a workspace with an idempotency key and cookie credentials', async () => {
    const fetchImplementation: typeof fetch = async (input, init) => {
      expect(String(input)).toBe('https://api.example.test/api/v1/organizations');
      expect(init?.credentials).toBe('include');
      const headers = new Headers(init?.headers);
      expect(headers.get('Idempotency-Key')).toMatch(/^[\da-f-]{36}$/i);
      expect(JSON.parse(String(init?.body))).toEqual({
        name: 'Example Org',
        industry: 'Other',
        country: 'NG',
        timezone: 'Africa/Lagos',
        defaultCurrency: 'NGN',
      });
      return new Response(
        JSON.stringify({
          id: 'org_1',
          name: 'Example Org',
          slug: 'example-org-ab12cd34',
          industry: 'Other',
          country: 'NG',
          timezone: 'Africa/Lagos',
          defaultCurrency: 'NGN',
          role: 'OWNER',
        }),
        { status: 201 },
      );
    };
    const client = new SalesmoraApiClient({
      baseUrl: 'https://api.example.test',
      fetchImplementation,
    });
    await expect(
      client.createOrganization({
        name: 'Example Org',
        industry: 'Other',
        country: 'NG',
        timezone: 'Africa/Lagos',
        defaultCurrency: 'NGN',
      }),
    ).resolves.toMatchObject({ id: 'org_1', role: 'OWNER' });
  });

  it('validates the identity response and includes session cookies', async () => {
    const fetchImplementation: typeof fetch = async (input, init) => {
      expect(String(input)).toBe('https://api.example.test/api/v1/identity/me');
      expect(init?.credentials).toBe('include');
      return new Response(
        JSON.stringify({
          user: { id: 'user_1', name: 'Owner', email: 'owner@example.com' },
          emailVerified: true,
          sessionExpiresAt: '2026-11-08T00:00:00.000Z',
          activeOrganizationId: null,
        }),
        { status: 200 },
      );
    };
    const client = new SalesmoraApiClient({
      baseUrl: 'https://api.example.test',
      fetchImplementation,
    });
    await expect(client.getIdentity()).resolves.toMatchObject({
      user: { email: 'owner@example.com' },
    });
  });

  it('returns typed errors for structured API failures', async () => {
    const fetchImplementation: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          statusCode: 503,
          error: 'Service Unavailable',
          message: 'Try again later',
          path: '/api/v1/health',
          timestamp: '2026-11-07T00:00:00.000Z',
        }),
        { status: 503 },
      );
    const client = new SalesmoraApiClient({
      baseUrl: 'https://api.example.test',
      fetchImplementation,
    });
    await expect(client.getHealth()).rejects.toMatchObject({
      name: 'ApiClientError',
      statusCode: 503,
      message: 'Try again later',
    });
  });
});
