'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { ApiClientError } from '@salesmora/api-client';
import { Button, SelectField, TextField } from '@salesmora/ui';
import { salesmoraApi } from '../../lib/api';

export function EarlyAccessForm() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    const form = new FormData(event.currentTarget);
    if (form.get('consent') !== 'on') {
      setError('Accept the privacy notice to request early access.');
      setBusy(false);
      return;
    }
    try {
      await salesmoraApi.submitEarlyAccess({
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        organization: String(form.get('organization') ?? '') || undefined,
        interest: (String(form.get('interest') ?? '') || undefined) as
          'Inbox' | 'Sales' | 'AI assistance' | 'Operations' | 'Other' | undefined,
        consent: true,
        website: String(form.get('website') ?? ''),
      });
      event.currentTarget.reset();
      setMessage(
        'You’re on the early access list. We do not have confirmation emails configured yet.',
      );
    } catch (caught) {
      setError(
        caught instanceof ApiClientError && caught.statusCode === 400
          ? 'Check the fields above and accept the privacy notice.'
          : 'We could not save your request. Please try again in a little while.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="early-website">Website</label>
        <input autoComplete="off" id="early-website" name="website" tabIndex={-1} />
      </div>
      <TextField
        autoComplete="name"
        id="early-name"
        label="Your name"
        maxLength={120}
        name="name"
        required
      />
      <TextField
        autoComplete="email"
        id="early-email"
        label="Work email"
        maxLength={254}
        name="email"
        required
        type="email"
      />
      <TextField
        autoComplete="organization"
        id="early-organization"
        label="Organization (optional)"
        maxLength={120}
        name="organization"
      />
      <SelectField id="early-interest" label="What are you most interested in?" name="interest">
        <option value="">Choose an area</option>
        <option>Inbox</option>
        <option>Sales</option>
        <option>AI assistance</option>
        <option>Operations</option>
        <option>Other</option>
      </SelectField>
      <label className="flex items-start gap-3 text-sm leading-6 text-secondary">
        <input
          className="mt-1 size-4 shrink-0 accent-action"
          name="consent"
          required
          type="checkbox"
        />
        <span>
          I agree that Salesmora may store my details and contact me about early access. See the{' '}
          <a className="font-medium text-action underline underline-offset-4" href="/privacy">
            privacy notice
          </a>
          .
        </span>
      </label>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p
          aria-live="polite"
          className="rounded-control border border-success/30 bg-success-bg p-3 text-sm text-success"
          role="status"
        >
          {message}
        </p>
      ) : null}
      <Button className="w-full sm:w-auto" loading={busy} type="submit">
        Request early access
      </Button>
      <p className="text-xs leading-5 text-muted">
        Your request is saved securely in the Salesmora database. We do not send confirmation email
        yet.
      </p>
    </form>
  );
}
