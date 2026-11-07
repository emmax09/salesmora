'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { ApiClientError } from '@salesmora/api-client';
import { Button, TextArea, TextField } from '@salesmora/ui';
import { salesmoraApi } from '../../lib/api';

export function ContactForm() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await salesmoraApi.submitContact({
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        subject: String(form.get('subject') ?? ''),
        message: String(form.get('message') ?? ''),
        website: String(form.get('website') ?? ''),
      });
      event.currentTarget.reset();
      setMessage(
        'Your message has been saved. Our email delivery is not configured, so we cannot send a reply confirmation yet.',
      );
    } catch (caught) {
      setError(
        caught instanceof ApiClientError && caught.statusCode === 400
          ? 'Check your details and message length, then submit again.'
          : 'We could not save your message. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input autoComplete="off" id="contact-website" name="website" tabIndex={-1} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          autoComplete="name"
          id="contact-name"
          label="Your name"
          maxLength={120}
          name="name"
          required
        />
        <TextField
          autoComplete="email"
          id="contact-email"
          label="Email address"
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </div>
      <TextField id="contact-subject" label="Subject" maxLength={160} name="subject" required />
      <TextArea
        id="contact-message"
        label="Message"
        maxLength={4000}
        minLength={20}
        name="message"
        required
      />
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
      <Button loading={busy} type="submit">
        Save message
      </Button>
      <p className="text-xs leading-5 text-muted">
        Messages are stored for review. A staffed support inbox and automatic replies are not
        configured.
      </p>
    </form>
  );
}
