'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Card, PageHeader } from '@salesmora/ui';
import { authClient } from '../../../lib/auth-client';
import { useWorkspace } from '../../../features/workspace/workspace-context';

export default function AccountPage() {
  const { identity, refresh } = useWorkspace();
  const [name, setName] = useState(identity.user.name);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await authClient.updateUser({ name: name.trim() });
      if (result.error) setError('We could not update your name. Please try again.');
      else {
        await refresh();
        setNotice('Your account details were updated.');
      }
    } catch {
      setError('We could not update your name. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Settings"
        title="Account"
        description="Manage the profile information associated with your Salesmora sign-in."
      />
      <Card className="mt-6">
        <form className="space-y-5" onSubmit={submit}>
          <label className="block space-y-2 text-sm font-medium" htmlFor="account-name">
            Full name
            <input
              autoComplete="name"
              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              id="account-name"
              maxLength={255}
              minLength={2}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
          <div className="space-y-1 text-sm">
            <p className="font-medium">Email</p>
            <p className="text-slate-600">{identity.user.email}</p>
            <p className="text-xs text-slate-500">
              {identity.emailVerified ? 'Verified' : 'Verification required'}
            </p>
          </div>
          {error && (
            <p aria-live="polite" className="text-sm text-red-800" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p aria-live="polite" className="text-sm text-emerald-800" role="status">
              {notice}
            </p>
          )}
          <Button disabled={busy} type="submit">
            {busy ? 'Saving…' : 'Save profile'}
          </Button>
        </form>
      </Card>
    </section>
  );
}
