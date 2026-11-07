import { describe, expect, it } from 'vitest';
import { ApiErrorResponseSchema } from '../src/api-error.js';

describe('ApiErrorResponseSchema', () => {
  it('accepts the API error envelope', () => {
    expect(
      ApiErrorResponseSchema.safeParse({
        statusCode: 400,
        error: 'Bad Request',
        message: ['Invalid input'],
        path: '/api/v1/health',
        timestamp: '2026-11-07T00:00:00.000Z',
      }).success,
    ).toBe(true);
  });

  it('rejects non-error status codes', () => {
    expect(
      ApiErrorResponseSchema.safeParse({
        statusCode: 200,
        error: 'OK',
        message: 'Unexpected',
        path: '/',
        timestamp: '2026-11-07T00:00:00.000Z',
      }).success,
    ).toBe(false);
  });
});
