'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@salesmora/ui';
import { authClient, safeReturnPath } from '../../lib/auth-client';

type AuthMode = 'login' | 'register';

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const registering = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    const returnTo = safeReturnPath(new URLSearchParams(window.location.search).get('returnTo'));
    try {
      if (registering) {
        const callbackURL = new URL('/auth/verify-email', window.location.origin);
        callbackURL.searchParams.set(
          'returnTo',
          returnTo === '/workspace' ? '/onboarding' : returnTo,
        );
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          callbackURL: callbackURL.toString(),
        });
        if (result.error) {
          setNotice(
            'If we can create the account, we will send a verification link to that address.',
          );
          return;
        }
        setNotice('Check your inbox for a verification link to finish creating your account.');
      } else {
        const result = await authClient.signIn.email({
          email: email.trim().toLowerCase(),
          password,
          callbackURL: returnTo,
        });
        if (result.error) {
          setError('We could not sign you in. Check your details and verify your email address.');
          return;
        }
        router.replace(returnTo);
        router.refresh();
      }
    } catch {
      setError('We could not complete that request. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8"
    >
      <header className="flex h-20 items-center border-b border-slate-200">
        <Link aria-label="Salesmora home" className="text-lg font-semibold tracking-tight" href="/">
          Salesmora
        </Link>
      </header>
      <section className="flex flex-1 items-center justify-center py-12">
        <Card className="w-full max-w-md p-7 sm:p-8">
          <p className="text-sm font-medium text-blue-700">Salesmora account</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {registering ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {registering
              ? 'Set up your account first. You will create a workspace after verifying your email.'
              : 'Sign in to continue to your workspaces.'}
          </p>

          <form className="mt-7 space-y-5" onSubmit={submit}>
            {registering && (
              <label className="block space-y-2 text-sm font-medium text-slate-800" htmlFor="name">
                Full name
                <input
                  autoComplete="name"
                  className="min-h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  id="name"
                  maxLength={255}
                  minLength={2}
                  onChange={(event) => setName(event.target.value)}
                  required
                  value={name}
                />
              </label>
            )}
            <label className="block space-y-2 text-sm font-medium text-slate-800" htmlFor="email">
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
            <label
              className="block space-y-2 text-sm font-medium text-slate-800"
              htmlFor="password"
            >
              Password
              <div className="flex min-h-11 overflow-hidden rounded-lg border border-slate-300 focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  autoComplete={registering ? 'new-password' : 'current-password'}
                  className="min-w-0 flex-1 px-3 font-normal outline-none"
                  id="password"
                  maxLength={128}
                  minLength={registering ? 12 : 1}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <button
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="px-3 text-xs font-medium text-slate-600 hover:text-slate-950"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {registering && (
                <span className="block text-xs font-normal text-slate-500">
                  Use at least 12 characters.
                </span>
              )}
            </label>
            {!registering && (
              <div className="-mt-2 text-right">
                <Link
                  className="text-sm font-medium text-blue-800 hover:underline"
                  href="/auth/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
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
            {notice && (
              <p
                aria-live="polite"
                className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900"
                role="status"
              >
                {notice}
              </p>
            )}
            <Button className="w-full" disabled={busy} type="submit">
              {busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {registering ? 'Already have an account?' : 'New to Salesmora?'}{' '}
            <Link
              className="font-medium text-blue-800 underline-offset-4 hover:underline"
              href={registering ? '/auth/login' : '/auth/register'}
            >
              {registering ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
