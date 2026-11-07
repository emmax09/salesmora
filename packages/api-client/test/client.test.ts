import { describe, expect, it } from 'vitest';
import { ApiClientError, SalesmoraApiClient } from '../src/client.js';

describe('SalesmoraApiClient', () => {
  it('requests the versioned health endpoint and validates its response', async () => {
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

  it('returns a typed error for structured API failures', async () => {
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
    const client = new SalesmoraApiClient({ baseUrl: 'https://api.example.test', fetchImplementation });

    await expect(client.getHealth()).rejects.toMatchObject<ApiClientError>({
      name: 'ApiClientError',
      statusCode: 503,
      message: 'Try again later',
    });
  });
});
