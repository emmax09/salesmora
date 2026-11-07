import { describe, expect, it } from 'vitest';
import { HealthResponseSchema } from '../src/health.js';

describe('HealthResponseSchema', () => {
  it('accepts a named healthy service', () => {
    expect(HealthResponseSchema.safeParse({ status: 'ok', service: 'api' }).success).toBe(true);
  });

  it('rejects an empty service name', () => {
    expect(HealthResponseSchema.safeParse({ status: 'ok', service: '' }).success).toBe(false);
  });
});
