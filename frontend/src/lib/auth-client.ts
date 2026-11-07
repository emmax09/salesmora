'use client';

const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:3001';
const authBase = `${apiOrigin}/api/v1/auth`;

type AuthResult<T = unknown> = { data: T | null; error: { message: string } | null };

async function post<T>(path: string, body?: object): Promise<AuthResult<T>> {
  try {
    const response = await fetch(`${authBase}/${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const responseBody: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      return { data: null, error: { message: responseMessage(responseBody) } };
    }
    return { data: responseBody as T, error: null };
  } catch {
    return { data: null, error: { message: 'Could not reach the Salesmora API.' } };
  }
}

function responseMessage(body: unknown): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = body.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.join('; ');
    }
  }
  return 'The authentication request could not be completed.';
}

export const authClient = {
  signUp: {
    email: (input: { name: string; email: string; password: string; callbackURL: string }) =>
      post('/sign-up/email', input),
  },
  signIn: {
    email: (input: { email: string; password: string; callbackURL: string }) =>
      post('/sign-in/email', input),
  },
  signOut: () => post('/sign-out'),
  updateUser: (input: { name: string }) => post('/update-user', input),
  requestPasswordReset: (input: { email: string; redirectTo: string }) =>
    post('/forget-password', input),
  resetPassword: (input: { newPassword: string; token: string }) => post('/reset-password', input),
  sendVerificationEmail: (input: { email: string; callbackURL: string }) =>
    post('/send-verification-email', input),
};

export function safeReturnPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/workspace';
  }
  return value;
}
