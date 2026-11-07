'use client';

import { Suspense, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Card } from '@salesmora/ui';
import { authClient, safeReturnPath } from '../../lib/auth-client';

export function VerificationPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-sm text-slate-600">Loading…</p>}>
      <VerificationContent />
    </Suspense>
  );
}

function VerificationContent() {
  const params = useSearchParams();
  const returnTo = safeReturnPath(params.get('returnTo'));
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const callbackURL = new URL('/auth/verify-email', window.location.origin);
      callbackURL.searchParams.set('returnTo', returnTo);
      const result = await authClient.sendVerificationEmail({
        email: email.trim().toLowerCase(),
        callbackURL: callbackURL.toString(),
      });
      if (result.error)
        setError('We could not send a verification link right now. Please try again later.');
      else setNotice('If that account can receive a verification link, one will arrive shortly.');
    } catch {
      setError('We could not send a verification link right now. Please try again later.');
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
          <p className="text-sm font-medium text-blue-700">Email verification</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Check your inbox</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Open the verification link we sent to your email. Once it is confirmed, continue to your
            workspace setup.
          </p>
          <Link
            className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
            href={returnTo}
          >
            Continue
          </Link>
          <form className="mt-8 border-t border-slate-200 pt-6" onSubmit={resend}>
            <label className="block space-y-2 text-sm font-medium" htmlFor="email">
              Need another link?
              <input
                autoComplete="email"
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                id="email"
                maxLength={254}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                required
                type="email"
                value={email}
              />
            </label>
            {notice && (
              <p aria-live="polite" className="mt-3 text-sm text-emerald-800" role="status">
                {notice}
              </p>
            )}
            {error && (
              <p aria-live="polite" className="mt-3 text-sm text-red-800" role="alert">
                {error}
              </p>
            )}
            <Button className="mt-4 w-full" disabled={busy} type="submit">
              {busy ? 'Sending…' : 'Resend verification link'}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-600">
            <Link className="font-medium text-blue-800 hover:underline" href="/auth/login">
              Return to sign in
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
