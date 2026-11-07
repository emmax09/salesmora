import { SalesmoraApiClient } from '@salesmora/api-client';

export const salesmoraApi = new SalesmoraApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:3001',
});
