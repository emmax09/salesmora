import { z } from 'zod';

export const ApiErrorResponseSchema = z.object({
  statusCode: z.number().int().min(400).max(599),
  error: z.string().min(1),
  message: z.union([z.string().min(1), z.array(z.string().min(1))]),
  path: z.string().min(1),
  timestamp: z.iso.datetime(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
