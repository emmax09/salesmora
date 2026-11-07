'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiClientError } from '@salesmora/api-client';
import { Button, Card } from '@salesmora/ui';
import { safeReturnPath } from '../../lib/auth-client';
import { salesmoraApi } from '../../lib/api';

export function InvitationAcceptance() {
  return (
    <Suspense
      fallback={<p className="p-10 text-center text-sm text-slate-600">Loading invitation…</p>}
    >
      <InvitationContent />
    </Suspense>
  );
}

function InvitationContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const returnTo = safeReturnPath(`/auth/accept-invitation?token=${encodeURIComponent(token)}`);

  useEffect(() => {
    let active = true;
    void salesmoraApi.getIdentity().then(
      () => {
        if (active) setAuthenticated(true);
      },
      (caught: unknown) => {
        if (!active) return;
        if (caught instanceof ApiClientError && caught.statusCode === 401) setAuthenticated(false);
        else {
          setAuthenticated(false);
          setError('We could not check your sign-in status. Please try again.');
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);

  async function accept() {
    setBusy(true);
    setError('');
    try {
      await salesmoraApi.acceptInvitation(token);
      router.replace('/workspace');
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiClientError ? caught.message : 'We could not accept this invitation.',
      );
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
          <p className="text-sm font-medium text-blue-700">Team invitation</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Join an organization</h1>
          {!token ? (
            <p className="mt-4 text-sm text-slate-600">This invitation link is incomplete.</p>
          ) : authenticated === null ? (
            <p className="mt-4 text-sm text-slate-600">Checking your account…</p>
          ) : authenticated ? (
            <div className="mt-5 space-y-4">
              <p className="text-sm leading-6 text-slate-600">
                Accept the invitation to add the organization to your workspace list.
              </p>
              {error && (
                <p
                  aria-live="polite"
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <Button className="w-full" disabled={busy} onClick={() => void accept()}>
                {busy ? 'Accepting…' : 'Accept invitation'}
              </Button>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <p className="text-sm leading-6 text-slate-600">
                Sign in with the invited email address, or create an account to continue.
              </p>
              {error && (
                <p
                  aria-live="polite"
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <Link
                className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
                href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
              >
                Sign in
              </Link>
              <Link
                className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
                href={`/auth/register?returnTo=${encodeURIComponent(returnTo)}`}
              >
                Create account
              </Link>
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}
