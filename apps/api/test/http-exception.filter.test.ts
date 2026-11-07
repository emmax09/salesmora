import 'reflect-metadata';
import { BadRequestException, type ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ApiErrorResponseSchema } from '@salesmora/contracts';
import { GlobalHttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';

function createHttpHost(url: string) {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({ url }),
    }),
  } as unknown as ArgumentsHost;
  return { host, response };
}

describe('GlobalHttpExceptionFilter', () => {
  it('writes a structured, contract-valid client error', () => {
    const { host, response } = createHttpHost('/api/v1/example');
    new GlobalHttpExceptionFilter().catch(new BadRequestException('Invalid input'), host);
    const body = response.json.mock.calls[0]?.[0];

    expect(response.status).toHaveBeenCalledWith(400);
    expect(ApiErrorResponseSchema.safeParse(body).success).toBe(true);
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid input',
      path: '/api/v1/example',
    });
  });

  it('does not expose unexpected server exception details', () => {
    const { host, response } = createHttpHost('/api/v1/example');
    new GlobalHttpExceptionFilter().catch(new Error('private database detail'), host);
    const body = response.json.mock.calls[0]?.[0];

    expect(body).toMatchObject({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Internal server error',
    });
  });
});
