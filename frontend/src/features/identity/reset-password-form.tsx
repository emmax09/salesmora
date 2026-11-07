'use client';

import { Suspense, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card } from '@salesmora/ui';
import { authClient } from '../../lib/auth-client';

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={<p className="p-10 text-center text-sm text-slate-600">Loading reset form…</p>}
    >
      <ResetPasswordFields />
    </Suspense>
  );
}

function ResetPasswordFields() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error)
        setError('This reset link is invalid or expired. Request a new link and try again.');
      else setSuccess(true);
    } catch {
      setError('We could not reset your password. Request a new link and try again.');
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
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Choose a new password</h1>
          {success ? (
            <div className="mt-5 space-y-5">
              <p
                className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
                role="status"
              >
                Your password has been updated. Sign in with the new password.
              </p>
              <Button className="w-full" onClick={() => router.replace('/auth/login')}>
                Go to sign in
              </Button>
            </div>
          ) : !token ? (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-slate-600">This link is missing its recovery token.</p>
              <Link
                className="text-sm font-medium text-blue-800 hover:underline"
                href="/auth/forgot-password"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <form className="mt-7 space-y-5" onSubmit={submit}>
              <label className="block space-y-2 text-sm font-medium" htmlFor="password">
                New password
                <div className="flex min-h-11 overflow-hidden rounded-lg border border-slate-300 focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-100">
                  <input
                    autoComplete="new-password"
                    className="min-w-0 flex-1 px-3 font-normal outline-none"
                    id="password"
                    maxLength={128}
                    minLength={12}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type={visible ? 'text' : 'password'}
                    value={password}
                  />
                  <button
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    className="px-3 text-xs font-medium text-slate-600"
                    onClick={() => setVisible((value) => !value)}
                    type="button"
                  >
                    {visible ? 'Hide' : 'Show'}
                  </button>
                </div>
                <span className="block text-xs font-normal text-slate-500">
                  Use at least 12 characters.
                </span>
              </label>
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
                {busy ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          )}
        </Card>
      </section>
    </main>
  );
}
