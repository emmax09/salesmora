import {
  ApiErrorResponseSchema,
  HealthResponseSchema,
  type HealthResponse,
} from '@salesmora/contracts';

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

  async getHealth(): Promise<HealthResponse> {
    const endpoint = new URL('/api/v1/health', this.options.baseUrl);
    const response = await this.fetcher(endpoint, {
      headers: { Accept: 'application/json' },
    });
    let body: unknown;

    try {
      body = await response.json();
    } catch {
      throw new ApiClientError('The API returned an invalid JSON response.', response.status, null);
    }

    if (!response.ok) {
      const error = ApiErrorResponseSchema.safeParse(body);
      const message = error.success
        ? Array.isArray(error.data.message)
          ? error.data.message.join('; ')
          : error.data.message
        : `The API request failed with status ${response.status}.`;
      throw new ApiClientError(message, response.status, body);
    }

    return HealthResponseSchema.parse(body);
  }
}
