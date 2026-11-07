'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { Button, Card } from '@salesmora/ui';
import { authClient } from '../../lib/auth-client';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const redirectTo = new URL('/auth/reset-password', window.location.origin).toString();
      const result = await authClient.requestPasswordReset({
        email: email.trim().toLowerCase(),
        redirectTo,
      });
      if (result.error) {
        setError('We could not send a recovery link right now. Please try again later.');
      } else {
        setMessage('If an account uses that address, a password reset link will arrive shortly.');
      }
    } catch {
      setError('We could not send a recovery link right now. Please try again later.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 sm:px-8">
      <header className="flex h-20 items-center border-b border-slate-200">
        <Link className="text-lg font-semibold tracking-tight" href="/">
          Salesmora
        </Link>
      </header>
      <section className="flex flex-1 items-center justify-center py-12">
        <Card className="w-full max-w-md p-7 sm:p-8">
          <p className="text-sm font-medium text-blue-700">Account recovery</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter your email. We will send a recovery link if an account matches.
          </p>
          <form className="mt-7 space-y-5" onSubmit={submit}>
            <label className="block space-y-2 text-sm font-medium" htmlFor="email">
              Email address
              <input
                autoComplete="email"
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                id="email"
                maxLength={254}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            {message && (
              <p
                aria-live="polite"
                className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900"
                role="status"
              >
                {message}
              </p>
            )}
            {error && (
              <p
                aria-live="polite"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {error}
              </p>
            )}
            <Button className="w-full" disabled={busy} type="submit">
              {busy ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            <Link className="font-medium text-blue-800 hover:underline" href="/auth/login">
              Back to sign in
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
