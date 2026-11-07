import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { HealthResponseSchema } from '@salesmora/contracts';
import { HealthController } from '../src/modules/health/health.controller.js';

describe('HealthController', () => {
  it('returns a valid API health response', () => {
    const response = new HealthController().getHealth();

    expect(HealthResponseSchema.parse(response)).toEqual({ status: 'ok', service: 'api' });
  });
});
