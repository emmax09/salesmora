'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '@salesmora/api-client';
import { Button, Card, PageHeader } from '@salesmora/ui';
import { salesmoraApi } from '../../lib/api';
import {
  defaultCurrencyForCountry,
  currencyOptions,
  getCountryOptions,
  industryOptions,
  timezoneOptions,
} from './workspace-options';

const labelClass = 'block space-y-2 text-sm font-medium text-slate-800';
const selectClass =
  'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100';

export function OnboardingForm() {
  const router = useRouter();
  const countries = useMemo(() => getCountryOptions(), []);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Other');
  const [country, setCountry] = useState('NG');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [currency, setCurrency] = useState('NGN');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await salesmoraApi.getIdentity();
        const result = await salesmoraApi.listOrganizations();
        if (!active) return;
        if (result.organizations.length > 0) router.replace('/workspace');
      } catch (caught: unknown) {
        if (!active) return;
        if (caught instanceof ApiClientError && caught.statusCode === 401) {
          router.replace(`/auth/login?returnTo=${encodeURIComponent('/onboarding')}`);
        } else setError('We could not check your account. Please reload and try again.');
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await salesmoraApi.createOrganization({
        name,
        industry,
        country,
        timezone,
        defaultCurrency: currency,
      });
      router.replace('/workspace');
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiClientError
          ? caught.message
          : 'We could not create your workspace. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
      <header className="mb-12 flex items-center justify-between border-b border-slate-200 pb-5">
        <Link className="text-lg font-semibold tracking-tight text-slate-950" href="/">
          Salesmora
        </Link>
        <span className="text-sm text-slate-500">Workspace setup · 1 of 1</span>
      </header>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow="Get started"
          title="Tell us about your business"
          description="This creates your organization and gives your account its owner role. You can update these details later."
        />
        <Card className="mt-8 p-6 sm:p-8">
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
            <label className={`${labelClass} sm:col-span-2`} htmlFor="business-name">
              Business name
              <input
                autoComplete="organization"
                className={selectClass}
                id="business-name"
                maxLength={120}
                minLength={2}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
            <label className={labelClass} htmlFor="industry">
              Industry
              <select
                className={selectClass}
                id="industry"
                onChange={(event) => setIndustry(event.target.value)}
                value={industry}
              >
                {industryOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className={labelClass} htmlFor="country">
              Country
              <select
                className={selectClass}
                id="country"
                onChange={(event) => {
                  setCountry(event.target.value);
                  setCurrency(defaultCurrencyForCountry(event.target.value));
                }}
                value={country}
              >
                {countries.map(({ code, name: countryName }) => (
                  <option key={code} value={code}>
                    {countryName}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass} htmlFor="timezone">
              Time zone
              <select
                className={selectClass}
                id="timezone"
                onChange={(event) => setTimezone(event.target.value)}
                value={timezone}
              >
                {timezoneOptions.map((zone) => (
                  <option key={zone}>{zone}</option>
                ))}
              </select>
            </label>
            <label className={labelClass} htmlFor="currency">
              Default currency
              <select
                className={selectClass}
                id="currency"
                onChange={(event) => setCurrency(event.target.value)}
                value={currency}
              >
                {currencyOptions.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </label>
            {error && (
              <p
                aria-live="polite"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 sm:col-span-2"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
              <Button disabled={busy} type="submit">
                {busy ? 'Creating workspace…' : 'Create workspace'}
              </Button>
            </div>
          </form>
        </Card>
        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          Workspace creation is retried safely if your connection drops.
        </p>
      </div>
    </main>
  );
}
